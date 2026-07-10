#!/usr/bin/env sh
set -eu
script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root="$(dirname "$script_dir")"
scenario="$root/performance-tests/scenarios/smoke.js"
if [ ! -f "$scenario" ]; then
  echo "Performance scenarios are not implemented in this phase."
  exit 1
fi
k6 run "$scenario"

