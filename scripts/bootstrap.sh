#!/usr/bin/env sh
set -eu

instalar_requisitos_sistema=false
if [ "${1:-}" = "--install-system-requirements" ]; then
  instalar_requisitos_sistema=true
fi

diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"

copiar_exemplo() {
  origem="$1"
  destino="$2"
  if [ -f "$origem" ] && [ ! -f "$destino" ]; then
    cp "$origem" "$destino"
    echo "Arquivo criado: $destino"
  else
    echo "Arquivo mantido ou inexistente: $destino"
  fi
}

echo "Bootstrap iniciado em $raiz"

mkdir -p "$raiz/relatorios/api" "$raiz/relatorios/web" "$raiz/relatorios/mobile" "$raiz/relatorios/performance" "$raiz/testes-performance/relatorios"

copiar_exemplo "$raiz/.env.example" "$raiz/.env"
copiar_exemplo "$raiz/testes-mobile/.env.example" "$raiz/testes-mobile/.env"
copiar_exemplo "$raiz/testes-mobile/config/devices/local.example.yaml" "$raiz/testes-mobile/config/devices/local.yaml"
copiar_exemplo "$raiz/testes-mobile/config/capabilities/android.example.properties" "$raiz/testes-mobile/config/capabilities/android.properties"

if command -v mvn >/dev/null 2>&1; then
  (cd "$raiz/testes-api" && mvn -q -DskipTests dependency:go-offline)
  (cd "$raiz/testes-mobile" && mvn -q -DskipTests dependency:go-offline)
else
  echo "Maven nao encontrado. As dependencias dos modulos Java nao foram instaladas."
fi

if command -v npm >/dev/null 2>&1; then
  (cd "$raiz/testes-web-e2e" && npm install)
else
  echo "npm nao encontrado. As dependencias Web nao foram instaladas."
fi

if [ "$instalar_requisitos_sistema" = true ]; then
  echo "A instalacao de requisitos do sistema nao e automatizada para Docker, Android Studio, Java ou Android SDK."
  echo "Instale as ferramentas ausentes manualmente e execute scripts/doctor.sh novamente."
else
  echo "Os requisitos do sistema nao foram instalados. Use --install-system-requirements apenas para orientacoes."
fi

echo "Bootstrap finalizado."
