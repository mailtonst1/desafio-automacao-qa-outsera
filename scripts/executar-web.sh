#!/usr/bin/env sh
set -eu

modo="${1:-regressao}"
usar_docker="${2:-}"
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"

if [ "$usar_docker" = "--docker" ]; then
  docker compose --profile web build testes-web
  docker compose --profile web run --rm -e "MODO_WEB=$modo" testes-web
  exit $?
fi

cd "$raiz/testes-web-e2e"
npm run "$modo"
