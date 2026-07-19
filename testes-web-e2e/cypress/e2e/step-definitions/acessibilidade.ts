import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { PaginaDeProdutos } from "../../pages/PaginaDeProdutos";

const paginaDeProdutos = new PaginaDeProdutos();

Given("que o visitante acessa o catalogo de produtos", () => paginaDeProdutos.acessar());

Then("a pagina nao deve apresentar violacoes relevantes de acessibilidade", () => {
  cy.validarAcessibilidade();
});
