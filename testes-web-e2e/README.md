# Testes Web E2E

Este modulo valida a Automation Exercise com Cypress, TypeScript, Cucumber/Gherkin, Page Object Pattern, Data Factory e Allure.

## Execucao

```powershell
cd testes-web-e2e
npm ci
npm run typecheck
npm run verificar:cypress
npm run smoke
npm run regressao
npm run relatorio
```

Os atalhos da raiz aceitam `smoke`, `regressao` e `relatorio`:

```powershell
.\scripts\executar-web.ps1 smoke
.\scripts\executar-web.ps1 regressao
.\scripts\executar-web.ps1 relatorio
.\scripts\executar-web.ps1 regressao -Docker
```

No shell POSIX, use `./scripts/executar-web.sh regressao` ou `./scripts/executar-web.sh regressao --docker`.

## Dados e evidencias

Cada cenario autenticado cria uma conta unica pela API oficial e a remove ao final. A jornada avaliada continua integralmente pela interface Web. Videos headless, screenshots de falha e resultados Allure sao gerados localmente e ignorados pelo Git. A imagem Docker fixa `cypress/included:14.0.1`.

## Limitacoes observadas

Os formularios de login e pagamento usam validacao HTML nativa para campos obrigatorios. A aplicacao aceita o numero informado no pagamento; por isso nao existe cenario inventado de cartao invalido.
