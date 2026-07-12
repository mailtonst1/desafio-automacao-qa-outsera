$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$mobile = Join-Path $raiz "testes-mobile"
$appiumIniciado = $false
$processoAppium = $null

try {
  & "$PSScriptRoot\doctor.ps1"
  & "$mobile\scripts\baixar-aplicativo.ps1"
  if (-not (& adb devices | Select-String "`tdevice$")) { throw "Nenhum dispositivo Android conectado ou emulador iniciado." }
  $hostAppium = if ($env:APPIUM_HOST) { $env:APPIUM_HOST } else { "127.0.0.1" }
  $porta = [int]$(if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { "4723" })
  if (-not (Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue)) {
    $comandoAppium = (Get-Command appium -ErrorAction Stop).Source
    $saidaAppium = Join-Path $mobile "target\\appium-out.log"
    $erroAppium = Join-Path $mobile "target\\appium-err.log"
    $processoAppium = Start-Process -FilePath powershell.exe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $comandoAppium, "server", "--address", $hostAppium, "--port", $porta) -WindowStyle Hidden -RedirectStandardOutput $saidaAppium -RedirectStandardError $erroAppium -PassThru
    $appiumIniciado = $true
    for ($tentativa = 0; $tentativa -lt 20; $tentativa++) {
      if (Test-NetConnection $hostAppium -Port $porta -InformationLevel Quiet) { break }
      Start-Sleep -Seconds 1
    }
    if (-not (Test-NetConnection $hostAppium -Port $porta -InformationLevel Quiet)) { throw "Appium nao iniciou na porta $porta." }
  }
  Push-Location $mobile
  .\mvnw.cmd -B test allure:report
  $codigo = $LASTEXITCODE
  Pop-Location
  exit $codigo
} finally {
  if ($appiumIniciado -and $processoAppium) { Stop-Process -Id $processoAppium.Id -Force -ErrorAction SilentlyContinue }
}
