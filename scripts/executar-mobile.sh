#!/usr/bin/env sh
set -eu
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
raiz="$(dirname "$diretorio_script")"
appium_iniciado=false
limpar() { if [ "$appium_iniciado" = true ]; then kill "$appium_pid" 2>/dev/null || true; fi; }
trap limpar EXIT

"$diretorio_script/doctor.sh"
"$raiz/testes-mobile/scripts/baixar-aplicativo.sh"
adb get-state | grep -qx device
if ! curl -fsS "http://${APPIUM_HOST:-127.0.0.1}:${APPIUM_PORT:-4723}/status" >/dev/null; then
  mkdir -p "$raiz/testes-mobile/target"
  appium server --address "${APPIUM_HOST:-127.0.0.1}" --port "${APPIUM_PORT:-4723}" >"$raiz/testes-mobile/target/appium.log" 2>&1 &
  appium_pid=$!
  appium_iniciado=true
  tentativa=0
  while [ "$tentativa" -lt 20 ]; do
    if curl -fsS "http://${APPIUM_HOST:-127.0.0.1}:${APPIUM_PORT:-4723}/status" >/dev/null; then break; fi
    tentativa=$((tentativa + 1))
    sleep 1
  done
  curl -fsS "http://${APPIUM_HOST:-127.0.0.1}:${APPIUM_PORT:-4723}/status" >/dev/null
fi
cd "$raiz/testes-mobile"
./mvnw -B test allure:report
