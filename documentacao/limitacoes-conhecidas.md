# Limitacoes conhecidas

- Os workflows de qualidade e carga estao implementados no GitHub Actions; a publicacao do Pages depende da configuracao do repositorio.
- A execucao Mobile depende de Android SDK local, emulador, Appium e caminho valido para o APK.
- O APK do Sauce Labs My Demo App Android e baixado sob demanda e nao e versionado.
- O bootstrap nao instala Docker, Android Studio ou Java e nao altera variaveis de ambiente do sistema silenciosamente.
- A execução Linux/macOS do script de API requer `sh`, `curl`, Docker e Docker Compose disponíveis no ambiente. A validação sintática Bash depende de um shell POSIX no computador executor.
- O relatório HTML é gerado sob demanda pela opção `GerarRelatorio`/`--gerar-relatorio`; os resultados Allure são sempre preservados no caminho de relatórios.

## Vulnerabilidades do toolchain npm

Em 19/07/2026, `npm audit` e `npm audit --omit=dev` foram executados separadamente em `testes-web-e2e` e `relatorio-unificado`. Os dois audits sem dependencias de desenvolvimento retornaram zero vulnerabilidades, portanto nao ha dependencia de runtime afetada. O projeto usa esses pacotes somente para executar testes e gerar relatorios em ambiente controlado de CI.

| Modulo | Pacote afetado | Severidade | Classificacao | Correcao informada pelo npm | Risco real neste projeto |
| --- | --- | --- | --- | --- | --- |
| Web E2E | `serialize-javascript` | Alta | Desenvolvimento, transitiva via Mocha | Atualizacoes transitivas nao aplicadas pelo `npm audit fix --dry-run`; a resolucao completa exige major do Cypress/preprocessador | A exploracao exige objetos manipulados durante a execucao local do runner; o pacote nao compoe aplicacao publicada nem recebe trafego de producao. |
| Web E2E | `cypress` | Moderada | Desenvolvimento, direta | `cypress@15.18.1`, versao principal posterior a 14.0.1 | A mudanca principal pode quebrar plugins, configuracao e reporter; deve ser tratada em atualizacao dedicada da stack. |
| Web E2E | `@badeball/cypress-cucumber-preprocessor` | Moderada | Desenvolvimento, direta | `26.0.0`, versao principal posterior a 22.0.1 | A mudanca principal pode alterar integracao, bundler e descoberta de steps. |
| Web E2E | Cucumber, `@cypress/request`, `diff`, `mocha`, `qs` e `uuid` | Baixa/Moderada | Desenvolvimento, transitiva | Vinculada aos majors do Cypress/preprocessador; nenhuma alteracao segura no dry-run | Exposicao limitada ao processamento de testes e fixtures controladas no runner. |
| Relatorio | `allure` | Alta | Desenvolvimento, direta | O npm sugere `allure@0.0.0` como mudanca principal, que e downgrade invalido para a geracao atual | Usado apenas para consolidar artifacts produzidos pela propria pipeline; nao faz parte do portal em runtime. |
| Relatorio | `adm-zip` | Alta | Desenvolvimento, transitiva via Allure | Sem atualizacao segura independente; vinculada ao downgrade principal do Allure | O risco de alocacao excessiva depende de ZIP malicioso; a pipeline processa somente artifacts do mesmo run e repositorio. |

O `npm audit fix --dry-run` do Web informou zero pacotes alterados. Nao foi usado `npm audit fix --force`: as alternativas oferecidas incluem breaking changes na stack de testes ou downgrade invalido do gerador, com risco maior do que a exposicao residual do toolchain. As dependencias devem ser reavaliadas em uma atualizacao dedicada, com regressao completa.

## Web E2E

- A Automation Exercise usa validacao HTML nativa nos campos obrigatorios de login e pagamento; os cenarios negativos verificam essa validacao sem depender de mensagem localizada do navegador.
- O formulario de pagamento aceita o numero informado. Nao ha validacao real de cartao invalido, portanto esse cenario nao foi criado.
- Em 17/07/2026, os testes axe de login, catalogo, carrinho e checkout reprovaram por violacoes `serious` e `critical` do alvo externo. Foram observados contraste insuficiente, botoes sem nome acessivel e campo sem rotulo; essas regras permanecem bloqueantes e registradas no Allure.

| Pacote afetado | Severidade | Origem ou impacto reportado |
| --- | --- | --- |
| `@badeball/cypress-cucumber-preprocessor` | Moderada | Dependencias transitivas de Cucumber, Cypress e `uuid`. |
| `@cucumber/cucumber` | Moderada | Dependencias transitivas de Gherkin, mensagens e `uuid`. |
| `@cucumber/gherkin` | Moderada | Dependencia transitiva de `@cucumber/messages`. |
| `@cucumber/gherkin-utils` | Moderada | Dependencias transitivas de Gherkin e mensagens. |
| `@cucumber/messages` | Moderada | `uuid` transitivo. |
| `@cypress/request` | Moderada | `qs` e `uuid` transitivos. |
| `cypress` | Moderada | `@cypress/request` vulneravel na faixa usada. |
| `diff` | Baixa | DoS no `parsePatch` e `applyPatch` do jsdiff. |
| `mocha` | Moderada | `diff` e `serialize-javascript` transitivos. |
| `qs` | Moderada | DoS acionavel remotamente em combinacao especifica de serializacao. |
| `serialize-javascript` | Alta | RCE por propriedades de RegExp/data e exaustao de CPU. |
| `uuid` | Moderada | Falta de verificacao de limites de buffer em funcoes v3/v5/v6. |

## Mobile

- A suite foi validada em emulador Android local; ela nao inicia nem encerra emuladores para evitar interferir em outros dispositivos.
- O formulario de checkout da versao 2.2.0 exige nome completo e informa `Please provide your full name.` quando o campo permanece vazio.
