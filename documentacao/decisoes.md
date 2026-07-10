# Decisoes arquiteturais

| ID | Decisao | Justificativa |
| --- | --- | --- |
| ADR-001 | Usar um monorepo na pasta existente `outsera`. | Mantem o desafio coeso e atende ao formato solicitado para o repositorio. |
| ADR-002 | Fixar o ServeRest em `paulogoncalvesbh/serverest:3.2.0`. | Evita resultados nao deterministas causados por tags flutuantes. |
| ADR-003 | Manter o APK Mobile fora do Git. | Evita divergencia de binarios e conserva o repositorio leve. |
| ADR-004 | Documentar CI, mas nao implementa-lo nesta fase. | Respeita o limite definido para esta etapa. |
| ADR-005 | Manter REST Assured 5.5.0 e usar evidências Allure sanitizadas próprias. | Preserva a versão planejada e evita incompatibilidade com versões recentes de `allure-rest-assured`, além de impedir exposição de tokens. O adaptador JUnit permanece em 2.29.1; o commandline fixado em 2.30.0 é necessário porque não há artefato `allure-commandline` 2.29.1 no Maven Central. |
| ADR-006 | Executar a suíte em container Docker pelo script principal. | Permite execução com Docker/Compose mesmo sem Java ou Maven instalados no computador avaliador. |
| ADR-007 | Usar dados exclusivos e limpeza após cada teste. | Evita dependência de ordem, colisão com dados pré-existentes e sujeira entre execuções. |
