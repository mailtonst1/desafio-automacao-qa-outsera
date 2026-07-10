# language: pt

@regressao
Funcionalidade: Autenticacao na loja
  Como visitante da Automation Exercise
  Quero autenticar com uma conta de teste isolada
  Para acessar as funcionalidades protegidas

  @smoke @autenticado
  Cenario: Realizar login valido e navegar como usuario autenticado
    Dado que existe um usuario de teste ativo
    Quando ele realiza login com credenciais validas
    Entao deve visualizar a identificacao do usuario autenticado

  @negativo @autenticado
  Cenario: Recusar senha invalida
    Dado que existe um usuario de teste ativo
    Quando ele tenta login com senha invalida
    Entao deve visualizar a mensagem real de credenciais invalidas

  @negativo
  Cenario: Recusar usuario inexistente
    Dado que o visitante acessa a pagina de login
    Quando ele tenta login com um usuario inexistente
    Entao deve visualizar a mensagem real de credenciais invalidas

  @negativo
  Cenario: Impedir envio de campos obrigatorios vazios
    Dado que o visitante acessa a pagina de login
    Quando ele tenta enviar o login sem preencher os campos
    Entao o formulario de login deve sinalizar os campos obrigatorios
