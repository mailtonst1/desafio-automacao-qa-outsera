import type { UsuarioDeTeste } from "../support/tipos";

export const criarUsuario = (): UsuarioDeTeste => {
  const identificador = `${Date.now()}${Cypress._.random(1000, 9999)}`;

  return {
    nome: "Outsera",
    sobrenome: "Teste",
    email: `outsera.web.${identificador}@example.test`,
    senha: "SenhaSegura123",
    endereco: "Rua dos Testes, 100",
    cidade: "Sao Paulo",
    estado: "SP",
    cep: "01001000",
    telefone: "11999999999"
  };
};
