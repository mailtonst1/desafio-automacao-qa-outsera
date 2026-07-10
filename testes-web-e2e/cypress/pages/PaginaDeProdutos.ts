export class PaginaDeProdutos {
  acessar() {
    cy.visit("/products");
    cy.contains("h2", "All Products").should("be.visible");
  }

  adicionarPrimeiroProduto() {
    cy.get('[data-product-id="1"]').first().click();
    cy.contains("Added!").should("be.visible");
    cy.contains("View Cart").click();
  }
}
