# Desafio de automacao de QA Outsera

Monorepo que organiza a fundacao de automacao de testes de API, Web E2E, Mobile e Performance.

Esta fase estabelece apenas a base do repositorio: documentacao, configuracoes iniciais dos modulos, scripts de diagnostico e bootstrap, alem da configuracao do servico local. Os testes funcionais serao implementados em fases posteriores.

## Objetivo e escopo

O objetivo e fornecer uma estrutura versionada, reproduzivel e preparada para a evolucao da automacao de QA. O escopo atual e exclusivamente estrutural; nao ha testes funcionais completos de API, Web, Mobile ou Performance.

Modulos planejados:

- `testes-api`: Java, Maven, REST Assured, JUnit 5, Allure e ServeRest local.
- `testes-web-e2e`: Cypress, TypeScript, Cucumber/Gherkin, Page Object Pattern, Allure e Automation Exercise.
- `testes-mobile`: Java, Maven, Appium, UiAutomator2, JUnit 5, Screen Object Pattern, Allure e Sauce Labs My Demo App Android.
- `testes-performance`: k6, ServeRest local, cenario smoke e cenario de carga com 500 VUs.

## Tecnologias e aplicacoes

- ServeRest local: `http://localhost:3000`
- URL de rede do container ServeRest: `http://serverest:3000`
- Health check do ServeRest: `http://localhost:3000/status`
- Automation Exercise: `https://automationexercise.com`
- Sauce Labs My Demo App Android, versao planejada `2.2.0`:
  - repositorio: https://github.com/saucelabs/my-demo-app-android
  - releases: https://github.com/saucelabs/my-demo-app-android/releases

O APK nao e baixado nem versionado nesta fase.

Versoes fixadas ficam em `versions.properties`. O projeto utiliza Java 17, Maven, Node.js, npm, TypeScript, Cypress, Appium e k6 conforme a disponibilidade de cada modulo.

## Arquitetura e estrutura de pastas

O repositorio adota um monorepo com modulos independentes e scripts compartilhados:

```text
.github/workflows/
testes-api/
testes-web-e2e/
testes-mobile/
  apps/
  config/devices/
  config/capabilities/
  scripts/
testes-performance/
  cenarios/
  config/
  relatorios/
scripts/
documentacao/
relatorios/
```

Detalhes de arquitetura, decisoes, estrategia e matriz de testes estao em [documentacao](documentacao).

## Pre-requisitos e instalacao

Para o diagnostico completo, instale manualmente Git, Docker com Docker Compose, Java 17, Maven, Node.js com npm e, quando necessario, Android SDK, adb, emulador, Appium, UiAutomator2 e k6.

O bootstrap instala somente dependencias do projeto e copia arquivos de exemplo para arquivos locais ignorados pelo Git. Ele nao instala silenciosamente Docker, Android Studio, Java ou Android SDK e nao altera variaveis de ambiente do sistema.

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
```

Linux/macOS:

```sh
./scripts/bootstrap.sh
```

## Diagnostico do ambiente

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
```

Linux/macOS:

```sh
chmod +x scripts/*.sh
./scripts/doctor.sh
```

Os scripts de diagnostico sao somente leitura e verificam Git, Docker, Docker Compose, Java, Maven, Node, npm, Android SDK, adb, emulador, Appium, UiAutomator2 e k6.

## Execucao local

Os scripts abaixo validam a prontidao do modulo e executam apenas comandos padrao quando existem arquivos implementados:

```powershell
.\scripts\run-api.ps1
.\scripts\run-web.ps1
.\scripts\run-mobile.ps1
.\scripts\run-performance.ps1
.\scripts\run-all.ps1
```

No Linux/macOS, use os equivalentes `.sh` da pasta `scripts`.

Como os testes funcionais ainda nao foram implementados, os modulos permanecem em estado de fundacao.

## Execucao com Docker

Para iniciar o ServeRest:

```powershell
docker compose up -d serverest
```

Para validar a configuracao:

```powershell
docker compose config
```

O Compose utiliza a imagem fixada `paulogoncalvesbh/serverest:3.2.0` e expoe a porta 3000.

## Dados, relatorios e CI/CD

API e Performance usarao o ServeRest local. As fases futuras devem isolar dados gerados por execucao e evitar estado compartilhado mutavel. Os fluxos Web e Mobile devem preferir preparacao e limpeza deterministicas por meio de helpers de API quando possivel.

Allure sera o formato padrao para API, Web e Mobile. Resumos do k6 serao armazenados em `testes-performance/relatorios/`; relatorios gerados ficam em `relatorios/` e sao ignorados pelo Git.

