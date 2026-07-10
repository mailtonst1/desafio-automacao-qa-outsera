#!/usr/bin/env sh
set -eu
script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root="$(dirname "$script_dir")"
cd "$root/web-e2e"
if [ ! -d node_modules ]; then
  echo "node_modules not found. Run scripts/bootstrap.sh first."
  exit 1
fi
npm run cy:run

