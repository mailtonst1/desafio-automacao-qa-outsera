import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import { validarUrl } from "../../assertions/AssercoesDeNavegacao";
import { PaginaDeLogin } from "../../pages/PaginaDeLogin";

const paginaDeLogin = new PaginaDeLogin();

Given("que existe um usuario de teste ativo", () => cy.usuarioAtual());
Given("que o visitante acessa a pagina de login", () => paginaDeLogin.visitar());

When("ele realiza login com credenciais validas", () => {
  cy.usuarioAtual().then((usuario) => paginaDeLogin.autenticar(usuario));
});
When("ele tenta login com senha invalida", () => {
  cy.usuarioAtual().then((usuario) => {
    paginaDeLogin.visitar();
    paginaDeLogin.preencherCredenciais(usuario.email, "senha-invalida");
    paginaDeLogin.entrar();
  });
});
When("ele tenta login com um usuario inexistente", () => {
  paginaDeLogin.preencherCredenciais(`inexistente.${Date.now()}@example.test`, "SenhaInvalida123");
  paginaDeLogin.entrar();
});
When("ele tenta enviar o login sem preencher os campos", () => paginaDeLogin.entrar());

Then("deve visualizar a identificacao do usuario autenticado", () => {
  cy.usuarioAtual().then((usuario) => paginaDeLogin.validarAutenticacao(usuario.nome));
  validarUrl("/");
});
Then("deve visualizar a mensagem real de credenciais invalidas", () => paginaDeLogin.validarErroDeCredenciais());
Then("o formulario de login deve sinalizar os campos obrigatorios", () => paginaDeLogin.validarCamposObrigatorios());
