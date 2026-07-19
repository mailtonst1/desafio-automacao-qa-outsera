import assert from 'node:assert/strict';
import test from 'node:test';
import {
  criarDadosPortal,
  gerarHtmlPortal,
  resumirWebPorOrigem,
} from '../scripts/portal.mjs';
import { validarPortal } from '../scripts/validar-portal-lib.mjs';

const rastreabilidade = {
  branch: 'feature/auditoria-portal',
  commit: 'head-sha-auditado',
  pullRequest: '27',
  urlPullRequest: 'https://github.com/exemplo/projeto/pull/27',
  urlRepositorio: 'https://github.com/exemplo/projeto',
  urlWorkflow: 'https://github.com/exemplo/projeto/actions/runs/456',
};

const metricas = (total, passed) => ({ total, passed, failed: total - passed });
const criarWeb = ({ funcional = metricas(7, 7), acessibilidade = metricas(4, 0) } = {}) => ({
  ...metricas(funcional.total + acessibilidade.total, funcional.passed + acessibilidade.passed),
  funcional,
  acessibilidade,
});
const criarModulos = ({
  api = metricas(43, 43),
  web = criarWeb(),
  mobile = metricas(6, 6),
  performance = metricas(2, 2),
} = {}) => ({ API: api, 'Web E2E': metricas(web.total, web.passed), Mobile: mobile, Performance: performance });
const criarResumo = (modulos) => {
  const valores = Object.values(modulos);
  const total = valores.reduce((soma, atual) => soma + atual.total, 0);
  const passed = valores.reduce((soma, atual) => soma + atual.passed, 0);
  return { stats: { total, passed, failed: total - passed }, status: total === passed ? 'passed' : 'failed' };
};
const criarAcessibilidade = (web) => ({
  total: web.acessibilidade.failed,
  cenarios: Array.from({ length: web.acessibilidade.failed }, (_, indice) => `Página ${indice + 1}`),
  regras: web.acessibilidade.failed > 0 ? [{ id: 'color-contrast', impacto: 'serious' }] : [],
});

const montarPortal = ({
  web = criarWeb(),
  modulos = criarModulos({ web }),
  resumo = criarResumo(modulos),
  acessibilidade = criarAcessibilidade(web),
} = {}) => {
  const portal = criarDadosPortal({
    resumo,
    modulos,
    web,
    acessibilidade,
    rastreabilidade,
    data: '19/07/2026, 12:00:00',
  });
  return { resumo, modulos, web, acessibilidade, portal, html: gerarHtmlPortal(portal) };
};

const validar = ({ resumo, modulos, web, acessibilidade, portal, html, rastreabilidadeEsperada = rastreabilidade }) => validarPortal({
  resumo,
  portal,
  html,
  modulosEsperados: modulos,
  webEsperado: web,
  acessibilidadeEsperada: acessibilidade,
  rastreabilidadeEsperada,
});

test('cenário A: separa funcional aprovado de acessibilidade bloqueada', () => {
  const resultado = montarPortal();

  assert.deepEqual(resultado.portal.funcionais, metricas(56, 56));
  assert.deepEqual(resultado.portal.web.funcional, metricas(7, 7));
  assert.deepEqual(resultado.portal.web.acessibilidade, metricas(4, 0));
  assert.deepEqual(resultado.portal.consolidado, metricas(62, 58));
  assert.equal(resultado.portal.status.texto, 'BLOQUEADO POR ACESSIBILIDADE');
  assert.ok(resultado.html.includes('data-functional-percent="100"'));
  assert.ok(resultado.html.includes('data-functional-status="approved"'));
  assert.ok(resultado.html.includes('data-accessibility-status="blocked"'));
  assert.ok(resultado.html.includes('data-web-origin="funcional" data-total="7" data-passed="7" data-failed="0"'));
  assert.ok(resultado.html.includes('data-web-origin="acessibilidade" data-total="4" data-passed="0" data-failed="4"'));
  validar(resultado);
});

test('cenário B: falha Web funcional bloqueia qualidade sem falha de acessibilidade', () => {
  const web = criarWeb({ funcional: metricas(7, 6), acessibilidade: metricas(4, 4) });
  const resultado = montarPortal({ web });

  assert.deepEqual(resultado.portal.funcionais, metricas(56, 55));
  assert.equal(resultado.portal.status.texto, 'BLOQUEADO POR FALHAS DE QUALIDADE');
  assert.ok(resultado.html.includes('data-functional-status="blocked"'));
  assert.ok(resultado.html.includes('data-accessibility-status="approved"'));
  validar(resultado);
});

test('cenário C: falhas funcional e de acessibilidade bloqueiam por qualidade', () => {
  const web = criarWeb({ funcional: metricas(7, 6), acessibilidade: metricas(4, 3) });
  const resultado = montarPortal({ web });

  assert.equal(resultado.portal.funcionais.failed, 1);
  assert.equal(resultado.portal.web.acessibilidade.failed, 1);
  assert.equal(resultado.portal.status.texto, 'BLOQUEADO POR FALHAS DE QUALIDADE');
  assert.ok(resultado.html.includes('data-functional-status="blocked"'));
  assert.ok(resultado.html.includes('data-accessibility-status="blocked"'));
  validar(resultado);
});

