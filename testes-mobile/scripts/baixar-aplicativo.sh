#!/usr/bin/env sh
set -eu

arquivo="mda-2.2.0-25.apk"
checksum_esperado="318EF64BDCAFF18E576D962AB1F557E0A2683B9B5210A6BB6B25CB0CAEEF62B4"
url="https://github.com/saucelabs/my-demo-app-android/releases/download/2.2.0/$arquivo"
diretorio_script="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
destino="$diretorio_script/../apps/$arquivo"

validar_checksum() {
  [ "$(sha256sum "$destino" | awk '{print toupper($1)}')" = "$checksum_esperado" ]
}

if [ -f "$destino" ] && validar_checksum; then
  echo "APK validado: $destino"
  exit 0
fi

rm -f "$destino"
curl -fL --retry 2 -o "$destino" "$url"
if ! validar_checksum; then
  rm -f "$destino"
  echo "Checksum invalido para $arquivo." >&2
  exit 1
fi

echo "APK baixado e validado: $destino"
