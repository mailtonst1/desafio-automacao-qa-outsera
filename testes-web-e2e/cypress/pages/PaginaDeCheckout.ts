import type { UsuarioDeTeste } from "../support/tipos";

export class PaginaDeCheckout {
  validarEndereco(usuario: UsuarioDeTeste) {
    cy.get("#address_delivery").should("contain.text", usuario.nome).and("contain.text", usuario.endereco);
  }

  prosseguirParaPagamento() {
    cy.get('a[href="/payment"]').click();
    cy.location("pathname").should("eq", "/payment");
    cy.contains("Payment").should("be.visible");
  }

  preencherPagamento() {
    cy.get('input[name="name_on_card"]').type("Outsera Teste");
    cy.get('input[name="card_number"]').type("4111111111111111");
    cy.get('input[name="cvc"]').type("123");
    cy.get('input[name="expiry_month"]').type("12");
    cy.get('input[name="expiry_year"]').type("2030");
  }

  confirmarPagamento() {
    cy.get("#submit").click();
  }

  validarPedidoConcluido() {
    cy.contains("Order Placed!").should("be.visible");
    cy.contains("Congratulations! Your order has been confirmed!").should("be.visible");
  }

  validarCamposObrigatoriosDePagamento() {
    cy.get('input[name="name_on_card"]').should("have.attr", "required");
    cy.get('input[name="card_number"]').should("have.attr", "required");
    cy.get('input[name="name_on_card"]:invalid').should("have.length", 1);
  }
}
