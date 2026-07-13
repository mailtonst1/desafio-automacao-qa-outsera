# Testes de API

Suite Java para o ServeRest 3.2.0. Valida autenticacao, usuarios, produtos, carrinhos, contratos e headers de seguranca. Cenarios positivos criam, consultam, alteram e removem recursos; negativos cobrem credenciais, autorizacao, campos obrigatorios, duplicidade e identificadores inexistentes.

## Tecnologias e arquitetura

Java 17, Maven Wrapper, JUnit 5.11.4, REST Assured 5.5.0, Jackson 2.17.3, JSON Schema Validator e Allure 2.29.1. `cliente` concentra rotas HTTP; `especificacao` concentra URL, headers e filtros; `fabrica` gera dados unicos; `modelo` representa payloads; `suporte` cria e remove dados; `validacao` aplica schemas e mascara `Authorization` e `password` nas evidencias. Esse arranjo usa Client Object, Data Factory e Specifications para manter os testes isolados.

## Pre-requisitos e configuracao

Para Docker: Docker Desktop com Compose. Para execucao direta: Java 17 e o Maven Wrapper. `BASE_URL` e opcional e usa `http://localhost:3000` por padrao. O script aceita somente o ServeRest iniciado pelo Compose; nao use dados reais.

## Execucao

Windows, por Docker:
```powershell
.\scripts\executar-api.ps1 -Perfil smoke
.\scripts\executar-api.ps1 -Perfil regressao
.\scripts\executar-api.ps1 -Perfil completa -GerarRelatorio
```

Linux/macOS:
```sh
./scripts/executar-api.sh --smoke
./scripts/executar-api.sh --regressao --gerar-relatorio
```

Diretamente com o Wrapper, com o ServeRest acessivel em `BASE_URL`:
```powershell
cd testes-api
.\mvnw.cmd -B test
.\mvnw.cmd -B -Psmoke test
.\mvnw.cmd -B -Pregressao test allure:report
```

O job `testes-api` sobe `serverest`, executa `bash ./mvnw -B test allure:report` e publica artifacts sempre. Resultados ficam em `target/allure-results` e Surefire em `target/surefire-reports`; no script Docker ficam em `relatorios/api/`. `-ManterAmbiente` deixa o Compose ativo para diagnostico.

## Problemas comuns

Se a porta 3000 estiver ocupada, pare o processo ou altere o ambiente antes de iniciar. Se o Docker nao ficar saudavel, execute `docker compose logs serverest`. Se `BASE_URL` apontar para outro host, confirme que ele expõe o contrato do ServeRest; os schemas foram escritos para a instancia local observada.

Consulte a [documentacao raiz](../README.md), o [contrato observado](../documentacao/contrato-api-observado.md) e a [matriz de testes](../documentacao/matriz-de-testes.md).
