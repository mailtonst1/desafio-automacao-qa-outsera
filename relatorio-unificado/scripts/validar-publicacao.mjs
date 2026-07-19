import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  linksObrigatorios,
  normalizarUrlBase,
  validarConteudoPublicado,
} from './validar-publicacao-lib.mjs';

const argumentos = process.argv.slice(2);
const valor = (nome) => {
  const indice = argumentos.indexOf(nome);
  return indice >= 0 ? argumentos[indice + 1] : undefined;
};

const urlBase = normalizarUrlBase(valor('--url'));
const caminhoPortal = resolve(valor('--portal') || 'saida/portal.json');
const portalEsperado = JSON.parse(await readFile(caminhoPortal, 'utf8'));
const tentativas = 12;
const intervaloMs = 10_000;

async function baixar(caminho) {
  const resposta = await fetch(new URL(caminho, urlBase), {
    headers: { 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(resposta.status, 200, `${caminho || 'página principal'} respondeu HTTP ${resposta.status}.`);
  return resposta.text();
}

let ultimoErro;
for (let tentativa = 1; tentativa <= tentativas; tentativa += 1) {
  try {
    const [html, portalTexto] = await Promise.all([
      baixar(''),
      baixar('portal.json'),
      ...linksObrigatorios.map((caminho) => baixar(caminho)),
    ]);
    const portalPublicado = JSON.parse(portalTexto);
    validarConteudoPublicado({ html, portalPublicado, portalEsperado });
    console.log(`Portal publicado validado em ${urlBase} com status ${portalPublicado.status.texto}.`);
    ultimoErro = undefined;
    break;
  } catch (erro) {
    ultimoErro = erro;
    if (tentativa < tentativas) {
      console.log(`Publicação ainda não convergiu (${tentativa}/${tentativas}): ${erro.message}`);
      await new Promise((resolvePromise) => setTimeout(resolvePromise, intervaloMs));
    }
  }
}

if (ultimoErro) throw ultimoErro;
