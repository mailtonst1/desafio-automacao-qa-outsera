# Desafio de Automacao QA Outsera

Monorepo de qualidade com suites independentes de API, Web E2E, Mobile Android e Performance. A pipeline publica o [relatorio Allure unificado](https://mailtonst1.github.io/desafio-automacao-qa-outsera/) apos uma execucao verde na `main`.

[![Qualidade](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/workflows/qualidade.yml/badge.svg)](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/workflows/qualidade.yml)

## Acesso rapido

- [Portal de evidencias](https://mailtonst1.github.io/desafio-automacao-qa-outsera/)
- [Relatorio Allure unificado](https://mailtonst1.github.io/desafio-automacao-qa-outsera/allure/)
- [Performance - fumaca](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/fumaca/)
- [Performance - carga](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/carga/)
- [GitHub Actions](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions)

## Resultado validado

O repositorio possui 60 testes funcionais implementados: 43 API, 11 Web E2E e 6 Mobile. Os quatro novos testes Web de acessibilidade foram executados em 17/07/2026 e reprovaram por violacoes `serious` e `critical` do alvo externo; por isso 56 testes compunham o ultimo ciclo funcional aprovado. Performance possui dois perfis k6: fumaca (5 VUs, 30 s) e carga (ramp-up de 1 minuto, 500 VUs por 5 minutos, ramp-down de 1 minuto). Os jobs sao separados e o quality gate exige sucesso de todos eles e do relatorio unificado.

## Inicio rapido

```powershell
git clone https://github.com/mailtonst1/desafio-automacao-qa-outsera.git
cd desafio-automacao-qa-outsera
.\scripts\doctor.ps1
.\scripts\bootstrap.ps1
.\scripts\executar-api.ps1 -Perfil smoke
.\scripts\executar-web.ps1 smoke
.\scripts\executar-mobile.ps1
.\scripts\executar-performance.ps1 -Perfil fumaca
```

Em Linux/macOS use `./scripts/doctor.sh`, `./scripts/bootstrap.sh` e as variantes `.sh`. O bootstrap instala dependencias do projeto e cria arquivos locais de exemplo; ele nao instala Docker, Java, Android SDK ou outras ferramentas do sistema.

## Pipeline e documentacao

Push, pull request e `workflow_dispatch` acionam a pipeline. API, Web, Mobile, fumaça e carga executam em paralelo; o quality gate exige todos os jobs e o relatório unificado aprovados. Logs e artifacts ficam em [GitHub Actions](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions). O Pages e atualizado em push para `main`.

- [Documentacao dos testes de API](testes-api/README.md)
- [Documentacao dos testes Web E2E](testes-web-e2e/README.md)
- [Documentacao dos testes Mobile](testes-mobile/README.md)
- [Documentacao dos testes de Performance](testes-performance/README.md)
- [Documentacao do relatorio unificado](relatorio-unificado/README.md)

## Reprodutibilidade local

As suites API, Web e Performance foram executadas a partir de clone limpo, sem artifacts, `.env`, APK ou massas reaproveitados. API e Web passaram em duas execucoes consecutivas; Performance recria sua credencial no `setup`. Mobile exige Android SDK, Appium e um dispositivo/emulador conectado, por isso sua execucao local depende dessa infraestrutura externa e nao de segredo ou arquivo do GitHub Actions.

## Modulos

| Modulo | Escopo | Comando principal |
| --- | --- | --- |
| `testes-api` | ServeRest: autenticacao, usuarios, produtos, carrinhos e contratos | `./mvnw.cmd test` |
| `testes-web-e2e` | Automation Exercise: autenticacao, checkout e acessibilidade | `npm run typecheck && npm run lint && npm run regressao` |
| `testes-mobile` | My Demo App Android 2.2.0: catalogo, login, produto e checkout | `./mvnw.cmd test` |
| `testes-performance` | k6 contra ServeRest local: fumaca e carga | `scripts/executar-performance.ps1` |
| `relatorio-unificado` | Allure consolidado e resumo de performance | `npm run gerar` |

Consulte os READMEs de cada modulo para pre-requisitos, configuracao, cobertura e limitacoes.

## Execucao local

Prerequisitos: Docker/Compose para ServeRest, Java 17, Node 20, Android SDK + `adb` + emulador para Mobile, Appium 3.1.2 com UiAutomator2 6.7.9 e k6 para Performance.

```powershell
.\scripts\executar-api.ps1 -Perfil completa -GerarRelatorio
.\scripts\executar-web.ps1 regressao
.\scripts\executar-mobile.ps1
.\scripts\executar-performance.ps1 -Perfil fumaca
```

O APK e baixado da release oficial e validado por SHA-256; nao e versionado. Dados de teste sao sinteticos e resultados, screenshots, videos, logs e relatorios gerados sao ignorados pelo Git.

## Evidencias e CI

Cada chamada API anexa requisicao, resposta e metadados ao Allure, com `Authorization`, `authorization` e `password` mascarados. Web anexa screenshot de viewport e URL final por cenario; falhas de acessibilidade tambem recebem um JSON detalhado no Allure, e os screenshots/videos do Cypress sao preservados. Mobile anexa screenshot final e dados de dispositivo por teste e, em falha, page source, Appium log e logcat.

O workflow [Qualidade](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/workflows/qualidade.yml) publica artifacts de cada modulo com `if: always()`. O Pages contem a entrada do Allure e os relatorios k6 de fumaca e carga.

## Seguranca

Nao versione `.env`, APKs, tokens, senhas reais, logs ou relatorios. Use apenas dados ficticios e configure credenciais exclusivamente como GitHub Secrets quando necessario.
