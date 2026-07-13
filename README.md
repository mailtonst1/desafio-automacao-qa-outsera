# Desafio de Automacao QA Outsera

Monorepo de qualidade com suites independentes de API, Web E2E, Mobile Android e Performance. A pipeline publica o [relatorio Allure unificado](https://mailtonst1.github.io/desafio-automacao-qa-outsera/) apos uma execucao verde na `main`.

## Acesso rapido

- [Portal de evidencias](https://mailtonst1.github.io/desafio-automacao-qa-outsera/)
- [Relatorio Allure unificado](https://mailtonst1.github.io/desafio-automacao-qa-outsera/allure/)
- [Performance - fumaca](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/fumaca/)
- [Performance - carga](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/carga/)
- [GitHub Actions](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions)

## Resultado validado

O ultimo ciclo completo aprovado executou 58 testes funcionais: 43 API, 7 Web E2E e 6 Mobile. Performance tambem executa fumaca (5 VUs, 30 s) e carga (ramp-up de 1 minuto, 500 VUs por 5 minutos, ramp-down de 1 minuto). Os jobs sao separados e o quality gate exige sucesso de todos eles e do relatorio unificado.

## Modulos

| Modulo | Escopo | Comando principal |
| --- | --- | --- |
| `testes-api` | ServeRest: autenticacao, usuarios, produtos, carrinhos e contratos | `./mvnw.cmd test` |
| `testes-web-e2e` | Automation Exercise: autenticacao e checkout | `npm run regressao` |
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

Cada chamada API anexa requisicao, resposta e metadados ao Allure, com `Authorization`, `authorization` e `password` mascarados. Web anexa screenshot de viewport e URL final por cenario; em falha, os screenshots/videos do Cypress tambem sao preservados. Mobile anexa screenshot final e dados de dispositivo por teste e, em falha, page source, Appium log e logcat.

O workflow [Qualidade](https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/workflows/qualidade.yml) publica artifacts de cada modulo com `if: always()`. O Pages contem a entrada do Allure e os relatorios k6 de fumaca e carga.

## Seguranca

Nao versione `.env`, APKs, tokens, senhas reais, logs ou relatorios. Use apenas dados ficticios e configure credenciais exclusivamente como GitHub Secrets quando necessario.
