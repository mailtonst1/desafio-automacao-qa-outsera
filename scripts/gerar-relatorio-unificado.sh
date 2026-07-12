#!/usr/bin/env sh
set -eu
raiz="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$raiz/relatorio-unificado"
npm run preparar -- --api "$raiz/testes-api/target/allure-results" --web "$raiz/testes-web-e2e/allure-results" --mobile "$raiz/testes-mobile/target/allure-results"
[ -f "$raiz/testes-performance/relatorios/fumaca/summary.json" ] && npm run converter-k6 -- --origem "$raiz/testes-performance/relatorios/fumaca" --destino "$PWD/temporario" --perfil Fumaca
[ -f "$raiz/testes-performance/relatorios/carga/summary.json" ] && npm run converter-k6 -- --origem "$raiz/testes-performance/relatorios/carga" --destino "$PWD/temporario" --perfil "Carga de 500 usuarios"
npm run gerar
