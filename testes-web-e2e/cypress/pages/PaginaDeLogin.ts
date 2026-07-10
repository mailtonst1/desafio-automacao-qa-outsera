import type { UsuarioDeTeste } from "../support/tipos";

export class PaginaDeLogin {
  visitar() {
    cy.visit("/login");
    cy.contains("h2", "Login to your account").should("be.visible");
  }

  preencherCredenciais(email: string, senha: string) {
    cy.get('form[action="/login"] input[name="email"]').clear().type(email);
    cy.get('form[action="/login"] input[name="password"]').clear().type(senha, { log: false });
  }

  entrar() {
    cy.get('form[action="/login"] button[type="submit"]').click();
  }

  autenticar(usuario: UsuarioDeTeste) {
    this.visitar();
    this.preencherCredenciais(usuario.email, usuario.senha);
    this.entrar();
  }

  validarAutenticacao(nome: string) {
    cy.contains(`Logged in as ${nome}`).should("be.visible");
  }

  validarErroDeCredenciais() {
    cy.contains("Your email or password is incorrect!").should("be.visible");
  }

  validarCamposObrigatorios() {
    cy.get('form[action="/login"] input[name="email"]').should("have.attr", "required");
    cy.get('form[action="/login"] input[name="password"]').should("have.attr", "required");
    cy.get('form[action="/login"] input:invalid').should("have.length", 2);
  }
}
