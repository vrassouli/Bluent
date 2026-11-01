param(
    [ValidateSet("WebAssembly", "Server")]
    [string]$Mode = "WebAssembly",
    [string]$BaseUrl = ""
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
# Isolate every Lab run's localhost port, log files and Chromium profiles.
$qaRunId = [guid]::NewGuid().ToString("N")
$profilePrefix = "bluent-v3-421-lab-$qaRunId-"
if(-not $BaseUrl) {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    try {
        $listener.Start()
        $port = $listener.LocalEndpoint.Port
    } finally { $listener.Stop() }
    $BaseUrl = "http://127.0.0.1:$port"
}
$env:BLUENT_V3_LAB_MODE = $Mode
$env:BLUENT_V3_LAB_PROFILE_PREFIX = $profilePrefix

$log = Join-Path $env:TEMP "bluent-v3-421-$qaRunId-stdout.log"
$errLog = Join-Path $env:TEMP "bluent-v3-421-$qaRunId-stderr.log"
$project = if($Mode -eq "Server") {
    Join-Path $repo "src\Bluent.UI.Demo.SSR\Bluent.UI.Demo.SSR.csproj"
} else { Join-Path $repo "src\Bluent.UI.Demo\Bluent.UI.Demo.csproj" }
$route = if($Mode -eq "Server") { "/compatibility/component-lab-server" } else { "/component-lab" }
$config = if($Mode -eq "Server") { "Release" } else { "Debug" }
$server = $null
$published = $null
try {
    if($Mode -eq "Server") {
        # Development-only static manifests can point at missing wwwroot
        # framework files. Publish actual Production SSR assets instead.
        $published = Join-Path $env:TEMP ("bluent-v3-421-ssr-" + [guid]::NewGuid().ToString("N"))
        & dotnet publish $project -c Release --no-restore -o $published -v quiet
        if($LASTEXITCODE -ne 0) { throw "SSR publish failed" }
        $entry = Join-Path $published "Bluent.UI.Demo.SSR.dll"
        if(-not (Test-Path $entry)) { throw "SSR publish assembly missing" }
        $env:ASPNETCORE_ENVIRONMENT = "Production"
        $arguments = @($entry, "--urls", $BaseUrl)
    } else {
        # Always rebuild current source. A previous no-build launch could
        # silently test stale Razor/Component Lab fixtures on local Dev01.
        # CI also uses this self-contained source-owning runner.
        & dotnet build $project --configuration $config --no-restore --nologo --verbosity quiet
        if($LASTEXITCODE -ne 0) { throw "Current WebAssembly demo build failed" }
        $arguments = @("run", "--project", $project, "-c", $config,
                       "--no-build", "--no-launch-profile", "--urls", $BaseUrl)
    }
    # Published ASP.NET Core static-web-asset endpoints resolve relative to the host content root.
    # Launch from the publish directory, not the repository root, or bootstrap assets may be empty.
    $hostDirectory = if($Mode -eq "Server") { $published } else { $repo }
    $server = Start-Process dotnet -WorkingDirectory $hostDirectory -ArgumentList $arguments -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $errLog
    $ready = $false
    for($i = 0; $i -lt 90; $i++) {
        if($server.HasExited) { throw "QA $Mode host exited unexpectedly" }
        try {
            $res = Invoke-WebRequest ($BaseUrl + $route) -UseBasicParsing -TimeoutSec 2
            if($res.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 350
    }
    if(-not $ready) { throw "QA $Mode host not available at $BaseUrl. See $log" }
    Write-Output "QA dedicated $Mode host ready: $BaseUrl"
    Push-Location $repo
    try {
        & node scripts/quality/probe_v3_component_lab.mjs $BaseUrl
        if($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally { Pop-Location }
}
finally {
    if($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    }
    if($published -and (Test-Path $published)) {
        Remove-Item -LiteralPath $published -Recurse -Force -ErrorAction SilentlyContinue
    }
    # Cleanup is deliberately limited to disposable browser profiles
    # created by this #421 QA probe. Never target users' Chrome sessions.
    $owned = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe'" |
        Where-Object { $_.CommandLine -and
                       $_.CommandLine.Contains($profilePrefix) })
    foreach($process in $owned) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
    # Windows Chromium descendants may release their profile shortly after
    # their parent exits. Bound the wait to five seconds, and only inspect
    # THIS invocation's GUID-scoped processes. Never mask a real leak.
    $remaining = @()
    for($attempt = 0; $attempt -lt 20; $attempt++) {
        $remaining = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe'" |
            Where-Object { $_.CommandLine -and
                           $_.CommandLine.Contains($profilePrefix) })
        if($remaining.Count -eq 0) { break }
        foreach($process in $remaining) {
            Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Milliseconds 250
    }
    Write-Output "QA browser cleanup: owned=$($owned.Count), remaining=$($remaining.Count)"
    if($remaining.Count -eq 0) {
        Get-ChildItem -Path $env:TEMP -Directory -Filter "$profilePrefix*" -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        throw "QA owned Chromium cleanup incomplete: $($remaining.Count) browser processes remain"
    }

}
