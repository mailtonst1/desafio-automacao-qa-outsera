#!/usr/bin/env sh
set -eu
script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
"$script_dir/executar-api.sh"
"$script_dir/run-web.sh"
"$script_dir/run-mobile.sh"
"$script_dir/run-performance.sh"
