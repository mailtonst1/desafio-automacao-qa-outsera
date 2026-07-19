# Relatorio Unificado

Este modulo recebe os resultados Allure de API, Web e Mobile e converte os resumos k6 de fumaca e carga em resultados Allure. O Allure permanece consolidando todos os modulos. A entrada estatica do Pages aponta para `allure/index.html` e para os dashboards oficiais k6 em `performance/fumaca/index.html` e `performance/carga/index.html`; JSON e TXT continuam como evidencias tecnicas.

## Execucao

No CI, os artifacts dos jobs anteriores sao baixados e preparados automaticamente. Para gerar localmente, instale as dependencias e forneca os diretorios de resultados:

```powershell
npm ci
npm test
npm run preparar -- --api entradas/api --web-funcional entradas/web-funcional --web-acessibilidade entradas/web-acessibilidade --mobile entradas/mobile
npm run converter-k6 -- --origem testes-performance/relatorios/fumaca --destino temporario --perfil Fumaca
npm run converter-k6 -- --origem testes-performance/relatorios/carga --destino temporario --perfil Carga
npm run gerar
npm run preparar-publicacao -- --fumaca testes-performance/relatorios/fumaca --carga testes-performance/relatorios/carga
npm run validar-portal
```

Os arquivos gerados ficam em `saida/`, sao publicados como artifact e permanecem ignorados pelo Git.

## Entradas, evidencias e diagnostico

`entradas/api`, `entradas/web-funcional`, `entradas/web-acessibilidade` e `entradas/mobile` recebem os resultados brutos. Os dois conjuntos Web continuam no módulo `Web E2E`, identificados pelas labels de origem `Funcional` e `Acessibilidade`. `temporario` contem a normalizacao e os resultados convertidos do k6; `saida` contem o portal, `summary.json`, `portal.json`, `allure/index.html` e os dashboards. `npm ci` instala a unica dependencia Node declarada, Allure 3.14.2. `preparar-resultados.mjs` identifica os modulos, `converter-k6.mjs` transforma summaries em resultados Allure e `preparar-publicacao.mjs` organiza a publicacao usando o status de `saida/summary.json` e as metricas reais dos resultados normalizados.

`npm test` cobre aprovacao, bloqueio exclusivo por acessibilidade, bloqueio por outras falhas de qualidade, adulteracoes de status, metricas e rastreabilidade, além da coerência esperada após o deploy. Depois da geracao, `npm run validar-portal` recalcula os modulos e a acessibilidade a partir dos resultados Allure, compara tudo com `summary.json`, `portal.json` e HTML e interrompe a pipeline se houver divergencia. Em push na `main`, `npm run validar-publicacao` também verifica a URL entregue pelo Pages, seus links e o `portal.json` público. Em pull requests, o portal registra numero da PR, branch de origem, Head SHA e link da execucao.

O Allure consolida resultados e anexos de API, Web e Mobile; os dashboards k6 continuam sendo a visualizacao de series temporais de performance. Se faltar um modulo, confirme primeiro o artifact correspondente e se o diretorio `allure-results` ou `summary.json` foi copiado. O job `relatorio-unificado` baixa todos os artifacts, publica `relatorio-allure-unificado` e o job Pages envia somente `saida/` apos push na `main`.
