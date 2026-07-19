import assert from 'node:assert/strict';
import { criarDadosPortal, gerarHtmlPortal, nomesDosModulos } from './portal.mjs';

const atributosDoModulo = (nome, metricas) => (
  `data-module="${nome}" data-total="${metricas.total}" data-passed="${metricas.passed}" data-failed="${metricas.failed}"`
);

const atributosDaOrigemWeb = (nome, metricas) => (
  `data-web-origin="${nome}" data-total="${metricas.total}" data-passed="${metricas.passed}" data-failed="${metricas.failed}"`
);

const percentual = (metricas) => metricas.total > 0
  ? Math.round((metricas.passed / metricas.total) * 100)
  : 0;

const linksEstaticosObrigatorios = [
  '#visao-geral',
  './allure/',
  './performance/fumaca/',
  './performance/carga/',
  'https://mailtonascimento.com',
];

const validarEstruturaSemantica = (html) => {
  for (const landmark of ['header', 'nav', 'main', 'footer']) {
    assert.match(html, new RegExp(`<${landmark}\\b`, 'i'), `Landmark <${landmark}> ausente no HTML.`);
  }

  assert.match(html, /<nav\b[^>]*aria-label="[^"]+"/i, 'Navegacao principal sem nome acessivel.');
  assert.ok(!/<a\b(?![^>]*\bhref=)[^>]*>/i.test(html), 'HTML contem link sem atributo href.');
  assert.ok(!/href=["']\s*["']/i.test(html), 'HTML contem link vazio.');
  assert.ok(!/<script\b/i.test(html), 'Portal estatico nao deve depender de JavaScript embutido.');

  for (const link of linksEstaticosObrigatorios) {
    assert.ok(html.includes(`href="${link}"`), `Link estrutural obrigatorio ausente: ${link}`);
  }
};

export function validarPortal({
  resumo,
  portal,
  html,
  modulosEsperados,
  webEsperado,
  acessibilidadeEsperada,
  rastreabilidadeEsperada,
}) {
  const esperado = criarDadosPortal({
    resumo,
    modulos: modulosEsperados,
    web: webEsperado,
    acessibilidade: acessibilidadeEsperada,
    rastreabilidade: rastreabilidadeEsperada,
    data: portal.data,
  });

  assert.equal(portal.versao, esperado.versao, 'Versao do contrato do portal divergente.');
  assert.deepEqual(portal.resumo, esperado.resumo, 'Resumo do portal divergente do summary.json.');
  assert.deepEqual(portal.consolidado, esperado.consolidado, 'Consolidado do portal divergente dos resultados Allure.');
  assert.deepEqual(portal.modulos, esperado.modulos, 'Metricas dos modulos divergentes dos resultados Allure.');
  assert.deepEqual(portal.web, esperado.web, 'Metricas Web por origem divergentes dos resultados Allure.');
  assert.deepEqual(portal.funcionais, esperado.funcionais, 'Metricas funcionais divergentes dos resultados Allure.');
  assert.deepEqual(portal.acessibilidade, esperado.acessibilidade, 'Resumo de acessibilidade divergente dos resultados Allure.');
  assert.deepEqual(portal.status, esperado.status, 'Classificacao do portal incorreta.');
  assert.deepEqual(portal.rastreabilidade, esperado.rastreabilidade, 'Rastreabilidade do portal incorreta.');
  assert.ok(html === gerarHtmlPortal(portal), 'HTML publicado diverge do manifesto auditado do portal.');
  validarEstruturaSemantica(html);

  assert.ok(html.includes(`data-status="${esperado.status.codigo}"`), 'Status estruturado ausente no HTML.');
  assert.ok(html.includes(`>${esperado.status.texto}<`), 'Texto de status divergente no HTML.');
  assert.ok(html.includes(`data-summary-total="${esperado.consolidado.total}"`), 'Total consolidado divergente no HTML.');
  assert.ok(html.includes(`data-summary-passed="${esperado.consolidado.passed}"`), 'Total aprovado divergente no HTML.');
  assert.ok(html.includes(`data-summary-failed="${esperado.consolidado.failed}"`), 'Total reprovado divergente no HTML.');

  for (const nome of nomesDosModulos) {
    assert.ok(html.includes(atributosDoModulo(nome, modulosEsperados[nome])), `Metricas de ${nome} divergentes no HTML.`);
  }

  for (const [nome, metricas] of [
    ['funcional', webEsperado.funcional],
    ['acessibilidade', webEsperado.acessibilidade],
  ]) {
    assert.ok(html.includes(atributosDaOrigemWeb(nome, metricas)), `Metricas Web de ${nome} divergentes no HTML.`);
  }

  assert.ok(
    html.includes(`data-functional-total="${esperado.funcionais.total}" data-functional-passed="${esperado.funcionais.passed}" data-functional-failed="${esperado.funcionais.failed}" data-functional-percent="${percentual(esperado.funcionais)}"`),
    'Metricas funcionais ou percentual funcional divergentes no HTML.',
  );
  assert.ok(
    html.includes(`data-functional-status="${esperado.funcionais.failed > 0 ? 'blocked' : 'approved'}"`),
    'Status funcional divergente no HTML.',
  );
  assert.ok(
    html.includes(`data-accessibility-status="${webEsperado.acessibilidade.failed > 0 ? 'blocked' : 'approved'}"`),
    'Status de acessibilidade divergente no HTML.',
  );

  assert.ok(
    html.includes(`data-accessibility-failed="${acessibilidadeEsperada.total}"`),
    'Quantidade de falhas de acessibilidade divergente no HTML.',
  );

  if (resumo.stats.failed > 0 || resumo.status === 'failed') {
    assert.ok(!html.includes('>APROVADO<'), 'Portal reprovado nao pode exibir APROVADO.');
  }

  for (const valor of [
    rastreabilidadeEsperada.branch,
    rastreabilidadeEsperada.commit,
    rastreabilidadeEsperada.urlWorkflow,
    rastreabilidadeEsperada.pullRequest,
    rastreabilidadeEsperada.urlPullRequest,
  ].filter(Boolean)) {
    assert.ok(html.includes(String(valor)), `Rastreabilidade ausente no HTML: ${valor}`);
  }

  assert.ok(
    html.includes(`href="${rastreabilidadeEsperada.urlRepositorio}"`),
    'Link dinamico do repositorio ausente no HTML.',
  );
  assert.ok(
    html.includes(`href="${rastreabilidadeEsperada.urlWorkflow}"`),
    'Link dinamico do GitHub Actions ausente no HTML.',
  );
}

export { linksEstaticosObrigatorios, validarEstruturaSemantica };
