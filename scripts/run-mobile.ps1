$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location "$raiz\testes-mobile"
mvn test
Pop-Location
