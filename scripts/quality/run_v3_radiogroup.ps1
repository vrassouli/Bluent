[CmdletBinding()]
param(
    [ValidateSet("WebAssembly", "Server")]
    [string]$Mode = "WebAssembly",
    [ValidateSet("Chrome", "Edge")]
    [string]$Browser = "Chrome"
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$qaId = [guid]::NewGuid().ToString('N')
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
try { $listener.Start(); $port = $listener.LocalEndpoint.Port } finally { $listener.Stop() }
$base = "http://127.0.0.1:$port"
$project = if ($Mode -eq 'Server') { Join-Path $repo 'src\Bluent.UI.Demo.SSR\Bluent.UI.Demo.SSR.csproj' } else { Join-Path $repo 'src\Bluent.UI.Demo\Bluent.UI.Demo.csproj' }
$log = Join-Path $env:TEMP "bluent-v3-436-radio-$qaId.out.log"
$err = Join-Path $env:TEMP "bluent-v3-436-radio-$qaId.err.log"
$evidenceDir = if ($env:BLUENT_RADIO_EVIDENCE_DIR) { $env:BLUENT_RADIO_EVIDENCE_DIR } else { Join-Path $repo 'docs\v3\quality\evidence' }
$evidenceFile = Join-Path $evidenceDir "$Browser-$Mode.json"
$demoProcess = $null
$published = $null
$oldEnvironment = $env:ASPNETCORE_ENVIRONMENT
$programFilesX86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
$browserPath = if ($Browser -eq 'Edge') {
    @("$programFilesX86\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
} else {
    @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "$programFilesX86\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $browserPath) { throw "$Browser executable not found" }
$profilePrefix = "bluent-v3-436-radiogroup-$qaId-"
try {
    New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null
    if ($Mode -eq 'Server') {
        $published = Join-Path $env:TEMP "bluent-v3-436-ssr-$qaId"
        & dotnet publish $project -c Release --no-restore -o $published -v quiet
        if ($LASTEXITCODE -ne 0) { throw 'SSR publish failed' }
        $env:ASPNETCORE_ENVIRONMENT = 'Production'
        $entry = Join-Path $published 'Bluent.UI.Demo.SSR.dll'
        $demoProcess = Start-Process dotnet -WorkingDirectory $published -ArgumentList @($entry, '--urls', $base) -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $err
        $route = '/compatibility/radios-server'
    } else {
        & dotnet build $project --configuration Debug --no-restore --nologo --verbosity quiet
        if ($LASTEXITCODE -ne 0) { throw 'WASM Demo build failed' }
        $demoProcess = Start-Process dotnet -WorkingDirectory $repo -ArgumentList @('run', '--project', $project, '-c', 'Debug', '--no-build', '--no-launch-profile', '--urls', $base) -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $err
        $route = '/components/radios'
    }
    $ready = $false
    for ($i=0; $i -lt 120; $i++) {
        if ($demoProcess.HasExited) { throw "Demo host exited before readiness; inspect $err" }
        try { $response = Invoke-WebRequest ($base + $route) -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { $ready = $true; break } } catch {}
        Start-Sleep -Milliseconds 400
    }
    if (-not $ready) { throw "Radio route did not become ready at $base$route; logs $log / $err" }
    $env:BROWSER_PATH = $browserPath
    $env:BLUENT_BROWSER_LABEL = $Browser
    $env:BLUENT_RADIO_RENDER_MODE = if ($Mode -eq 'Server') { 'InteractiveServer' } else { 'WebAssembly' }
    $env:BLUENT_RADIO_EVIDENCE_PATH = $evidenceFile
    $env:BLUENT_RADIO_PROFILE_PREFIX = $profilePrefix
    Push-Location $repo
    try { & node 'scripts/quality/probe_v3_radiogroup.mjs' $base; if ($LASTEXITCODE -ne 0) { throw 'RadioGroup browser probe failed' } }
    finally { Pop-Location }
}
finally {
    Remove-Item Env:BROWSER_PATH,Env:BLUENT_BROWSER_LABEL,Env:BLUENT_RADIO_RENDER_MODE,Env:BLUENT_RADIO_EVIDENCE_PATH,Env:BLUENT_RADIO_PROFILE_PREFIX -ErrorAction SilentlyContinue
    $env:ASPNETCORE_ENVIRONMENT = $oldEnvironment
    if ($demoProcess) { & taskkill.exe /PID $demoProcess.Id /T /F 2>$null | Out-Null }
    if ($published -and (Test-Path $published)) { Remove-Item $published -Recurse -Force -ErrorAction SilentlyContinue }
    $remaining = @()
    for ($attempt = 0; $attempt -lt 12; $attempt++) {
        $remaining = @(Get-CimInstance Win32_Process | Where-Object { $_.Name -in @('chrome.exe','msedge.exe') -and $_.CommandLine -like "*$profilePrefix*" })
        if ($remaining.Count -eq 0) { break }
        foreach ($item in $remaining) { Stop-Process -Id ([int]$item.ProcessId) -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Milliseconds 300
    }
    if ($remaining.Count -gt 0) { throw "QA browser cleanup incomplete after bounded retries: $($remaining.Count) run-owned browser processes remain" }
    if (Test-Path $log) { Write-Output "HOST LOG: $log"; Get-Content $log -Tail 80 }
    if (Test-Path $err) { Write-Output "HOST ERROR LOG: $err"; Get-Content $err -Tail 100 }
}
