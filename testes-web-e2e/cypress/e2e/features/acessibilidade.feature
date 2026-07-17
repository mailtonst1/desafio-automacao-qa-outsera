# language: pt

@regressao @acessibilidade
Funcionalidade: Acessibilidade das jornadas criticas
  Como pessoa usuaria da loja
  Quero acessar as jornadas criticas sem barreiras graves de acessibilidade
  Para navegar e concluir uma compra com autonomia

  Cenario: Validar acessibilidade da pagina de login
    Dado que o visitante acessa a pagina de login
    Entao a pagina nao deve apresentar violacoes relevantes de acessibilidade

  Cenario: Validar acessibilidade do catalogo de produtos
    Dado que o visitante acessa o catalogo de produtos
    Entao a pagina nao deve apresentar violacoes relevantes de acessibilidade

  Cenario: Validar acessibilidade do carrinho
    Dado que o visitante adiciona o produto Blue Top ao carrinho
    Entao a pagina nao deve apresentar violacoes relevantes de acessibilidade

  @autenticado
  Cenario: Validar acessibilidade do checkout
    Dado que existe um usuario de teste ativo
    E ele esta autenticado na loja
    Quando ele adiciona o produto Blue Top ao carrinho
    E ele inicia o checkout autenticado
    Entao a pagina nao deve apresentar violacoes relevantes de acessibilidade
