$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location "$raiz\testes-web-e2e"
if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "node_modules nao encontrado. Execute scripts/bootstrap.ps1 primeiro."
  exit 1
}
npm run cy:run
Pop-Location
