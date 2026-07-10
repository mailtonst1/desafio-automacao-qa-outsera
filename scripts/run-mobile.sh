#!/usr/bin/env sh
set -eu
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"
cd "$raiz/testes-mobile"
mvn test
