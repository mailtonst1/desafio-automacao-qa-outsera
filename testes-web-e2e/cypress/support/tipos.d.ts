export type UsuarioDeTeste = {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
};

declare global {
  namespace Cypress {
    interface Chainable {
      criarUsuarioPorApi(): Chainable<UsuarioDeTeste>;
      removerUsuarioPorApi(usuario?: UsuarioDeTeste): Chainable<void>;
      usuarioAtual(): Chainable<UsuarioDeTeste>;
    }
  }
}

export {};
