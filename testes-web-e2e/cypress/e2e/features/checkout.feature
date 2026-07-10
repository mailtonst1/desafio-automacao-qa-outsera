# language: pt

@regressao
Funcionalidade: Carrinho e checkout
  Como cliente autenticado
  Quero comprar um produto pela interface Web
  Para validar a jornada de compra ponta a ponta

  @smoke @autenticado
  Cenario: Concluir compra com dados de pagamento preenchidos
    Dado que existe um usuario de teste ativo
    E ele esta autenticado na loja
    Quando ele adiciona o produto Blue Top ao carrinho
    Entao o carrinho deve exibir nome preco quantidade e total corretos
    Quando ele inicia o checkout autenticado
    Entao o endereco de entrega do usuario deve ser exibido
    Quando ele preenche e confirma o pagamento
    Entao o pedido deve ser confirmado

  @negativo
  Cenario: Bloquear checkout sem autenticacao
    Dado que o visitante adiciona o produto Blue Top ao carrinho
    Quando ele inicia o checkout sem autenticacao
    Entao deve visualizar o bloqueio real de checkout sem autenticacao

  @negativo @autenticado
  Cenario: Impedir pagamento sem campo obrigatorio
    Dado que existe um usuario de teste ativo
    E ele esta autenticado na loja
    E ele possui o produto Blue Top no checkout
    Quando ele tenta confirmar o pagamento sem preencher os dados
    Entao o formulario de pagamento deve sinalizar os campos obrigatorios
