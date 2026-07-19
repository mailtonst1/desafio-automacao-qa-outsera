# Analise de Performance

## Ambiente

- Alvo: ServeRest local `3.2.0`, acessado pelo Compose em `http://serverest:3000`.
- Gerador: `grafana/k6:0.56.0`.
- Maquina: Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz, 14 nucleos e 31,91 GB de memoria fisica.
- Data da execucao: 17/07/2026.

## Thresholds

- `http_req_failed`: menor que 1%.
- `checks`: acima de 99%.
- `http_req_duration`: p95 menor que 1000 ms.

Os tres thresholds foram aprovados na carga.

## Fumaca

Perfil de 5 VUs por 30 segundos, com 436 requisicoes. O resultado foi 0% de erros, 100% de checks e p95 de 23,52 ms. O p50 foi 10,57 ms, o p90 foi 20,78 ms e o p99 foi 30,62 ms.

## Carga

O perfil executou um minuto de ramp-up, 500 VUs por cinco minutos completos e um minuto de ramp-down. A duracao medida foi 420,51 s.

| Metrica | Resultado |
| --- | ---: |
| VUs maximos | 500 |
| Requisicoes | 252.478 |
| Requisicoes por segundo | 600,40 |
| Iteracoes | 84.159 |
| Checks | 100% |
| Taxa de erro | 0% |
| p50 | 383,99 ms |
| p90 | 701,94 ms |
| p95 | 798,88 ms |
| p99 | 1001,79 ms |
| Dados enviados | 33.748.045 bytes |
| Dados recebidos | 179.090.857 bytes |

## Analise

O p95 permaneceu abaixo do limite de 1000 ms e nao houve falhas HTTP. O p99 ligeiramente acima de um segundo indica variacao de cauda sob a saturacao de 500 VUs, mas nao viola o threshold definido para p95. Os resultados representam um ambiente local compartilhado; CPU, memoria, Docker e outros processos da maquina influenciam a comparacao com futuras execucoes.

Os relatorios locais foram gerados em `testes-performance/relatorios/fumaca/` e `testes-performance/relatorios/carga/`, com `summary.json`, `summary.txt`, `summary.html` e `dashboard.html` por perfil. Eles sao evidencias ignoradas pelo Git e devem ser regenerados em cada medicao.
