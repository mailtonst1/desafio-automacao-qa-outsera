$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location "$raiz\testes-api"
mvn test
Pop-Location
