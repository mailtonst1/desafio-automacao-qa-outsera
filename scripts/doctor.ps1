$ErrorActionPreference = "Continue"

$failures = 0

function Test-Command {
  param(
    [string]$Name,
    [string[]]$VersionArgs = @("--version"),
    [string]$RequiredFor = "General",
    [switch]$Optional
  )

  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    $level = if ($Optional) { "WARN" } else { "FAIL" }
    Write-Host "[$level][$RequiredFor] $Name not found"
    if (-not $Optional) { $script:failures++ }
    return
  }

  $version = "version unavailable"
  try {
    $version = (& $cmd.Source @VersionArgs 2>&1 | Select-Object -First 1)
  } catch {
    $version = "version check failed: $($_.Exception.Message)"
  }

  Write-Host "[OK][$RequiredFor] $Name"
  Write-Host "  path: $($cmd.Source)"
  Write-Host "  version: $version"
}

function Test-EnvPath {
  param(
    [string]$Name,
    [string]$RequiredFor = "Mobile"
  )

  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "[WARN][$RequiredFor] $Name is not set"
    return
  }

  if (Test-Path -LiteralPath $value) {
    Write-Host "[OK][$RequiredFor] $Name=$value"
  } else {
    Write-Host "[WARN][$RequiredFor] $Name points to a missing path: $value"
  }
}

Write-Host "== General =="
Test-Command -Name "git" -RequiredFor "General"
Test-Command -Name "docker" -RequiredFor "General"
Test-Command -Name "docker" -VersionArgs @("compose", "version") -RequiredFor "General"

Write-Host "`n== API =="
Test-Command -Name "java" -RequiredFor "API"
Test-Command -Name "mvn" -RequiredFor "API"

Write-Host "`n== Web =="
Test-Command -Name "node" -RequiredFor "Web"
Test-Command -Name "npm" -RequiredFor "Web"

Write-Host "`n== Mobile =="
Test-EnvPath -Name "JAVA_HOME"
Test-EnvPath -Name "ANDROID_HOME"
Test-EnvPath -Name "ANDROID_SDK_ROOT"
Test-Command -Name "java" -RequiredFor "Mobile"
Test-Command -Name "mvn" -RequiredFor "Mobile"
Test-Command -Name "adb" -RequiredFor "Mobile" -Optional
Test-Command -Name "emulator" -RequiredFor "Mobile" -Optional
Test-Command -Name "appium" -RequiredFor "Mobile" -Optional
if (Get-Command appium -ErrorAction SilentlyContinue) {
  Write-Host "[INFO][Mobile] Appium installed drivers:"
  appium driver list --installed 2>&1
}

Write-Host "`n== Performance =="
Test-Command -Name "k6" -RequiredFor "Performance" -Optional

if ($failures -gt 0) {
  Write-Host "`nDoctor completed with $failures required failure(s)."
  exit 1
}

Write-Host "`nDoctor completed successfully for required dependencies. Optional warnings may remain."
exit 0
