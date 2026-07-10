# Testes automatizados de API

Módulo de automação do ServeRest 3.2.0 com Java 17, Maven Wrapper, REST Assured, JUnit 5, Jackson, JSON Schema Validator e Allure.

## Objetivo e escopo

O módulo valida autenticação, usuários, produtos, carrinhos e headers de segurança contra o ServeRest local. Os cenários usam dados exclusivos por execução e removem recursos criados após cada teste.

Não faz parte deste módulo a automação Web, Mobile, Performance ou workflows de CI/CD.

## Arquitetura

- `configuracao`: lê `BASE_URL` ou usa `http://localhost:3000`.
- `especificacao`: centraliza URL, headers, timeout e filtro de evidências.
- `cliente`: encapsula rotas e métodos HTTP, sem assertions de negócio.
- `fabrica`: cria payloads exclusivos com UUID, sem dados pessoais reais.
- `suporte`: registra e remove carrinhos, produtos e usuários criados.
- `teste`: organiza cenários por recurso e contrato.
- `resources/esquemas`: schemas JSON das respostas positivas principais.

Client Objects evitam repetição de rotas e detalhes HTTP; Data Factory evita colisões de dados; specifications centralizam configuração. Os testes são independentes para permitir execução em qualquer ordem.

## Execução

Com Docker e Docker Compose, sem Java ou Maven no computador:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\executar-api.ps1 -Perfil completa -GerarRelatorio
```

Smoke:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\executar-api.ps1 -Perfil smoke
```

Linux/macOS:

```sh
./scripts/executar-api.sh --regressao --gerar-relatorio
```

Para manter o ServeRest ativo após a execução, use `-ManterAmbiente` ou `--manter-ambiente`.

Execução local com o Wrapper:

```powershell
cd testes-api
.\mvnw.cmd test
```

Defina `BASE_URL` para apontar a outro ambiente apenas quando necessário. O alvo padrão e recomendado é o ServeRest local.

## Relatórios

- Surefire local: `testes-api/target/surefire-reports`
- Allure results local: `testes-api/target/allure-results`
- Resultados Docker: `relatorios/api/allure-results`
- HTML Docker: `relatorios/api/allure-report`

Os relatórios são gerados e ignorados pelo Git. As evidências Allure mascaram o header e o campo `authorization`.

## Tecnologias e versões

- Java 17
- Maven Wrapper 3.3.4 com Maven 3.9.9
- REST Assured e JSON Schema Validator 5.5.0
- JUnit 5.11.4
- Jackson 2.17.3
- Allure JUnit 5 2.29.1, commandline 2.30.0 e Allure Maven 2.15.2
- ServeRest Docker `paulogoncalvesbh/serverest:3.2.0`

Consulte [contrato-api-observado.md](../documentacao/contrato-api-observado.md) para as respostas observadas e [decisoes.md](../documentacao/decisoes.md) para as decisões de compatibilidade.
