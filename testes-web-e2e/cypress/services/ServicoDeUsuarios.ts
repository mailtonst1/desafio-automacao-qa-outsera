import type { UsuarioDeTeste } from "../support/tipos";

const urlDaApi = "https://automationexercise.com/api";
const interpretarCorpo = (corpo: unknown): { responseCode?: number } =>
  typeof corpo === "string" ? JSON.parse(corpo) : (corpo as { responseCode?: number });

export const criarUsuarioPorApi = (usuario: UsuarioDeTeste) =>
  cy.request({
    method: "POST",
    url: `${urlDaApi}/createAccount`,
    form: true,
    body: {
      name: usuario.nome,
      email: usuario.email,
      password: usuario.senha,
      title: "Mr",
      birth_date: "1",
      birth_month: "1",
      birth_year: "1990",
      firstname: usuario.nome,
      lastname: usuario.sobrenome,
      company: "Outsera",
      address1: usuario.endereco,
      address2: "",
      country: "India",
      zipcode: usuario.cep,
      state: usuario.estado,
      city: usuario.cidade,
      mobile_number: usuario.telefone
    }
  }).then((resposta) => {
    expect(resposta.status).to.eq(200);
    expect(interpretarCorpo(resposta.body).responseCode).to.eq(201);
    return usuario;
  });

export const removerUsuarioPorApi = (usuario: UsuarioDeTeste): Cypress.Chainable<void> =>
  cy.request({
    method: "DELETE",
    url: `${urlDaApi}/deleteAccount`,
    form: true,
    failOnStatusCode: false,
    body: { email: usuario.email, password: usuario.senha }
  }).then((resposta) => {
    expect(resposta.status).to.eq(200);
    expect([200, 404]).to.include(interpretarCorpo(resposta.body).responseCode);
  }).then(() => undefined) as unknown as Cypress.Chainable<void>;
