# Testes Web E2E

Suite Cypress para a Automation Exercise. Os sete cenarios Gherkin validam login, mensagens de erro, campos obrigatorios, checkout autenticado, checkout sem autenticacao e pagamento incompleto.

## Tecnologias e estrutura

Node 22.13.1, npm 10.9.2, Cypress 14.0.1, TypeScript 5.7.3, Cucumber Preprocessor 22.0.1 e Allure Cypress 3.0.8. `cypress/e2e` guarda features e step definitions; `pages` aplica Page Object; `factories` cria dados unicos; `services` prepara usuarios pela API; `support` registra comandos e configuracao. A UI continua sendo a jornada avaliada: a API e usada apenas para criar/remover a conta dos cenarios `@autenticado`.

## Instalacao e execucao

```powershell
cd testes-web-e2e
npm ci
npm run typecheck
npm run verificar:cypress
npm run cy:open
npm run smoke
npm run regressao
npm run relatorio
```

No Linux/macOS os mesmos comandos npm se aplicam. Pela raiz, use `./scripts/executar-web.ps1 smoke`, `regressao` ou `relatorio`; com Docker acrescente `-Docker`. O modo visual e `npm run cy:open`; `smoke` e `regressao` executam headless.

## Evidencias e CI

Cypress grava screenshots, videos e `allure-results`; cada cenario tambem anexa screenshot de viewport e URL final ao Allure. O job `testes-web` executa `npm ci`, instala o Cypress, roda `npm run regressao` e publica os tres conjuntos como artifact.

## Limites e diagnostico

A Automation Exercise usa validacao HTML nativa em campos obrigatorios e aceita o numero informado no pagamento; nao ha cenario artificial de cartao invalido. Em erro de browser, rode `npm run verificar:cypress`; em dependencias, refaca `npm ci`; em seletor, confira a pagina real e os Page Objects. Videos de falha sao mais uteis em execucao headless.

Consulte a [documentacao raiz](../README.md) e a [matriz de testes](../documentacao/matriz-de-testes.md).
