param(
    [switch]$Setup,
    [switch]$Build,
    [ValidateRange(1024,65535)][int]$Port = 8000
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

function Assert-LastExit([string]$Operation) {
    if ($LASTEXITCODE -ne 0) { throw "$Operation failed with exit code $LASTEXITCODE." }
}

$pythonPath = Join-Path $projectRoot '.venv\Scripts\python.exe'
$bundledRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
if ($Setup) {
    if (-not (Test-Path -LiteralPath $pythonPath)) {
        $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
        $bootstrapPython = if ($pythonCommand) { $pythonCommand.Source } else { Join-Path $bundledRuntime 'python\python.exe' }
        if (-not (Test-Path -LiteralPath $bootstrapPython)) { throw 'Install Python 3.12 or newer, then run this command again.' }
        & $bootstrapPython -m venv .venv
        Assert-LastExit 'Virtual environment creation'
    }
    & $pythonPath -m pip install -r requirements.lock.txt
    Assert-LastExit 'Python dependency installation'
}
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Project environment is missing. Run .\scripts\start.ps1 -Setup first.' }

if ($Setup -or $Build) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $nodePath = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $bundledRuntime 'node\bin\node.exe' }
    if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Install Node.js 22.12+ (or 24 LTS), then run -Setup again.' }
    $env:PATH = (Split-Path -Parent $nodePath) + ';' + $env:PATH
    Push-Location -LiteralPath (Join-Path $projectRoot 'frontend')
    try {
        if ($Setup) {
            $pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
            if ($pnpmCommand) {
                & $pnpmCommand.Source install --frozen-lockfile
            } else {
                $pnpmScript = Join-Path $bundledRuntime 'node\node_modules\pnpm\bin\pnpm.cjs'
                if (-not (Test-Path -LiteralPath $pnpmScript)) { throw 'Install pnpm 11.19.0 (npm install -g pnpm@11.19.0), then rerun -Setup.' }
                & $nodePath $pnpmScript install --frozen-lockfile
            }
            Assert-LastExit 'Frontend dependency installation'
        }
        & $nodePath node_modules/typescript/bin/tsc -b
        Assert-LastExit 'TypeScript validation'
        & $nodePath node_modules/vite/bin/vite.js build
        Assert-LastExit 'Frontend build'
    } finally { Pop-Location }
}
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'frontend\dist\index.html'))) { throw 'Frontend build is missing. Run .\scripts\start.ps1 -Setup first.' }

$healthUrl = "http://127.0.0.1:$Port/api/health"
try {
    $existing = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
    if ($existing.engine_version -and $existing.catalog_hash) {
        Write-Host "Packora is already running at http://127.0.0.1:$Port" -ForegroundColor Green
        exit 0
    }
} catch { }
Write-Host "Packora local workspace: http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host 'Keep this terminal open. Press Ctrl+C to stop. No deployment is performed.'
& $pythonPath -m uvicorn backend.main:app --host 127.0.0.1 --port $Port
Assert-LastExit 'Local server'
