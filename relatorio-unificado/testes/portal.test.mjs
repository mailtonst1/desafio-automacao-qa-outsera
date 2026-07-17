import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { gerarHtmlPortal, obterRastreabilidade } from '../scripts/portal.mjs';

const resumo = JSON.parse(await readFile(new URL('./fixtures/summary-reprovado.json', import.meta.url), 'utf8'));
const modulos = {
  API: { total: 43, passed: 43, failed: 0 },
  'Web E2E': { total: 11, passed: 7, failed: 4 },
  Mobile: { total: 6, passed: 6, failed: 0 },
  Performance: { total: 2, passed: 2, failed: 0 },
};
const acessibilidade = {
  total: 4,
  cenarios: ['Login', 'Catálogo', 'Carrinho', 'Checkout'],
  regras: [
    { id: 'button-name', impacto: 'critical' },
    { id: 'color-contrast', impacto: 'serious' },
    { id: 'label', impacto: 'critical' },
  ],
};

test('gera portal bloqueado quando o relatorio possui falhas', () => {
  const html = gerarHtmlPortal({
    resumo,
    modulos,
    acessibilidade,
    rastreabilidade: {
      branch: 'feature/quality-gate-acessibilidade-web',
      commit: '0bf8bcc0d22077e96e8917dbf6635a33c0e1f8f1',
      pullRequest: '12',
      urlPullRequest: 'https://github.com/mailtonst1/desafio-automacao-qa-outsera/pull/12',
      urlRepositorio: 'https://github.com/mailtonst1/desafio-automacao-qa-outsera',
      urlWorkflow: 'https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/runs/29589666369',
    },
    data: '17/07/2026, 12:00:00',
  });

  assert.ok(!html.includes('>APROVADO<'));
  assert.match(html, /BLOQUEADO|REPROVADO/);
  assert.ok(html.includes('62 resultados'));
  assert.ok(html.includes('Aprovados<strong>58</strong>'));
  assert.ok(html.includes('Reprovados<strong>4</strong>'));
  assert.match(html, /Web E2E<strong>7\/11<\/strong>/);
  assert.ok(html.includes('60 implementados'));
  assert.ok(html.includes('4 cenários reprovados'));
});

test('usa os metadados da branch de origem em pull requests', () => {
  const rastreabilidade = obterRastreabilidade({
    GITHUB_EVENT_NAME: 'pull_request',
    GITHUB_HEAD_REF: 'feature/quality-gate-acessibilidade-web',
    GITHUB_REF_NAME: '12/merge',
    GITHUB_SHA: 'merge-sha',
    PORTAL_HEAD_SHA: 'head-sha',
    PORTAL_PR_NUMBER: '12',
    GITHUB_RUN_ID: '123',
    GITHUB_REPOSITORY: 'mailtonst1/desafio-automacao-qa-outsera',
    GITHUB_SERVER_URL: 'https://github.com',
  });

  assert.equal(rastreabilidade.pullRequest, '12');
  assert.equal(rastreabilidade.branch, 'feature/quality-gate-acessibilidade-web');
  assert.equal(rastreabilidade.commit, 'head-sha');
  assert.equal(rastreabilidade.urlWorkflow, 'https://github.com/mailtonst1/desafio-automacao-qa-outsera/actions/runs/123');
});
