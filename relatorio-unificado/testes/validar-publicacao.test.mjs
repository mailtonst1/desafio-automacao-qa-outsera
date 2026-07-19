import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizarUrlBase,
  validarConteudoPublicado,
} from '../scripts/validar-publicacao-lib.mjs';

const portal = {
  resumo: { status: 'failed' },
  consolidado: { total: 62, passed: 58, failed: 4 },
  status: { codigo: 'blocked-accessibility', texto: 'BLOQUEADO POR ACESSIBILIDADE' },
  rastreabilidade: {
    commit: 'abc123',
    urlWorkflow: 'https://github.com/exemplo/projeto/actions/runs/123',
    urlRepositorio: 'https://github.com/exemplo/projeto',
  },
};

const html = `
  <p>BLOQUEADO POR ACESSIBILIDADE</p>
  <code>abc123</code>
  <a href="https://github.com/exemplo/projeto/actions/runs/123">Execução</a>
  <a href="./allure/">Allure</a>
  <a href="./performance/fumaca/">Fumaça</a>
  <a href="./performance/carga/">Carga</a>
  <a href="https://github.com/exemplo/projeto">Repositório</a>
  <a href="https://mailtonascimento.com">Mailton Nascimento</a>
`;

test('valida portal público bloqueado e coerente com o artifact', () => {
  assert.doesNotThrow(() => validarConteudoPublicado({
    html,
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }));
});

test('reprova status aprovado em publicação com falhas', () => {
  assert.throws(() => validarConteudoPublicado({
    html: `${html}<strong>APROVADO</strong>`,
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }), /não pode exibir APROVADO/);
});

test('reprova portal.json público divergente', () => {
  assert.throws(() => validarConteudoPublicado({
    html,
    portalPublicado: { ...portal, consolidado: { total: 62, passed: 62, failed: 0 } },
    portalEsperado: portal,
  }), /diverge do artifact/);
});

test('normaliza a URL do GitHub Pages', () => {
  assert.equal(normalizarUrlBase('https://exemplo.github.io/projeto'), 'https://exemplo.github.io/projeto/');
  assert.throws(() => normalizarUrlBase(), /não foi informada/);
});

test('reprova publicacao com link vazio', () => {
  assert.throws(() => validarConteudoPublicado({
    html: `${html}<a href="">Link inválido</a>`,
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }), /link vazio/);
});
