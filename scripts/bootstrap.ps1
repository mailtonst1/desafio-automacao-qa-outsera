param(
  [switch]$InstalarRequisitosDoSistema
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

function Copiar-Exemplo {
  param([string]$Origem, [string]$Destino)
  if ((Test-Path -LiteralPath $Origem) -and -not (Test-Path -LiteralPath $Destino)) {
    Copy-Item -LiteralPath $Origem -Destination $Destino
    Write-Host "Arquivo criado: $Destino"
  } else {
    Write-Host "Arquivo mantido ou inexistente: $Destino"
  }
}

Write-Host "Bootstrap iniciado em $raiz"

New-Item -ItemType Directory -Force -Path "$raiz\relatorios\api","$raiz\relatorios\web","$raiz\relatorios\mobile","$raiz\relatorios\performance","$raiz\testes-performance\relatorios" | Out-Null

Copiar-Exemplo "$raiz\.env.example" "$raiz\.env"
Copiar-Exemplo "$raiz\testes-mobile\.env.example" "$raiz\testes-mobile\.env"
Copiar-Exemplo "$raiz\testes-mobile\config\devices\local.example.yaml" "$raiz\testes-mobile\config\devices\local.yaml"
Copiar-Exemplo "$raiz\testes-mobile\config\capabilities\android.example.properties" "$raiz\testes-mobile\config\capabilities\android.properties"

if (Get-Command mvn -ErrorAction SilentlyContinue) {
  Push-Location "$raiz\testes-api"
  mvn -q -DskipTests dependency:go-offline
  Pop-Location
  Push-Location "$raiz\testes-mobile"
  mvn -q -DskipTests dependency:go-offline
  Pop-Location
} else {
  Write-Host "Maven nao encontrado. As dependencias dos modulos Java nao foram instaladas."
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
  Push-Location "$raiz\testes-web-e2e"
  npm install
  Pop-Location
} else {
  Write-Host "npm nao encontrado. As dependencias Web nao foram instaladas."
}

if ($InstalarRequisitosDoSistema) {
  Write-Host "A instalacao de requisitos do sistema nao e automatizada para Docker, Android Studio, Java ou Android SDK."
  Write-Host "Instale as ferramentas ausentes manualmente e execute scripts/doctor.ps1 novamente."
} else {
  Write-Host "Os requisitos do sistema nao foram instalados. Use -InstalarRequisitosDoSistema apenas para orientacoes."
}

Write-Host "Bootstrap finalizado."
