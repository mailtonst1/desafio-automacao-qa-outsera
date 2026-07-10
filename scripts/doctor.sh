#!/usr/bin/env sh
set +e

falhas=0

verificar_comando() {
  nome="$1"
  argumentos="${2:---version}"
  modulo="$3"
  opcional="$4"

  caminho="$(command -v "$nome" 2>/dev/null)"
  if [ -z "$caminho" ]; then
    if [ "$opcional" = "opcional" ]; then
      echo "[WARN][$modulo] $nome nao encontrado"
    else
      echo "[FAIL][$modulo] $nome nao encontrado"
      falhas=$((falhas + 1))
    fi
    return
  fi

  versao="$($nome $argumentos 2>&1 | head -n 1)"
  echo "[OK][$modulo] $nome"
  echo "  caminho: $caminho"
  echo "  versao: $versao"
}

verificar_caminho_ambiente() {
  nome="$1"
  modulo="$2"
  eval valor="\${$nome}"
  if [ -z "$valor" ]; then
    echo "[WARN][$modulo] $nome nao definido"
  elif [ -e "$valor" ]; then
    echo "[OK][$modulo] $nome=$valor"
  else
    echo "[WARN][$modulo] $nome aponta para caminho inexistente: $valor"
  fi
}

echo "== Geral =="
verificar_comando git "--version" Geral
verificar_comando docker "--version" Geral
verificar_comando docker "compose version" Geral

echo
echo "== API =="
verificar_comando java "--version" API
verificar_comando mvn "--version" API

echo
echo "== Web =="
verificar_comando node "--version" Web
verificar_comando npm "--version" Web

echo
echo "== Mobile =="
verificar_caminho_ambiente JAVA_HOME Mobile
verificar_caminho_ambiente ANDROID_HOME Mobile
verificar_caminho_ambiente ANDROID_SDK_ROOT Mobile
verificar_comando java "--version" Mobile
verificar_comando mvn "--version" Mobile
verificar_comando adb "version" Mobile opcional
verificar_comando emulator "-version" Mobile opcional
verificar_comando appium "--version" Mobile opcional
if command -v appium >/dev/null 2>&1; then
  echo "[INFO][Mobile] Drivers Appium instalados:"
  appium driver list --installed 2>&1
fi

echo
echo "== Performance =="
verificar_comando k6 "version" Performance opcional

if [ "$falhas" -gt 0 ]; then
  echo
  echo "Diagnostico concluido com $falhas falha(s) obrigatoria(s)."
  exit 1
fi

echo
echo "Diagnostico concluido com sucesso para as dependencias obrigatorias. Avisos opcionais podem permanecer."
exit 0
