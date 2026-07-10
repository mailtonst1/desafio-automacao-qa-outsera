$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location "$root\web-e2e"
if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "node_modules not found. Run scripts/bootstrap.ps1 first."
  exit 1
}
npm run cy:run
Pop-Location

