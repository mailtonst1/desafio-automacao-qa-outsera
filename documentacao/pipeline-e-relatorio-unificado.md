# Pipeline e Relatorio Unificado

## Jobs

`qualidade.yml` executa validacao, API, Web E2E, Mobile e k6 de fumaca em paralelo depois da validacao. O relatorio unificado executa sempre, baixa os artifacts disponiveis e publica `relatorio-allure-unificado`. O `quality-gate` so aprova quando os quatro jobs obrigatorios foram concluídos com sucesso.

`carga-performance.yml` e manual e executa apenas o perfil de 500 VUs. Ele nao participa das execucoes de push e pull request.

## Allure

O projeto `relatorio-unificado` usa Allure Report `3.14.2`, fixado no `package-lock.json`. Os scripts copiam os resultados para uma area temporaria, acrescentam labels de modulo e mantem os arquivos de origem inalterados. O k6 e representado por somente dois casos: Fumaca e Carga de 500 usuarios, cada um com os tres summaries anexados.

Para gerar localmente a partir de evidencias existentes:

```powershell
.\scripts\gerar-relatorio-unificado.ps1
```

```sh
bash ./scripts/gerar-relatorio-unificado.sh
```

O HTML autocontido fica em `relatorio-unificado/saida/index.html` e nao e versionado.

## Evidencias

Os jobs publicam `resultados-api`, `resultados-web`, `resultados-mobile` e `resultados-performance` mesmo em falha. O consolidado e publicado como `relatorio-allure-unificado`.

## Pages

Em pushes para `main`, o workflow tenta publicar o artifact no GitHub Pages sem bloquear o quality gate. A disponibilidade depende de Pages estar habilitado no repositorio; nenhuma URL e presumida pelo projeto.