CI/CD esta documentado, mas nao implementado nesta fase. O desenho futuro deve executar API, Web e Performance em jobs compatíveis com Docker e Mobile em um emulador Android configurado no GitHub Actions.

## Aplicacoes e limitacoes

A execucao Mobile exige Android SDK, platform tools, emulador, Appium, driver UiAutomator2 e um caminho local para o APK. Em dispositivo fisico, tambem serao necessarios `UDID`, depuracao USB e versoes de plataforma compativeis.

As limitacoes conhecidas e os riscos estao em [limitacoes-conhecidas.md](documentacao/limitacoes-conhecidas.md). Os procedimentos de suporte estao em [solucao-de-problemas.md](documentacao/solucao-de-problemas.md).

## Politica de segredos

Nunca versione arquivos `.env` reais, credenciais, tokens, chaves, APKs ou relatorios gerados. Use `.env.example` e os arquivos de exemplo dos modulos como modelos. Nenhum segredo real faz parte desta fundacao.

## Politica de versionamento

As alteracoes devem ser pequenas, justificadas e validadas antes do commit. Nao use `latest` nas dependencias ou imagens. A estrategia de testes esta em [estrategia-de-testes.md](documentacao/estrategia-de-testes.md) e a matriz em [matriz-de-testes.md](documentacao/matriz-de-testes.md).

## Documentacao

- [Arquitetura](documentacao/arquitetura.md)
- [Decisoes arquiteturais](documentacao/decisoes.md)
- [Estrategia de testes](documentacao/estrategia-de-testes.md)
- [Matriz de testes](documentacao/matriz-de-testes.md)
- [Limitacoes conhecidas](documentacao/limitacoes-conhecidas.md)
- [Solucao de problemas](documentacao/solucao-de-problemas.md)

## Execução local

Os scripts abaixo validam a prontidão do módulo e executam apenas comandos padrão quando existem arquivos implementados:

```powershell
.\scripts\run-api.ps1
.\scripts\run-web.ps1
.\scripts\run-mobile.ps1
.\scripts\run-performance.ps1
.\scripts\run-all.ps1
```

No Linux/macOS, use os equivalentes `.sh` da pasta `scripts`.

Como os testes funcionais ainda não foram implementados, os módulos permanecem em estado de fundação.

## Execução com Docker

Para iniciar o ServeRest:

```powershell
docker compose up -d serverest
```

Para validar a configuração:

```powershell
docker compose config
```

O Compose utiliza a imagem fixada `paulogoncalvesbh/serverest:3.2.0` e expõe a porta 3000.

## Dados, relatórios e CI/CD

API e Performance usarão o ServeRest local. As fases futuras devem isolar dados gerados por execução e evitar estado compartilhado mutável. Os fluxos Web e Mobile devem preferir preparação e limpeza determinísticas por meio de helpers de API quando possível.

Allure será o formato padrão para API, Web e Mobile. Resumos do k6 serão armazenados em `testes-performance/relatorios/`; relatórios gerados ficam em `relatorios/` e são ignorados pelo Git.

CI/CD está documentado, mas não implementado nesta fase. O desenho futuro deve executar API, Web e Performance em jobs compatíveis com Docker e Mobile em um emulador Android configurado no GitHub Actions.

## Aplicações e limitações

A execução Mobile exige Android SDK, platform tools, emulador, Appium, driver UiAutomator2 e um caminho local para o APK. Em dispositivo físico, também serão necessários `UDID`, depuração USB e versões de plataforma compatíveis.

As limitações conhecidas e os riscos estão em [limitacoes-conhecidas.md](documentacao/limitacoes-conhecidas.md). Os procedimentos de suporte estão em [solucao-de-problemas.md](documentacao/solucao-de-problemas.md).

## Política de segredos

Nunca versione arquivos `.env` reais, credenciais, tokens, chaves, APKs ou relatórios gerados. Use `.env.example` e os arquivos de exemplo dos módulos como modelos. Nenhum segredo real faz parte desta fundação.

## Política de versionamento

As alterações devem ser pequenas, justificadas e validadas antes do commit. Não use `latest` nas dependências ou imagens. A estratégia de testes está em [estrategia-de-testes.md](documentacao/estrategia-de-testes.md) e a matriz em [matriz-de-testes.md](documentacao/matriz-de-testes.md).

## Documentação

- [Arquitetura](documentacao/arquitetura.md)
- [Decisões arquiteturais](documentacao/decisoes.md)
- [Estratégia de testes](documentacao/estrategia-de-testes.md)
- [Matriz de testes](documentacao/matriz-de-testes.md)
- [Limitações conhecidas](documentacao/limitacoes-conhecidas.md)
- [Solução de problemas](documentacao/solucao-de-problemas.md)
