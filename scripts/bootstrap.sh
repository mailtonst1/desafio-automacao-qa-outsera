#!/usr/bin/env sh
set -eu

install_system_requirements=false
if [ "${1:-}" = "--install-system-requirements" ]; then
  install_system_requirements=true
fi

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root="$(dirname "$script_dir")"

copy_example() {
  source="$1"
  destination="$2"
  if [ -f "$source" ] && [ ! -f "$destination" ]; then
    cp "$source" "$destination"
    echo "Created $destination"
  else
    echo "Skipped $destination"
  fi
}

echo "Bootstrap started at $root"

mkdir -p "$root/reports/api" "$root/reports/web" "$root/reports/mobile" "$root/reports/performance" "$root/performance-tests/reports"

copy_example "$root/.env.example" "$root/.env"
copy_example "$root/mobile-tests/.env.example" "$root/mobile-tests/.env"
copy_example "$root/mobile-tests/config/devices/local.example.yaml" "$root/mobile-tests/config/devices/local.yaml"
copy_example "$root/mobile-tests/config/capabilities/android.example.properties" "$root/mobile-tests/config/capabilities/android.properties"

if command -v mvn >/dev/null 2>&1; then
  (cd "$root/api-tests" && mvn -q -DskipTests dependency:go-offline)
  (cd "$root/mobile-tests" && mvn -q -DskipTests dependency:go-offline)
else
  echo "Maven not found. Java module dependencies were not installed."
fi

if command -v npm >/dev/null 2>&1; then
  (cd "$root/web-e2e" && npm install)
else
  echo "npm not found. Web dependencies were not installed."
fi

if [ "$install_system_requirements" = true ]; then
  echo "System requirement installation is intentionally not automated for Docker, Android Studio, Java, or Android SDK."
  echo "Install missing tools manually, then rerun scripts/doctor.sh."
else
  echo "System requirements were not installed. Pass --install-system-requirements for guidance only."
fi

echo "Bootstrap finished."

