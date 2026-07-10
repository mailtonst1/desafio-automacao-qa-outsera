import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import { PaginaDeCarrinho } from "../../pages/PaginaDeCarrinho";
import { PaginaDeCheckout } from "../../pages/PaginaDeCheckout";
import { PaginaDeLogin } from "../../pages/PaginaDeLogin";
import { PaginaDeProdutos } from "../../pages/PaginaDeProdutos";

const paginaDeLogin = new PaginaDeLogin();
const paginaDeProdutos = new PaginaDeProdutos();
const paginaDeCarrinho = new PaginaDeCarrinho();
const paginaDeCheckout = new PaginaDeCheckout();

Given("ele esta autenticado na loja", () => {
  cy.usuarioAtual().then((usuario) => paginaDeLogin.autenticar(usuario));
  cy.usuarioAtual().then((usuario) => paginaDeLogin.validarAutenticacao(usuario.nome));
});
Given("que o visitante adiciona o produto Blue Top ao carrinho", () => {
  paginaDeProdutos.acessar();
  paginaDeProdutos.adicionarPrimeiroProduto();
});
Given("ele possui o produto Blue Top no checkout", () => {
  paginaDeProdutos.acessar();
  paginaDeProdutos.adicionarPrimeiroProduto();
  paginaDeCarrinho.iniciarCheckout();
  paginaDeCheckout.prosseguirParaPagamento();
});

When("ele adiciona o produto Blue Top ao carrinho", () => {
  paginaDeProdutos.acessar();
  paginaDeProdutos.adicionarPrimeiroProduto();
});
When("ele inicia o checkout autenticado", () => paginaDeCarrinho.iniciarCheckout());
When("ele inicia o checkout sem autenticacao", () => paginaDeCarrinho.iniciarCheckout());
When("ele preenche e confirma o pagamento", () => {
  paginaDeCheckout.prosseguirParaPagamento();
  paginaDeCheckout.preencherPagamento();
  paginaDeCheckout.confirmarPagamento();
});
When("ele tenta confirmar o pagamento sem preencher os dados", () => paginaDeCheckout.confirmarPagamento());

Then("o carrinho deve exibir nome preco quantidade e total corretos", () => paginaDeCarrinho.validarProdutoBlueTop());
Then("o endereco de entrega do usuario deve ser exibido", () => {
  cy.usuarioAtual().then((usuario) => paginaDeCheckout.validarEndereco(usuario));
});
Then("o pedido deve ser confirmado", () => paginaDeCheckout.validarPedidoConcluido());
Then("deve visualizar o bloqueio real de checkout sem autenticacao", () => paginaDeCarrinho.validarBloqueioSemAutenticacao());
Then("o formulario de pagamento deve sinalizar os campos obrigatorios", () => paginaDeCheckout.validarCamposObrigatoriosDePagamento());
