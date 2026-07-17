# Testes de Performance

Testes k6 executados exclusivamente contra o ServeRest local.

## Perfis

- `fumaca`: 5 VUs durante 30 segundos.
- `carga`: ramp-up de 1 minuto, 500 VUs por 5 minutos e ramp-down de 1 minuto.

Cada iteracao autentica, lista produtos e consulta um produto. O `setup` cria uma credencial unica por execucao, evitando escrita recorrente durante a carga.

## Execucao

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\executar-performance.ps1 -Perfil fumaca
powershell -ExecutionPolicy Bypass -File .\scripts\executar-performance.ps1 -Perfil carga
```

No shell POSIX:

```sh
./scripts/executar-performance.sh fumaca
./scripts/executar-performance.sh carga
```

`BASE_URL` aceita somente `localhost`, `127.0.0.1` e `serverest`. A execucao por Compose usa `http://serverest:3000`; a execucao direta do k6 usa por padrao `http://localhost:3000`.

## Limites e relatorios

Os thresholds iniciais sao taxa de falha HTTP menor que 1%, checks acima de 99% e p95 menor que 1000 ms. Use `LIMITE_FALHAS_HTTP`, `LIMITE_CHECKS` e `LIMITE_P95_MS` apenas para sobrescrever o ambiente de avaliacao.

O Web Dashboard oficial do k6 0.56.0 gera `dashboard.html` autocontido, com graficos ao longo do tempo, thresholds e percentis. Os arquivos `summary.json`, `summary.txt` e `summary.html` permanecem como evidencias tecnicas em `relatorios/fumaca/` ou `relatorios/carga/`; os scripts exibem o resumo do perfil recem-executado. Todos sao ignorados pelo Git e publicados como artifacts. O Pages publica os dashboards de [fumaca](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/fumaca/) e [carga](https://mailtonst1.github.io/desafio-automacao-qa-outsera/performance/carga/).

## Arquitetura e interpretacao

Usa k6 0.56.0 e ServeRest local. `cenarios` define os perfis; `suporte/fluxo.js` autentica, lista produtos e consulta um produto; `configuracao/limites.js` aplica thresholds; `suporte/relatorio.js` preserva summaries. A protecao de `BASE_URL` aceita somente `localhost`, `127.0.0.1` e `serverest`.

Fumaca confirma o fluxo com 5 VUs por 30 segundos. Carga executa ramp-up de um minuto, 500 VUs por cinco minutos e ramp-down de um minuto. Analise erro HTTP, checks, requisicoes por segundo e p50/p90/p95/p99 no dashboard; comparacoes entre maquinas nao sao equivalentes sem capacidade semelhante. Os jobs `performance-fumaca` e `performance-carga` publicam artifacts separados.

Em Docker use os scripts da raiz; eles sobem e removem o ServeRest. Se o dashboard nao existir, valide `docker compose config`, permissao de escrita em `testes-performance/relatorios` e as variaveis `K6_WEB_DASHBOARD*` do servico. JSON/TXT/HTML simples sao evidencias tecnicas, enquanto `dashboard.html` e o relatorio visual oficial.
