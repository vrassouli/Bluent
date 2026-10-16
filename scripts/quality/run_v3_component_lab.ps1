param(
    [string]$BaseUrl = "http://127.0.0.1:5279"
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$log = Join-Path $env:TEMP "bluent-v3-421-wasm-stdout.log"
$errLog = Join-Path $env:TEMP "bluent-v3-421-wasm-stderr.log"
$project = Join-Path $repo "src\Bluent.UI.Demo\Bluent.UI.Demo.csproj"
$server = $null
try {
    $server = Start-Process dotnet -ArgumentList @(
       "run", "--project", $project, "-c", "Debug", "--no-build",
       "--no-launch-profile", "--urls", $BaseUrl
    ) -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $errLog
    $ready = $false
    for($i = 0; $i -lt 90; $i++) {
        if($server.HasExited) { throw "QA WebAssembly host exited unexpectedly" }
        try {
            $res = Invoke-WebRequest ($BaseUrl + "/component-lab") -UseBasicParsing -TimeoutSec 2
            if($res.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 350
    }
    if(-not $ready) { throw "QA WebAssembly host not available at $BaseUrl. See $log" }
    Write-Output "QA dedicated WebAssembly host ready: $BaseUrl"
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
    # Cleanup is deliberately limited to disposable browser profiles
    # created by this #421 QA probe. Never target users' Chrome sessions.
    $owned = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
        Where-Object { $_.CommandLine -and
                       $_.CommandLine.Contains("bluent-v3-421-lab-") })
    foreach($process in $owned) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 350
    $remaining = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
        Where-Object { $_.CommandLine -and
                       $_.CommandLine.Contains("bluent-v3-421-lab-") })
    Write-Output "QA browser cleanup: owned=$($owned.Count), remaining=$($remaining.Count)"
    if($remaining.Count -eq 0) {
        Get-ChildItem -Path $env:TEMP -Directory -Filter "bluent-v3-421-lab-*" -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }

}
