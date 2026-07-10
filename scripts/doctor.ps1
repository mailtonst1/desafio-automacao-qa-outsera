$ErrorActionPreference = "Continue"

$falhas = 0

function Testar-Comando {
  param(
    [string]$Nome,
    [string[]]$ArgumentosDeVersao = @("--version"),
    [string]$NecessarioPara = "Geral",
    [switch]$Opcional
  )

  $comando = Get-Command $Nome -ErrorAction SilentlyContinue
  if (-not $comando) {
    $nivel = if ($Opcional) { "WARN" } else { "FAIL" }
    Write-Host "[$nivel][$NecessarioPara] $Nome nao encontrado"
    if (-not $Opcional) { $script:falhas++ }
    return
  }

  $versao = "versao indisponivel"
  try {
    $versao = (& $comando.Source @ArgumentosDeVersao 2>&1 | Select-Object -First 1)
  } catch {
    $versao = "falha ao verificar versao: $($_.Exception.Message)"
  }

  Write-Host "[OK][$NecessarioPara] $Nome"
  Write-Host "  caminho: $($comando.Source)"
  Write-Host "  versao: $versao"
}

function Testar-CaminhoDeAmbiente {
  param(
    [string]$Nome,
    [string]$NecessarioPara = "Mobile"
  )

  $valor = [Environment]::GetEnvironmentVariable($Nome)
  if ([string]::IsNullOrWhiteSpace($valor)) {
    Write-Host "[WARN][$NecessarioPara] $Nome nao definido"
    return
  }

  if (Test-Path -LiteralPath $valor) {
    Write-Host "[OK][$NecessarioPara] $Nome=$valor"
  } else {
    Write-Host "[WARN][$NecessarioPara] $Nome aponta para caminho inexistente: $valor"
  }
}

Write-Host "== Geral =="
Testar-Comando -Nome "git" -NecessarioPara "Geral"
Testar-Comando -Nome "docker" -NecessarioPara "Geral"
Testar-Comando -Nome "docker" -ArgumentosDeVersao @("compose", "version") -NecessarioPara "Geral"

Write-Host "`n== API =="
Testar-Comando -Nome "java" -NecessarioPara "API"
Testar-Comando -Nome "mvn" -NecessarioPara "API"

Write-Host "`n== Web =="
Testar-Comando -Nome "node" -NecessarioPara "Web"
Testar-Comando -Nome "npm" -NecessarioPara "Web"

Write-Host "`n== Mobile =="
Testar-CaminhoDeAmbiente -Nome "JAVA_HOME"
Testar-CaminhoDeAmbiente -Nome "ANDROID_HOME"
Testar-CaminhoDeAmbiente -Nome "ANDROID_SDK_ROOT"
Testar-Comando -Nome "java" -NecessarioPara "Mobile"
Testar-Comando -Nome "mvn" -NecessarioPara "Mobile"
Testar-Comando -Nome "adb" -NecessarioPara "Mobile" -Opcional
Testar-Comando -Nome "emulator" -NecessarioPara "Mobile" -Opcional
Testar-Comando -Nome "appium" -NecessarioPara "Mobile" -Opcional
if (Get-Command appium -ErrorAction SilentlyContinue) {
  Write-Host "[INFO][Mobile] Drivers Appium instalados:"
  appium driver list --installed 2>&1
}

Write-Host "`n== Performance =="
Testar-Comando -Nome "k6" -NecessarioPara "Performance" -Opcional

if ($falhas -gt 0) {
  Write-Host "`nDiagnostico concluido com $falhas falha(s) obrigatoria(s)."
  exit 1
}

Write-Host "`nDiagnostico concluido com sucesso para as dependencias obrigatorias. Avisos opcionais podem permanecer."
exit 0
