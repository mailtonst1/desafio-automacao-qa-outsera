# Relatorio Unificado

Este modulo recebe os resultados Allure de API, Web e Mobile e converte os resumos k6 de fumaca e carga em resultados Allure. O HTML final e uma entrada estatica para GitHub Pages: `index.html` aponta para `allure/index.html` e para os dois relatorios de performance.

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
