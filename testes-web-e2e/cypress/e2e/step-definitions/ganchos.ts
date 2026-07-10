import { After, Before } from "@badeball/cypress-cucumber-preprocessor";

Before({ tags: "@autenticado" }, () => cy.criarUsuarioPorApi());
After({ tags: "@autenticado" }, () => cy.removerUsuarioPorApi());
