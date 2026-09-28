$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$marker = Join-Path $projectRoot 'tmp\runtime\server.pid'
if (-not (Test-Path -LiteralPath $marker)) {
    Write-Host 'No background Packora process is recorded. For a foreground server, press Ctrl+C in its terminal.'
    exit 0
}
$serverId = [int](Get-Content -LiteralPath $marker -Raw).Trim()
$server = Get-CimInstance Win32_Process -Filter "ProcessId=$serverId"
if (-not $server) { Write-Host 'The recorded background server has already stopped.'; exit 0 }
$expectedExecutable = Join-Path $projectRoot '.venv\Scripts\python.exe'
if (-not $server.CommandLine.Contains($expectedExecutable) -or -not $server.CommandLine.Contains('-m uvicorn backend.main:app')) {
    throw 'The recorded process no longer matches this project. Refusing to stop it.'
}
# Windows venv Python can launch one child interpreter. Only stop children of the verified process running this module.
$children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$serverId"
foreach ($child in $children) {
    if ($child.CommandLine -and $child.CommandLine.Contains('-m uvicorn backend.main:app')) {
        Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue
    }
}
Stop-Process -Id $serverId -ErrorAction SilentlyContinue
Write-Host 'Stopped the recorded local Packora background server. Run start-local.cmd to reopen it.'
