#!/usr/bin/env sh
set -eu
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"
cd "$raiz/testes-web-e2e"
if [ ! -d node_modules ]; then
  echo "node_modules nao encontrado. Execute scripts/bootstrap.sh primeiro."
  exit 1
fi
npm run cy:run
