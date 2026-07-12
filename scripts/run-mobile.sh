#!/usr/bin/env sh
set -eu
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec "$diretorio_script/executar-mobile.sh" "$@"
