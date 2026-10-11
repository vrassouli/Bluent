# #417: Published SSR static asset smoke in temporary output; no deployment/release.
# Run: pwsh -NoProfile -File scripts/quality/probe_v3_ssr_publish.ps1
[CmdletBinding()]
param(
    [int]$Port = 5098,
    [int]$StartupTimeoutSeconds = 65
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$project = Join-Path $root "src\Bluent.UI.Demo.SSR\Bluent.UI.Demo.SSR.csproj"
$out = Join-Path ([System.IO.Path]::GetTempPath()) ("bluent-v3-417-ssr-smoke-" + [Guid]::NewGuid().ToString("N"))
$process = $null
$client = $null
$oldEnv = $env:ASPNETCORE_ENVIRONMENT
$oldUrls = $env:ASPNETCORE_URLS
try {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
        throw "Port $Port is occupied; choose another -Port"
    }
    New-Item -ItemType Directory -Path $out -Force | Out-Null
    & dotnet publish $project -c Release --no-restore --nologo -v:q -o $out
    if ($LASTEXITCODE -ne 0) { throw "dotnet publish failed: exit $LASTEXITCODE" }
    $dll = Join-Path $out "Bluent.UI.Demo.SSR.dll"
    if (!(Test-Path $dll)) { throw "Published DLL missing" }
    $cssFiles = @(Get-ChildItem -Path $out -Recurse -File -Filter "bluent.ui.components.min.css")
    if ($cssFiles.Count -lt 1 -or $cssFiles[0].Length -lt 100) { throw "Published CSS asset missing or empty" }
    $env:ASPNETCORE_ENVIRONMENT = "Production"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"
    $process = Start-Process -FilePath "dotnet" -ArgumentList @('"' + $dll + '"') -PassThru -WindowStyle Hidden -WorkingDirectory $out -RedirectStandardOutput (Join-Path $out "host.stdout.log") -RedirectStandardError (Join-Path $out "host.stderr.log")
    $origin = "http://127.0.0.1:$Port"
    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(6)
    $checks = [ordered]@{}
    foreach ($entry in @(
        @{ Name="styling_lab"; Path="/v3/styling-lab"; Marker="data-bui-v3-tokens"; Type="text/html" },
        @{ Name="components_css"; Path="/_content/Bluent.UI/bluent.ui.components.min.css"; Marker=".bui-"; Type="text/css" },
        @{ Name="v3_token_demo_css"; Path="/_content/Bluent.UI.Demo.Pages/v3/issue-418.opt-in.preview.css"; Marker="--bui-v3-button-background-primary"; Type="text/css" },
        @{ Name="blazor_js"; Path="/_framework/blazor.web.js"; Marker="Blazor"; Type="javascript" }
    )) {
        $url = "$origin$($entry.Path)"
        $response = $null
        $deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
        while (!$response -and (Get-Date) -lt $deadline) {
            if ($process.HasExited) { throw "Published Production host exited unexpectedly: $($process.ExitCode)" }
            try {
                $candidate = $client.GetAsync($url).GetAwaiter().GetResult()
                if ($candidate.IsSuccessStatusCode) { $response = $candidate }
                else { $candidate.Dispose(); Start-Sleep -Milliseconds 700 }
            }
            catch { Start-Sleep -Milliseconds 700 }
        }
        if (!$response) { throw "Timeout waiting for published Production host at $url" }
        try {
            $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            $type = [string]$response.Content.Headers.ContentType.MediaType
            if ([int]$response.StatusCode -ne 200) { throw "$($entry.Name): expected HTTP 200, got $([int]$response.StatusCode)" }
            if (!$type.ToLowerInvariant().Contains($entry.Type)) { throw "$($entry.Name): expected Content-Type containing $($entry.Type), got [$type]" }
            if ($body.Length -lt 100 -or !$body.Contains($entry.Marker)) { throw "$($entry.Name): payload missing marker or too short ($($body.Length) chars)" }
            $checks[$entry.Name] = @{ status=200; contentType=$type; characters=$body.Length }
        }
        finally { $response.Dispose() }
    }
    [ordered]@{
        classification="LOCAL PUBLISHED SSR STATIC-ASSET SMOKE; not actual remote deployment, interaction or full browser validation"
        configuration="Release publish / Production host"
        checks=$checks
        passed=$checks.Count
    } | ConvertTo-Json -Depth 8
}
finally {
    if ($client) { $client.Dispose() }
    if ($process) {
        try { if (!$process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction Stop; $process.WaitForExit(5000) | Out-Null } }
        catch { Write-Warning "Unable to stop local smoke host: $_" }
    }
    $env:ASPNETCORE_ENVIRONMENT = $oldEnv
    $env:ASPNETCORE_URLS = $oldUrls
    if (Test-Path $out) { Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue }
}