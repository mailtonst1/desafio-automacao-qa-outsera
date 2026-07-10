# Limitacoes conhecidas

- As suites de testes funcionais nao foram implementadas nesta fase.
- Os workflows de CI/CD nao foram implementados nesta fase.
- A execucao Mobile depende de Android SDK local, emulador, Appium e caminho valido para o APK.
- O APK do Sauce Labs My Demo App Android nao e baixado nem versionado.
- O bootstrap nao instala Docker, Android Studio ou Java e nao altera variaveis de ambiente do sistema silenciosamente.

## Vulnerabilidades transitivas do npm

Em 10/07/2026, `npm audit` foi executado no modulo `testes-web-e2e` apos a criacao do `package-lock.json`. O resultado real foi de 12 vulnerabilidades transitivas: 1 baixa, 10 moderadas, 1 alta e nenhuma critica.

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

Foi executado `npm audit fix --package-lock-only` sem `--force`; nenhuma vulnerabilidade foi resolvida. O npm informou que a correcao completa exigiria `cypress@15.18.1` e/ou `@badeball/cypress-cucumber-preprocessor@26.0.0`, o que representa atualizacao de versao principal e risco de incompatibilidade com a stack planejada. As vulnerabilidades permanecem registradas e devem ser reavaliadas antes da implementacao dos testes funcionais.
