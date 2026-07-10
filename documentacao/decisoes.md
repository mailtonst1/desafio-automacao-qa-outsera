# Decisoes arquiteturais

| ID | Decisao | Justificativa |
| --- | --- | --- |
| ADR-001 | Usar um monorepo na pasta existente `outsera`. | Mantem o desafio coeso e atende ao formato solicitado para o repositorio. |
| ADR-002 | Fixar o ServeRest em `paulogoncalvesbh/serverest:3.2.0`. | Evita resultados nao deterministas causados por tags flutuantes. |
| ADR-003 | Manter o APK Mobile fora do Git. | Evita divergencia de binarios e conserva o repositorio leve. |
| ADR-004 | Documentar CI, mas nao implementa-lo nesta fase. | Respeita o limite definido para esta etapa. |
