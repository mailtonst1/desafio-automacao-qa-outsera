# Contrato de API observado

## Ambiente da exploração

- Data: 10/07/2026
- API: ServeRest 3.2.0
- URL: `http://localhost:3000`
- Documento OpenAPI: `GET /swagger.json`

## Rotas e comportamentos confirmados

| Recurso | Rotas observadas | Comportamentos utilizados nos testes |
| --- | --- | --- |
| Autenticação | `POST /login` | Credenciais válidas retornam 200, `message` e `authorization` com prefixo `Bearer `. Credenciais inválidas retornam 401. Campos ausentes retornam 400 com a chave do campo. JSON malformado retorna 400. |
| Usuários | `GET/POST /usuarios`, `GET/PUT/DELETE /usuarios/{_id}` | Criação retorna 201. E-mail duplicado retorna 400. ID com formato válido e inexistente retorna 400. PUT em ID inexistente cria o usuário e retorna 201. |
| Produtos | `GET/POST /produtos`, `GET/PUT/DELETE /produtos/{_id}` | Escrita exige token de administrador. Token ausente ou inválido retorna 401; usuário comum retorna 403. Nome duplicado retorna 400. PUT em ID inexistente cria quando o nome é único. |
| Carrinhos | `GET/POST /carrinhos`, `GET /carrinhos/{_id}`, `DELETE /carrinhos/concluir-compra`, `DELETE /carrinhos/cancelar-compra` | Criação exige token, produto existente e quantidade válida. Há no máximo um carrinho por usuário. Cancelar reabastece estoque; concluir reduz estoque. |

## Validações adicionais

- `PATCH /usuarios` retornou 405 e mensagem explicando que o método não é suportado.
- IDs inválidos por formato retornam 400 antes da busca de recurso; por isso os testes de inexistência usam IDs alfanuméricos de 16 caracteres.
- `GET /status` retornou 200 e os headers `Strict-Transport-Security`, `X-Content-Type-Options`, `X-DNS-Prefetch-Control`, `X-Download-Options`, `X-Frame-Options` e `X-XSS-Protection`; `X-Powered-By` não foi retornado.

## Decisões para a suíte

As assertions fixam somente comportamentos confirmados nesta versão. Mensagens específicas são verificadas quando estáveis; para validações de campo obrigatório, a suíte valida a chave retornada. Tokens não são persistidos nem expostos em relatórios.

## Limitações

O ambiente é descartável e local. Dados de testes não dependem dos registros pré-cadastrados do ServeRest.
