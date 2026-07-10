param(
  [ValidateSet("smoke", "regressao", "completa")]
  [string]$Perfil = "completa",
  [switch]$ManterAmbiente,
  [switch]$GerarRelatorio
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$codigoDeSaida = 1

function Aguardar-ServeRest {
  $limite = (Get-Date).AddSeconds(90)
  $espera = 1
  while ((Get-Date) -lt $limite) {
    try {
      $resposta = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/status" -TimeoutSec 5
      if ($resposta.StatusCode -eq 200) { return }
    } catch {
      Write-Host "ServeRest ainda nao esta disponivel. Nova tentativa em $espera segundo(s)."
    }
    Start-Sleep -Seconds $espera
    $espera = [Math]::Min($espera * 2, 8)
  }
  throw "O ServeRest nao ficou saudavel dentro do tempo limite."
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker nao encontrado. Instale Docker e Docker Compose para executar os testes de API."
}

Push-Location $raiz
try {
  docker compose config | Out-Null
  docker compose up -d serverest
  Aguardar-ServeRest
  docker compose --profile api build testes-api

  $argumentosMaven = switch ($Perfil) {
    "smoke" { "-Psmoke" }
    "regressao" { "-Pregressao" }
    default { "" }
  }
  $argumentosDocker = @("compose", "--profile", "api", "run", "--rm", "-e", "MAVEN_ARGS=$argumentosMaven", "-e", "GERAR_RELATORIO=$($GerarRelatorio.IsPresent.ToString().ToLower())", "testes-api")
  & docker @argumentosDocker
  $codigoDeSaida = $LASTEXITCODE

  if ($codigoDeSaida -eq 0) {
    Write-Host "Testes de API concluidos com sucesso."
    Write-Host "Resultados Allure: $raiz\relatorios\api\allure-results"
    if ($GerarRelatorio) { Write-Host "Relatorio HTML: $raiz\relatorios\api\allure-report" }
  } else {
    Write-Host "Os testes de API falharam com codigo $codigoDeSaida. Logs do ServeRest:"
    docker compose logs --no-color serverest
  }
} finally {
  if (-not $ManterAmbiente) {
    docker compose down --remove-orphans | Out-Null
  } else {
    Write-Host "Ambiente mantido ativo por solicitacao explicita."
  }
  Pop-Location
}

exit $codigoDeSaida
