param(
  [ValidateSet('fumaca', 'carga')]
  [string]$Perfil = 'fumaca'
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:3000' }
$hostPermitido = ([uri]$baseUrl).Host -in @('localhost', '127.0.0.1', 'serverest')
if (-not $hostPermitido) { throw "BASE_URL nao permitida: $baseUrl" }

$servico = if ($Perfil -eq 'fumaca') { 'k6-fumaca' } else { 'k6-carga' }
try {
  docker compose -f "$raiz\compose.yaml" up -d serverest --wait
  docker compose -f "$raiz\compose.yaml" --profile "k6-$Perfil" run --rm $servico
  $codigo = $LASTEXITCODE
  Get-Content "$raiz\testes-performance\relatorios\summary.txt" -ErrorAction SilentlyContinue
  exit $codigo
} finally {
  docker compose -f "$raiz\compose.yaml" down --remove-orphans
}