test('cenário D: todos os resultados aprovados', () => {
  const web = criarWeb({ funcional: metricas(7, 7), acessibilidade: metricas(4, 4) });
  const resultado = montarPortal({ web });

  assert.deepEqual(resultado.portal.funcionais, metricas(56, 56));
  assert.equal(resultado.portal.status.texto, 'APROVADO');
  assert.ok(resultado.html.includes('data-functional-percent="100"'));
  assert.ok(resultado.html.includes('data-accessibility-status="approved"'));
  validar(resultado);
});

test('cenário E: reprova HTML adulterado com métricas funcionais erradas', () => {
  const resultado = montarPortal();
  resultado.html = resultado.html.replace('data-functional-passed="56"', 'data-functional-passed="52"');

  assert.throws(() => validar(resultado), /HTML publicado diverge|Metricas funcionais/);
});

test('cenário F: reprova portal.json com origens Web divergentes dos resultados', () => {
  const resultado = montarPortal();
  resultado.portal = structuredClone(resultado.portal);
  resultado.portal.web.funcional = metricas(7, 6);
  resultado.portal.web.acessibilidade = metricas(4, 1);
  resultado.html = gerarHtmlPortal(resultado.portal);

  assert.throws(() => validar(resultado), /Metricas Web por origem divergentes/);
});

test('cenário G: módulos sem resultados não produzem NaN ou Infinity', () => {
  const web = criarWeb({ funcional: metricas(0, 0), acessibilidade: metricas(0, 0) });
  const modulos = criarModulos({
    api: metricas(0, 0),
    web,
    mobile: metricas(0, 0),
    performance: metricas(0, 0),
  });
  const resultado = montarPortal({ web, modulos });

  assert.ok(resultado.html.includes('aria-valuenow="0"'));
  assert.ok(resultado.html.includes('data-functional-percent="0"'));
  assert.ok(!resultado.html.includes('NaN'));
  assert.ok(!resultado.html.includes('Infinity'));
  assert.match(resultado.html, />Sem resultados</);
  validar(resultado);
});

test('resume Web exclusivamente pelas labels origin preservadas', () => {
  const resultado = resumirWebPorOrigem([
    { status: 'passed', labels: [{ name: 'module', value: 'Web E2E' }, { name: 'origin', value: 'Funcional' }] },
    { status: 'failed', labels: [{ name: 'module', value: 'Web E2E' }, { name: 'origin', value: 'Acessibilidade' }] },
    { status: 'passed', labels: [{ name: 'module', value: 'API' }] },
  ]);

  assert.deepEqual(resultado, criarWeb({ funcional: metricas(1, 1), acessibilidade: metricas(1, 0) }));
  assert.throws(() => resumirWebPorOrigem([
    { status: 'passed', labels: [{ name: 'module', value: 'Web E2E' }] },
  ]), /sem label origin/);
});

test('renderiza landmarks, links técnicos e rastreabilidade do dashboard', () => {
  const { html } = montarPortal();
  for (const landmark of ['header', 'nav', 'main', 'footer']) assert.match(html, new RegExp(`<${landmark}\\b`, 'i'));

  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  for (const link of ['#visao-geral', './allure/', './performance/fumaca/', './performance/carga/', rastreabilidade.urlWorkflow, rastreabilidade.urlRepositorio]) {
    assert.ok(header?.includes(`href="${link}"`), `Link ausente no header: ${link}`);
  }
  assert.ok(html.includes('href="https://mailtonascimento.com"'));
  assert.ok(html.includes('data-full-sha="head-sha-auditado"'));
  assert.ok(!/href=["']\s*["']/i.test(html));
});

test('escapa valores dinâmicos sem criar markup executável', () => {
  const resultado = montarPortal();
  resultado.portal.rastreabilidade = {
    ...rastreabilidade,
    branch: 'feature/<script>alert("branch")</script>',
    commit: 'abc" onmouseover="alert(1)',
    pullRequest: '<img src=x onerror=alert(1)>',
  };
  const html = gerarHtmlPortal(resultado.portal);

  assert.ok(html.includes('feature/&lt;script&gt;alert(&quot;branch&quot;)&lt;/script&gt;'));
  assert.ok(html.includes('abc&quot; onmouseover=&quot;alert(1)'));
  assert.ok(!html.includes('<script>alert("branch")</script>'));
});

test('reprova rastreabilidade divergente', () => {
  const resultado = montarPortal();
  assert.throws(() => validar({
    ...resultado,
    rastreabilidadeEsperada: { ...rastreabilidade, branch: 'feature/outra-branch' },
  }), /Rastreabilidade/);
});
