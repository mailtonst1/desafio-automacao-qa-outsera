import assert from 'node:assert/strict';
import test from 'node:test';
import { gerarHtmlPortal } from '../scripts/portal.mjs';
import {
  normalizarUrlBase,
  validarConteudoPublicado,
} from '../scripts/validar-publicacao-lib.mjs';

const portal = {
  versao: 2,
  resumo: { status: 'failed', stats: { total: 62, passed: 58, failed: 4 } },
  consolidado: { total: 62, passed: 58, failed: 4 },
  modulos: {
    API: { total: 43, passed: 43, failed: 0 },
    'Web E2E': { total: 11, passed: 7, failed: 4 },
    Mobile: { total: 6, passed: 6, failed: 0 },
    Performance: { total: 2, passed: 2, failed: 0 },
  },
  web: {
    total: 11,
    passed: 7,
    failed: 4,
    funcional: { total: 7, passed: 7, failed: 0 },
    acessibilidade: { total: 4, passed: 0, failed: 4 },
  },
  funcionais: { total: 56, passed: 56, failed: 0 },
  acessibilidade: { total: 4, cenarios: ['Login', 'Catálogo', 'Carrinho', 'Checkout'], regras: [] },
  status: { codigo: 'blocked-accessibility', texto: 'BLOQUEADO POR ACESSIBILIDADE' },
  rastreabilidade: {
    branch: 'feature/portal',
    commit: 'abc123',
    pullRequest: '15',
    urlPullRequest: 'https://github.com/exemplo/projeto/pull/15',
    urlWorkflow: 'https://github.com/exemplo/projeto/actions/runs/123',
    urlRepositorio: 'https://github.com/exemplo/projeto',
  },
  data: '19/07/2026, 12:00:00',
};
const html = gerarHtmlPortal(portal);

test('valida portal público bloqueado e coerente com o artifact', () => {
  assert.doesNotThrow(() => validarConteudoPublicado({ html, portalPublicado: structuredClone(portal), portalEsperado: portal }));
});

test('reprova status aprovado em publicação com falhas', () => {
  assert.throws(() => validarConteudoPublicado({
    html: html.replace('BLOQUEADO POR ACESSIBILIDADE', 'APROVADO'),
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }), /HTML público diverge|não pode exibir APROVADO/);
});

test('reprova portal.json público divergente', () => {
  assert.throws(() => validarConteudoPublicado({
    html,
    portalPublicado: { ...portal, consolidado: { total: 62, passed: 62, failed: 0 } },
    portalEsperado: portal,
  }), /diverge do artifact/);
});

test('reprova HTML público adulterado com métricas funcionais erradas', () => {
  assert.throws(() => validarConteudoPublicado({
    html: html.replace('data-functional-passed="56"', 'data-functional-passed="52"'),
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }), /HTML público diverge|Métricas funcionais/);
});

test('normaliza a URL do GitHub Pages', () => {
  assert.equal(normalizarUrlBase('https://exemplo.github.io/projeto'), 'https://exemplo.github.io/projeto/');
  assert.throws(() => normalizarUrlBase(), /não foi informada/);
});

test('reprova publicação com link vazio', () => {
  assert.throws(() => validarConteudoPublicado({
    html: `${html}<a href="">Link inválido</a>`,
    portalPublicado: structuredClone(portal),
    portalEsperado: portal,
  }), /HTML público diverge|link vazio/);
});
