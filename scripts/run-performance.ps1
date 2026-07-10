$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$cenario = "$raiz\testes-performance\cenarios\smoke.js"
if (-not (Test-Path -LiteralPath $cenario)) {
  Write-Host "Os cenarios de performance nao foram implementados nesta fase."
  exit 1
}
k6 run $cenario
