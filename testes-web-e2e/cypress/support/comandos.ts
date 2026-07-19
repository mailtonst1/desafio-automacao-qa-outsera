import * as allure from "allure-js-commons";
import type { Result } from "axe-core";
import { criarUsuario } from "../factories/FabricaDeUsuarios";
import { criarUsuarioPorApi, removerUsuarioPorApi } from "../services/ServicoDeUsuarios";
import type { UsuarioDeTeste } from "./tipos";

Cypress.Commands.add("criarUsuarioPorApi", () => {
  const usuario = criarUsuario();
  return criarUsuarioPorApi(usuario).then(() => {
    Cypress.env("usuarioAtual", usuario);
    return usuario;
  });
});

Cypress.Commands.add("usuarioAtual", () => cy.wrap(Cypress.env("usuarioAtual") as UsuarioDeTeste));

Cypress.Commands.add("removerUsuarioPorApi", (usuario?: UsuarioDeTeste) => {
  const usuarioParaRemover = usuario ?? (Cypress.env("usuarioAtual") as UsuarioDeTeste | undefined);
  if (!usuarioParaRemover) return cy.then(() => undefined) as Cypress.Chainable<void>;

  return removerUsuarioPorApi(usuarioParaRemover).then(() => {
    Cypress.env("usuarioAtual", undefined);
  });
});

Cypress.Commands.add("validarAcessibilidade", () => {
  cy.injectAxe();
  cy.checkA11y(
    undefined,
    { includedImpacts: ["serious", "critical"] },
    (violacoes: Result[]) => {
      const detalhes = violacoes.map(({ id, impact, help, helpUrl, nodes }) => ({
        id,
        impacto: impact,
        descricao: help,
        referencia: helpUrl,
        elementos: nodes.map(({ target, html, failureSummary }) => ({
          alvo: target,
          html,
          motivo: failureSummary
        }))
      }));

      allure.attachment("Violacoes de acessibilidade", JSON.stringify(detalhes, null, 2), {
        contentType: "application/json"
      });
    }
  );
});
