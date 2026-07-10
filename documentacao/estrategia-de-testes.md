# Estrategia de testes

## Objetivo

Definir a estrategia planejada de automacao para o monorepo do Desafio de automacao de QA Outsera.

## Camadas

- API: validar endpoints do ServeRest com REST Assured e JUnit 5.
- Web E2E: validar jornadas criticas no Automation Exercise com Cypress, TypeScript e Cucumber.
- Mobile: validar jornadas Android no Sauce Labs My Demo App com Appium, UiAutomator2 e JUnit 5.
- Performance: validar disponibilidade e comportamento sob carga do ServeRest com k6.

## Modelo de execucao

API, Web e Performance devem ser compativeis com Docker para reduzir os requisitos da estacao de avaliacao. Mobile tera execucao local e em CI com um emulador Android.

## Dados

Os dados de teste devem ser deterministas, isolados por execucao sempre que possivel e limpos quando a aplicacao alvo oferecer caminhos seguros para limpeza.

## Relatorios

Allure sera o formato padrao de relatorio para API, Web e Mobile. Os resumos exportados pelo k6 serao armazenados em `testes-performance/relatorios/`.
