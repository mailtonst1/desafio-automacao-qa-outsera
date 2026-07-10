#!/usr/bin/env sh
set -eu

perfil="completa"
manter_ambiente=false
gerar_relatorio=false

for argumento in "$@"; do
  case "$argumento" in
    --smoke) perfil="smoke" ;;
    --regressao) perfil="regressao" ;;
    --manter-ambiente) manter_ambiente=true ;;
    --gerar-relatorio) gerar_relatorio=true ;;
    *) echo "Opcao desconhecida: $argumento"; exit 2 ;;
  esac
done

diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"
codigo_de_saida=1

limpar_ambiente() {
  if [ "$manter_ambiente" = false ]; then
    docker compose down --remove-orphans >/dev/null 2>&1 || true
  else
    echo "Ambiente mantido ativo por solicitacao explicita."
  fi
}

aguardar_serverest() {
  limite=90
  espera=1
  decorrido=0
  while [ "$decorrido" -lt "$limite" ]; do
    if curl -fsS --max-time 5 http://localhost:3000/status >/dev/null; then
      return 0
    fi
    echo "ServeRest ainda nao esta disponivel. Nova tentativa em $espera segundo(s)."
    sleep "$espera"
    decorrido=$((decorrido + espera))
    if [ "$espera" -lt 8 ]; then espera=$((espera * 2)); fi
  done
  return 1
}

trap limpar_ambiente EXIT

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nao encontrado. Instale Docker e Docker Compose para executar os testes de API."
  exit 1
fi

cd "$raiz"
docker compose config >/dev/null
docker compose up -d serverest
aguardar_serverest || { echo "O ServeRest nao ficou saudavel dentro do tempo limite."; exit 1; }
docker compose --profile api build testes-api

argumentos_maven=""
if [ "$perfil" = "smoke" ]; then argumentos_maven="-Psmoke"; fi
if [ "$perfil" = "regressao" ]; then argumentos_maven="-Pregressao"; fi

if docker compose --profile api run --rm -e "MAVEN_ARGS=$argumentos_maven" -e "GERAR_RELATORIO=$gerar_relatorio" testes-api; then
  codigo_de_saida=0
  echo "Testes de API concluidos com sucesso."
  echo "Resultados Allure: $raiz/relatorios/api/allure-results"
  if [ "$gerar_relatorio" = true ]; then echo "Relatorio HTML: $raiz/relatorios/api/allure-report"; fi
else
  codigo_de_saida=$?
  echo "Os testes de API falharam com codigo $codigo_de_saida. Logs do ServeRest:"
  docker compose logs --no-color serverest || true
fi

exit "$codigo_de_saida"
