# Analise de Performance

## Ambiente

- Alvo: ServeRest local `3.2.0`, acessado pelo Compose em `http://serverest:3000`.
- Gerador: `grafana/k6:0.56.0`.
- Maquina: Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz, 14 nucleos e 31,91 GB de memoria fisica.
- Data da execucao: 12/07/2026.

## Thresholds

- `http_req_failed`: menor que 1%.
- `checks`: acima de 99%.
- `http_req_duration`: p95 menor que 1000 ms.

Os tres thresholds foram aprovados na carga.

## Fumaca

Perfil de 5 VUs por 30 segundos, com 451 requisicoes. O resultado foi 0% de erros, 100% de checks e p95 de 25,43 ms. O p90 observado foi 20,23 ms; o p99 nao foi incluido no resumo dessa primeira execucao.

## Carga

O perfil executou um minuto de ramp-up, 500 VUs por cinco minutos completos e um minuto de ramp-down. A duracao medida foi 420,82 s.

| Metrica | Resultado |
| --- | ---: |
| VUs maximos | 500 |
| Requisicoes | 247.750 |
| Requisicoes por segundo | 588,73 |
| Iteracoes | 82.583 |
| Checks | 100% |
| Taxa de erro | 0% |
| p50 | 401,69 ms |
| p90 | 734,69 ms |
| p95 | 829,42 ms |
| p99 | 1027,69 ms |
| Dados enviados | 33.116.069 bytes |
| Dados recebidos | 175.737.129 bytes |

## Analise

O p95 permaneceu abaixo do limite de 1000 ms e nao houve falhas HTTP. O p99 acima de um segundo indica variacao de cauda sob a saturacao de 500 VUs, mas nao viola o threshold definido para p95. Os resultados representam um ambiente local compartilhado; CPU, memoria, Docker e outros processos da maquina influenciam a comparacao com futuras execucoes.

Os relatorios locais gerados foram `testes-performance/relatorios/summary.json`, `testes-performance/relatorios/summary.txt` e `testes-performance/relatorios/summary.html`. Eles sao evidencias ignoradas pelo Git e devem ser regenerados em cada medicao.
