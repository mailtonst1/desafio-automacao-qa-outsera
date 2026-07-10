export class PaginaDeCarrinho {
  validarProdutoBlueTop() {
    cy.get("#product-1").within(() => {
      cy.contains("Blue Top").should("be.visible");
      cy.contains("Rs. 500").should("be.visible");
      cy.get(".cart_quantity button").should("have.text", "1");
      cy.get(".cart_total").should("contain.text", "Rs. 500");
    });
  }

  iniciarCheckout() {
    cy.contains("Proceed To Checkout").click();
  }

  validarBloqueioSemAutenticacao() {
    cy.contains("Register / Login account to proceed on checkout.").should("be.visible");
  }
}
