# Relatorio Unificado

Este modulo recebe os resultados Allure de API, Web e Mobile e converte os resumos k6 de fumaca e carga em resultados Allure. O Allure permanece consolidando todos os modulos. A entrada estatica do Pages aponta para `allure/index.html` e para os dashboards oficiais k6 em `performance/fumaca/index.html` e `performance/carga/index.html`; JSON e TXT continuam como evidencias tecnicas.

## Execucao

No CI, os artifacts dos jobs anteriores sao baixados e preparados automaticamente. Para gerar localmente, instale as dependencias e forneca os diretorios de resultados:

```powershell
npm ci
npm run preparar -- --api entradas/api --web entradas/web --mobile entradas/mobile
npm run converter-k6 -- --origem testes-performance/relatorios/fumaca --destino temporario --perfil Fumaca
npm run converter-k6 -- --origem testes-performance/relatorios/carga --destino temporario --perfil Carga
npm run gerar
npm run preparar-publicacao -- --fumaca testes-performance/relatorios/fumaca --carga testes-performance/relatorios/carga
```

Os arquivos gerados ficam em `saida/`, sao publicados como artifact e permanecem ignorados pelo Git.
