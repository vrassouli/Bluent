param(
    [string]$LabSourceRoot = 'C:\Projects\Bluent-issue421',
    [ValidateSet('file-upload', 'pointer-scroll', 'button-keyboard')]
    [string]$Scenario = 'file-upload'
)
$ErrorActionPreference = 'Stop'
# Audit-only runner: publish unmodified #421 InteractiveServer to a disposable
# folder. The Node probe manages its isolated localhost host, Chrome and fake files.
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$labRoot = (Resolve-Path $LabSourceRoot).Path
$published = Join-Path $env:TEMP ('bluent552-published-server-' + [guid]::NewGuid().ToString('N'))
$project = Join-Path $labRoot 'src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj'
$prior = $env:BLUENT_V3_552_PUBLISHED_DIR
try {
    Write-Output "#552 publishing current #421 Server source to isolated $published"
    & dotnet publish $project -c Release --no-restore -o $published -v quiet
    if ($LASTEXITCODE -ne 0) { throw "Server publish failed: $LASTEXITCODE" }
    $entry = Join-Path $published 'Bluent.UI.Demo.SSR.dll'
    if (-not (Test-Path $entry)) { throw "Published Server entry missing" }
    $env:BLUENT_V3_552_PUBLISHED_DIR = $published
    Push-Location $repo
    try {
        & node scripts/quality/probe_v3_bluent_lab_reference.mjs $labRoot docs/v3/quality/evidence $Scenario Server
        if ($LASTEXITCODE -ne 0) { throw "Browser $Scenario probe failed: $LASTEXITCODE" }
    }
    finally { Pop-Location }
}
finally {
    $env:BLUENT_V3_552_PUBLISHED_DIR = $prior
    if (Test-Path $published) {
        Remove-Item -LiteralPath $published -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Output "#552 published directory cleanup: remaining=$([bool](Test-Path $published))"
}