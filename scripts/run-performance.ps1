$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$scenario = "$root\performance-tests\scenarios\smoke.js"
if (-not (Test-Path -LiteralPath $scenario)) {
  Write-Host "Performance scenarios are not implemented in this phase."
  exit 1
}
k6 run $scenario

