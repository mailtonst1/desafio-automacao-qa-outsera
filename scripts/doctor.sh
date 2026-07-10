#!/usr/bin/env sh
set +e

failures=0

check_command() {
  name="$1"
  args="${2:---version}"
  module="$3"
  optional="$4"

  path="$(command -v "$name" 2>/dev/null)"
  if [ -z "$path" ]; then
    if [ "$optional" = "optional" ]; then
      echo "[WARN][$module] $name not found"
    else
      echo "[FAIL][$module] $name not found"
      failures=$((failures + 1))
    fi
    return
  fi

  version="$($name $args 2>&1 | head -n 1)"
  echo "[OK][$module] $name"
  echo "  path: $path"
  echo "  version: $version"
}

check_env_path() {
  name="$1"
  module="$2"
  eval value="\${$name}"
  if [ -z "$value" ]; then
    echo "[WARN][$module] $name is not set"
  elif [ -e "$value" ]; then
    echo "[OK][$module] $name=$value"
  else
    echo "[WARN][$module] $name points to a missing path: $value"
  fi
}

echo "== General =="
check_command git "--version" General
check_command docker "--version" General
check_command docker "compose version" General

echo
echo "== API =="
check_command java "--version" API
check_command mvn "--version" API

echo
echo "== Web =="
check_command node "--version" Web
check_command npm "--version" Web

echo
echo "== Mobile =="
check_env_path JAVA_HOME Mobile
check_env_path ANDROID_HOME Mobile
check_env_path ANDROID_SDK_ROOT Mobile
check_command java "--version" Mobile
check_command mvn "--version" Mobile
check_command adb "version" Mobile optional
check_command emulator "-version" Mobile optional
check_command appium "--version" Mobile optional
if command -v appium >/dev/null 2>&1; then
  echo "[INFO][Mobile] Appium installed drivers:"
  appium driver list --installed 2>&1
fi

echo
echo "== Performance =="
check_command k6 "version" Performance optional

if [ "$failures" -gt 0 ]; then
  echo
  echo "Doctor completed with $failures required failure(s)."
  exit 1
fi

echo
echo "Doctor completed successfully for required dependencies. Optional warnings may remain."
exit 0

