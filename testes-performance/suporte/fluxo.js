import http from 'k6/http';
import { check } from 'k6';

export function obterBaseUrl() {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const destino = new URL(baseUrl);
  const permitidos = ['localhost', '127.0.0.1', 'serverest'];

  if (!permitidos.includes(destino.hostname)) {
    throw new Error(`BASE_URL nao permitida: ${baseUrl}`);
  }

  return baseUrl.replace(/\/$/, '');
}

export function prepararAutenticacao(baseUrl) {
  const sufixo = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  const email = `performance.${sufixo}@qa.local`;
  const senha = 'teste';
  const usuario = http.post(`${baseUrl}/usuarios`, JSON.stringify({
    nome: `Usuario Performance ${sufixo}`,
    email,
    password: senha,
    administrador: 'false',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(usuario, { 'preparo cria usuario': (resposta) => resposta.status === 201 });

  return { email, senha };
}

export function executarFluxo(baseUrl, credenciais) {
  const login = http.post(`${baseUrl}/login`, JSON.stringify(credenciais), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(login, {
    'login retorna 200': (resposta) => resposta.status === 200,
    'login retorna autorizacao': (resposta) => Boolean(resposta.json('authorization')),
  });

  const produtos = http.get(`${baseUrl}/produtos`);
  const produtosValidos = check(produtos, {
    'produtos retorna 200': (resposta) => resposta.status === 200,
    'produtos retorna itens': (resposta) => Array.isArray(resposta.json('produtos')) && resposta.json('produtos').length > 0,
  });

  if (!produtosValidos) {
    return;
  }

  const identificador = produtos.json('produtos.0._id');
  const produto = http.get(`${baseUrl}/produtos/${identificador}`);
  check(produto, {
    'produto retorna 200': (resposta) => resposta.status === 200,
    'produto possui nome': (resposta) => Boolean(resposta.json('nome')),
  });
}
