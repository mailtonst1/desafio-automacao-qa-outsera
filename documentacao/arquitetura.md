# Arquitetura

O repositorio e um monorepo com modulos independentes e scripts compartilhados na raiz.

## Modulos

- `testes-api`: projeto Maven para automacao de API.
- `testes-web-e2e`: projeto Node.js para automacao Web E2E com Cypress, Cucumber, Page Objects, fabricas e Allure.
- `testes-mobile`: projeto Maven para automacao com Appium.
- `testes-performance`: recursos e relatorios do k6.
- `scripts`: diagnostico, bootstrap e wrappers de execucao entre modulos.
- `documentacao`: documentacao do projeto.
- `relatorios`: destino dos relatorios gerados.

## Testes de API

`testes-api` usa Client Objects para encapsular HTTP, fábricas para dados exclusivos, specifications para configuração comum e um gerenciador de limpeza para recursos criados. O Docker Compose disponibiliza o serviço `testes-api` no profile `api`, conectado ao ServeRest pela rede interna em `http://serverest:3000`.

## Testes Mobile

`testes-mobile` usa Java 17, JUnit 5, Appium e UiAutomator2. `GerenciadorDeDriver` concentra as capabilities e o ciclo do `AndroidDriver`; as telas encapsulam os seletores do aplicativo e os fluxos reutilizam navegacao comum. Os testes usam esperas explicitas e anexam screenshot e fonte da pagina ao Allure em caso de falha.

## Servicos

O ServeRest e executado pelo Docker Compose usando `paulogoncalvesbh/serverest:3.2.0`.

URL no host:

```text
http://localhost:3000
```

Container network URL:

```text
http://serverest:3000
```
