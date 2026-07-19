import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { criarDadosPortal, gerarHtmlPortal } from '../scripts/portal.mjs';
import { validarPortal } from '../scripts/validar-portal-lib.mjs';

const resumoAcessibilidade = JSON.parse(await readFile(new URL('./fixtures/summary-reprovado.json', import.meta.url), 'utf8'));
const rastreabilidade = {
  branch: 'feature/auditoria-portal',
  commit: 'head-sha-auditado',
  pullRequest: '27',
  urlPullRequest: 'https://github.com/exemplo/projeto/pull/27',
  urlRepositorio: 'https://github.com/exemplo/projeto',
  urlWorkflow: 'https://github.com/exemplo/projeto/actions/runs/456',
};
const semAcessibilidade = { total: 0, cenarios: [], regras: [] };
const acessibilidade = {
  total: 4,
  cenarios: ['Página alfa', 'Página beta', 'Página delta', 'Página gama'],
  regras: [
    { id: 'regra-alfa', impacto: 'critical' },
    { id: 'regra-beta', impacto: 'serious' },
  ],
};
const modulosComFalhasDeAcessibilidade = {
  API: { total: 5, passed: 5, failed: 0 },
  'Web E2E': { total: 7, passed: 3, failed: 4 },
  Mobile: { total: 3, passed: 3, failed: 0 },
  Performance: { total: 2, passed: 2, failed: 0 },
};

const montarPortal = ({ resumo, modulos, acessibilidadeAtual }) => {
  const portal = criarDadosPortal({
    resumo,
    modulos,
    acessibilidade: acessibilidadeAtual,
    rastreabilidade,
    data: '19/07/2026, 12:00:00',
  });
  return { portal, html: gerarHtmlPortal(portal) };
};

const validar = ({ resumo, modulos, acessibilidadeAtual, portal, html, rastreabilidadeEsperada = rastreabilidade }) => validarPortal({
  resumo,
  portal,
  html,
  modulosEsperados: modulos,
  acessibilidadeEsperada: acessibilidadeAtual,
  rastreabilidadeEsperada,
});

test('classifica quatro falhas exclusivas de acessibilidade', () => {
  const { portal, html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });

  assert.equal(portal.status.texto, 'BLOQUEADO POR ACESSIBILIDADE');
  validar({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
    portal,
    html,
  });
});

test('classifica falha de API como bloqueio de qualidade', () => {
  const modulos = {
    API: { total: 2, passed: 1, failed: 1 },
    'Web E2E': { total: 2, passed: 2, failed: 0 },
    Mobile: { total: 1, passed: 1, failed: 0 },
    Performance: { total: 1, passed: 1, failed: 0 },
  };
  const resumo = { stats: { total: 6, passed: 5, failed: 1 }, status: 'failed' };
  const { portal, html } = montarPortal({ resumo, modulos, acessibilidadeAtual: semAcessibilidade });

  assert.equal(portal.status.texto, 'BLOQUEADO POR FALHAS DE QUALIDADE');
  validar({ resumo, modulos, acessibilidadeAtual: semAcessibilidade, portal, html });
});

test('classifica todos os modulos aprovados', () => {
  const modulos = {
    API: { total: 3, passed: 3, failed: 0 },
    'Web E2E': { total: 2, passed: 2, failed: 0 },
    Mobile: { total: 2, passed: 2, failed: 0 },
    Performance: { total: 1, passed: 1, failed: 0 },
  };
  const resumo = { stats: { total: 8, passed: 8, failed: 0 }, status: 'passed' };
  const { portal, html } = montarPortal({ resumo, modulos, acessibilidadeAtual: semAcessibilidade });

  assert.equal(portal.status.texto, 'APROVADO');
  validar({ resumo, modulos, acessibilidadeAtual: semAcessibilidade, portal, html });
});

test('reprova portal adulterado com status aprovado', () => {
  const { portal, html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });
  const adulterado = html.replace('BLOQUEADO POR ACESSIBILIDADE', 'APROVADO');

  assert.throws(() => validar({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
    portal,
    html: adulterado,
  }));
});

test('reprova metricas divergentes do summary', () => {
  const { portal, html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });
  const adulterado = html.replace('data-summary-total="17"', 'data-summary-total="18"');

  assert.throws(() => validar({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
    portal,
    html: adulterado,
  }));
});

test('reprova rastreabilidade divergente', () => {
  const { portal, html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });

  assert.throws(() => validar({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
    portal,
    html,
    rastreabilidadeEsperada: { ...rastreabilidade, branch: 'feature/outra-branch' },
  }));
});
