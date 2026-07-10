param(
  [ValidateSet("smoke", "regressao", "relatorio")]
  [string]$Modo = "regressao",
  [switch]$Docker
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

if ($Docker) {
  docker compose --profile web build testes-web
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  docker compose --profile web run --rm -e "MODO_WEB=$Modo" testes-web
  exit $LASTEXITCODE
}

Push-Location "$raiz\testes-web-e2e"
try {
  npm run $Modo
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
