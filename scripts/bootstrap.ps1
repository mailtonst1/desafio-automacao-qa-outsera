param(
  [switch]$InstallSystemRequirements
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Copy-Example {
  param([string]$Source, [string]$Destination)
  if ((Test-Path -LiteralPath $Source) -and -not (Test-Path -LiteralPath $Destination)) {
    Copy-Item -LiteralPath $Source -Destination $Destination
    Write-Host "Created $Destination"
  } else {
    Write-Host "Skipped $Destination"
  }
}

Write-Host "Bootstrap started at $root"

New-Item -ItemType Directory -Force -Path "$root\reports\api","$root\reports\web","$root\reports\mobile","$root\reports\performance","$root\performance-tests\reports" | Out-Null

Copy-Example "$root\.env.example" "$root\.env"
Copy-Example "$root\mobile-tests\.env.example" "$root\mobile-tests\.env"
Copy-Example "$root\mobile-tests\config\devices\local.example.yaml" "$root\mobile-tests\config\devices\local.yaml"
Copy-Example "$root\mobile-tests\config\capabilities\android.example.properties" "$root\mobile-tests\config\capabilities\android.properties"

if (Get-Command mvn -ErrorAction SilentlyContinue) {
  Push-Location "$root\api-tests"
  mvn -q -DskipTests dependency:go-offline
  Pop-Location
  Push-Location "$root\mobile-tests"
  mvn -q -DskipTests dependency:go-offline
  Pop-Location
} else {
  Write-Host "Maven not found. Java module dependencies were not installed."
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
  Push-Location "$root\web-e2e"
  npm install
  Pop-Location
} else {
  Write-Host "npm not found. Web dependencies were not installed."
}

if ($InstallSystemRequirements) {
  Write-Host "System requirement installation is intentionally not automated for Docker, Android Studio, Java, or Android SDK."
  Write-Host "Install missing tools manually, then rerun scripts/doctor.ps1."
} else {
  Write-Host "System requirements were not installed. Pass -InstallSystemRequirements for guidance only."
}

Write-Host "Bootstrap finished."

