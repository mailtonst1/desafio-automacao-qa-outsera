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
