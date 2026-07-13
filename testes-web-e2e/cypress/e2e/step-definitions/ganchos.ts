import { After, Before } from "@badeball/cypress-cucumber-preprocessor";
import * as allure from "allure-js-commons";

Before({ tags: "@autenticado" }, () => cy.criarUsuarioPorApi());
After({ tags: "@autenticado" }, () => cy.removerUsuarioPorApi());

After(function (cenario) {
  const nome = cenario.pickle.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  cy.url().then((url) => {
    allure.attachment("URL final", url, { contentType: "text/plain" });
  });
  cy.screenshot(`final-${nome}`, { capture: "viewport" });
});
