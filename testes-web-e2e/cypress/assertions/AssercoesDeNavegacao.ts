export const validarUrl = (caminho: string) => cy.location("pathname").should("eq", caminho);
