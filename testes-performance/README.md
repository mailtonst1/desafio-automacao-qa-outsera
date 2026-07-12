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

Os arquivos `summary.json`, `summary.txt` e `summary.html` sao gerados em `relatorios/` e ignorados pelo Git.
