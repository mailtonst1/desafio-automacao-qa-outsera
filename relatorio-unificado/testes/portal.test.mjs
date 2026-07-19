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
  assert.ok(!html.includes('>APROVADO<'));
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
  const resumo = { stats: { total: 6, passed: 5, failed: 0, broken: 1 }, status: 'failed' };
  const { portal, html } = montarPortal({ resumo, modulos, acessibilidadeAtual: semAcessibilidade });

  assert.equal(portal.status.texto, 'BLOQUEADO POR FALHAS DE QUALIDADE');
  assert.ok(!html.includes('>APROVADO<'));
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
  assert.ok(!html.includes('>BLOQUEADO POR ACESSIBILIDADE<'));
  assert.ok(!html.includes('>BLOQUEADO POR FALHAS DE QUALIDADE<'));
  validar({ resumo, modulos, acessibilidadeAtual: semAcessibilidade, portal, html });
});

test('renderiza landmarks, navegacao e links tecnicos do dashboard', () => {
  const { html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });

  for (const landmark of ['header', 'nav', 'main', 'footer']) {
    assert.match(html, new RegExp(`<${landmark}\\b`, 'i'));
  }

  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  assert.ok(header, 'Header não encontrado para validar a navegação.');
  for (const link of [
    '#visao-geral',
    './allure/',
    './performance/fumaca/',
    './performance/carga/',
    rastreabilidade.urlWorkflow,
    rastreabilidade.urlRepositorio,
  ]) {
    assert.ok(header.includes(`href="${link}"`), `Link ausente no header: ${link}`);
  }

  assert.ok(html.includes('href="https://mailtonascimento.com"'));
  assert.match(html, /<nav\b[^>]*aria-label="Navegação principal"/);
  assert.match(html, /aria-label="Desenvolvido por Mailton Nascimento[^\"]+"/);
  assert.ok(!/href=["']\s*["']/i.test(html));
});

test('preserva metricas e atributos estruturados no novo layout', () => {
  const { html } = montarPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidadeAtual: acessibilidade,
  });

  assert.ok(html.includes('data-summary-total="17"'));
  assert.ok(html.includes('data-summary-passed="13"'));
  assert.ok(html.includes('data-summary-failed="4"'));
  assert.ok(html.includes('data-module="Web E2E" data-total="7" data-passed="3" data-failed="4"'));
  assert.ok(html.includes('data-accessibility-failed="4"'));
  assert.ok(html.includes('data-full-sha="head-sha-auditado"'));
});

test('escapa valores dinamicos sem criar markup executavel', () => {
  const rastreabilidadePerigosa = {
    ...rastreabilidade,
    branch: 'feature/<script>alert("branch")</script>',
    commit: 'abc" onmouseover="alert(1)',
    pullRequest: '<img src=x onerror=alert(1)>',
  };
  const portal = criarDadosPortal({
    resumo: resumoAcessibilidade,
    modulos: modulosComFalhasDeAcessibilidade,
    acessibilidade,
    rastreabilidade: rastreabilidadePerigosa,
    data: '19/07/2026, 12:00:00',
  });
  const html = gerarHtmlPortal(portal);

  assert.ok(html.includes('feature/&lt;script&gt;alert(&quot;branch&quot;)&lt;/script&gt;'));
  assert.ok(html.includes('abc&quot; onmouseover=&quot;alert(1)'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<script>alert("branch")</script>'));
  assert.ok(!html.includes('title="abc" onmouseover="alert(1)"'));
});

test('protege percentuais contra divisao por zero', () => {
  const modulos = Object.fromEntries(Object.keys(modulosComFalhasDeAcessibilidade).map((nome) => [
    nome,
    { total: 0, passed: 0, failed: 0 },
  ]));
  const resumo = { stats: { total: 0, passed: 0, failed: 0 }, status: 'passed' };
  const { html } = montarPortal({ resumo, modulos, acessibilidadeAtual: semAcessibilidade });

  assert.ok(html.includes('aria-valuenow="0"'));
  assert.ok(!html.includes('NaN'));
  assert.ok(!html.includes('Infinity'));
  assert.match(html, />Sem resultados</);
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
