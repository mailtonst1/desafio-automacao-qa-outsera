#!/usr/bin/env sh
set -eu
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"
cenario="$raiz/testes-performance/cenarios/smoke.js"
if [ ! -f "$cenario" ]; then
  echo "Os cenarios de performance nao foram implementados nesta fase."
  exit 1
fi
k6 run "$cenario"
