# PowerShell wrapper to launch the Windows `run-all.bat` launcher in a new cmd window
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$batPath = Join-Path $scriptRoot "..\run-all.bat"

if (-Not (Test-Path $batPath)) {
  Write-Error "run-all.bat not found at $batPath"
  exit 1
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$batPath`"" -WorkingDirectory (Resolve-Path $scriptRoot\..)
