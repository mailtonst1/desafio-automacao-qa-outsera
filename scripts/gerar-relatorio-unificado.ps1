$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location "$raiz\relatorio-unificado"
try {
  npm run preparar -- --api "$raiz\testes-api\target\allure-results" --web "$raiz\testes-web-e2e\allure-results" --mobile "$raiz\testes-mobile\target\allure-results"
  if (Test-Path "$raiz\testes-performance\relatorios\fumaca\summary.json") { npm run converter-k6 -- --origem "$raiz\testes-performance\relatorios\fumaca" --destino "$PWD\temporario" --perfil 'Fumaca' }
  if (Test-Path "$raiz\testes-performance\relatorios\carga\summary.json") { npm run converter-k6 -- --origem "$raiz\testes-performance\relatorios\carga" --destino "$PWD\temporario" --perfil 'Carga de 500 usuarios' }
  npm run gerar
} finally {
  Pop-Location
}
