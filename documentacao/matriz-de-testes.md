# Matriz de testes

| Modulo | Quantidade implementada | Cobertura | Situacao verificada |
| --- | ---: | --- | --- |
| API | 43 casos JUnit | ServeRest: autenticacao, usuarios, produtos, carrinhos, schemas e headers de seguranca | Implementado e executado; 43 aprovados em 17/07/2026 |
| Web E2E | 11 cenarios Gherkin | Automation Exercise: autenticacao, carrinho, checkout e acessibilidade de login, catalogo, carrinho e checkout | Implementado; 4 cenarios de acessibilidade executados e reprovados em 17/07/2026 por violacoes do alvo |
| Mobile | 6 casos JUnit | My Demo App Android: catalogo, login, produto e formulario de checkout | Implementado; aprovado no CI em 17/07/2026 e nao executado localmente por ausencia de dispositivo Android conectado |
| Performance | 2 perfis k6 | ServeRest: criacao de usuario no setup, login, listagem de produtos e consulta de produto | Implementado e executado; fumaca e carga aprovados em 17/07/2026 |

O total funcional implementado e 60: 43 API, 11 Web E2E e 6 Mobile. Os dois perfis k6 nao entram nessa soma porque representam execucoes de performance, nao casos funcionais. Implementado indica existencia no codigo; executado e aprovado ou reprovado descrevem o ultimo resultado conhecido; dependente de ambiente indica que a execucao nao foi confirmada na estacao atual.

## Performance/K6

| Perfil | Modelo de carga | Requests por iteracao | Checks | Thresholds | Situacao conhecida |
| --- | --- | --- | --- | --- | --- |
| Fumaca | 5 VUs por 30 s | `POST /login`, `GET /produtos`, `GET /produtos/{id}` | Login 200 e com autorizacao; lista 200 e com itens; produto 200 e com nome | Erros HTTP < 1%; checks > 99%; p95 < 1000 ms | Aprovado em 17/07/2026: 0% de erros, 100% de checks e p95 de 23,52 ms |
| Carga | 1 min ate 500 VUs, 5 min em 500 VUs e 1 min de reducao | `POST /login`, `GET /produtos`, `GET /produtos/{id}` | Os mesmos seis checks do fluxo | Os mesmos tres thresholds | Aprovado em 17/07/2026: 0% de erros, 100% de checks e p95 de 798,88 ms |

O `setup` de ambos os perfis faz `POST /usuarios` e verifica status 201 uma vez por execucao. Nao ha teste de busca, alteracao ou remocao de produtos, nem fluxo de carrinho sob carga. O usuario criado no setup nao e removido ao final. Os resultados medem o ServeRest local e dependem da capacidade da maquina e do Docker; nao devem ser comparados diretamente entre ambientes diferentes.
