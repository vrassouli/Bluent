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
$portListener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
try { $portListener.Start(); $port = $portListener.LocalEndpoint.Port } finally { $portListener.Stop() }
$base = "http://127.0.0.1:$port"
$project = if($Mode -eq 'Server') { Join-Path $repo 'src\Bluent.UI.Demo.SSR\Bluent.UI.Demo.SSR.csproj' } else { Join-Path $repo 'src\Bluent.UI.Demo\Bluent.UI.Demo.csproj' }
$log = Join-Path $env:TEMP "bluent-v3-433-$qaId.out.log"
$err = Join-Path $env:TEMP "bluent-v3-433-$qaId.err.log"
$published = $null
$demoProcess = $null
$oldEnv = $env:ASPNETCORE_ENVIRONMENT
$browserPath = if($Browser -eq 'Edge') { @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1 } else { "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" }
if(-not $browserPath -or -not (Test-Path $browserPath)) { throw "$Browser executable not found" }
try {
    if($Mode -eq 'Server') {
        $published = Join-Path $env:TEMP "bluent-v3-433-ssr-$qaId"
        & dotnet publish $project -c Release --no-restore -o $published -v quiet
        if($LASTEXITCODE -ne 0) { throw 'SSR publish failed' }
        $env:ASPNETCORE_ENVIRONMENT = 'Production'
        $entry = Join-Path $published 'Bluent.UI.Demo.SSR.dll'
        $demoProcess = Start-Process dotnet -WorkingDirectory $published -ArgumentList @($entry,'--urls',$base) -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $err
    } else {
        & dotnet build $project --configuration Debug --no-restore --nologo --verbosity quiet
        if($LASTEXITCODE -ne 0) { throw 'WASM Demo build failed' }
        $demoProcess = Start-Process dotnet -WorkingDirectory $repo -ArgumentList @('run','--project',$project,'-c','Debug','--no-build','--no-launch-profile','--urls',$base) -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $err
    }
    $ready = $false
    for($i=0;$i -lt 120;$i++) {
        if($demoProcess.HasExited) { throw "Demo host exited; inspect $err" }
        try { $response=Invoke-WebRequest ($base + '/components/numeric-fields') -UseBasicParsing -TimeoutSec 2; if($response.StatusCode -eq 200){$ready=$true;break} } catch {}
        Start-Sleep -Milliseconds 400
    }
    if(-not $ready) { throw "NumericFields route not served at $base; logs $log / $err" }
    $env:BROWSER_PATH = $browserPath
    $env:BLUENT_BROWSER_LABEL = $Browser
    $env:BLUENT_NUMERIC_RENDER_MODE = if($Mode -eq 'Server'){'InteractiveServer'}else{'WebAssembly'}
    Push-Location $repo
    try { & node 'scripts/quality/probe_v3_numericfield.mjs' $base; if($LASTEXITCODE -ne 0){throw 'NumericField browser probe failed'} }
    finally { Pop-Location }
}
finally {
    Remove-Item Env:BROWSER_PATH -ErrorAction SilentlyContinue
    Remove-Item Env:BLUENT_BROWSER_LABEL -ErrorAction SilentlyContinue
    Remove-Item Env:BLUENT_NUMERIC_RENDER_MODE -ErrorAction SilentlyContinue
    $env:ASPNETCORE_ENVIRONMENT = $oldEnv
    if($demoProcess -and -not $demoProcess.HasExited){Stop-Process -Id $demoProcess.Id -Force -ErrorAction SilentlyContinue}
    if($published -and (Test-Path $published)){Remove-Item $published -Recurse -Force -ErrorAction SilentlyContinue}
    if(Test-Path $log){Write-Output "HOST LOG: $log"}
    if(Test-Path $err){Write-Output "HOST ERROR LOG: $err"}
}
