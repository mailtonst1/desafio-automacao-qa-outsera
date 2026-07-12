$ErrorActionPreference = "Stop"
$arquivo = "mda-2.2.0-25.apk"
$checksumEsperado = "318EF64BDCAFF18E576D962AB1F557E0A2683B9B5210A6BB6B25CB0CAEEF62B4"
$url = "https://github.com/saucelabs/my-demo-app-android/releases/download/2.2.0/$arquivo"
$destino = Join-Path (Split-Path -Parent $PSScriptRoot) "apps\$arquivo"

function Testar-Checksum {
  param([string]$Caminho)
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Caminho).Hash -eq $checksumEsperado
}

if ((Test-Path -LiteralPath $destino) -and (Testar-Checksum $destino)) {
  Write-Host "APK validado: $destino"
  exit 0
}

if (Test-Path -LiteralPath $destino) { Remove-Item -LiteralPath $destino -Force }
curl.exe -fL --retry 2 -o $destino $url
if (-not (Testar-Checksum $destino)) {
  Remove-Item -LiteralPath $destino -Force
  throw "Checksum invalido para $arquivo."
}

Write-Host "APK baixado e validado: $destino"
