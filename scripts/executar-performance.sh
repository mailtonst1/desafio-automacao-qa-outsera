#!/usr/bin/env sh
set -u

perfil="${1:-fumaca}"
case "$perfil" in fumaca|carga) ;; *) echo "Perfil invalido: $perfil" >&2; exit 2;; esac
raiz="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
base_url="${BASE_URL:-http://localhost:3000}"
host="$(printf '%s' "$base_url" | sed -E 's#^[a-z]+://([^/:]+).*#\1#')"
case "$host" in localhost|127.0.0.1|serverest) ;; *) echo "BASE_URL nao permitida: $base_url" >&2; exit 2;; esac
servico="k6-$perfil"
mkdir -p "$raiz/testes-performance/relatorios/$perfil"

limpar() { docker compose -f "$raiz/compose.yaml" down --remove-orphans; }
trap limpar EXIT
docker compose -f "$raiz/compose.yaml" up -d serverest --wait
docker compose -f "$raiz/compose.yaml" --profile "$servico" run --rm "$servico"
codigo=$?
cat "$raiz/testes-performance/relatorios/$perfil/summary.txt" 2>/dev/null || true
exit "$codigo"
