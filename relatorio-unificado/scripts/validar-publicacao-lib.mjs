import assert from 'node:assert/strict';

const linksObrigatorios = [
  './allure/',
  './performance/fumaca/',
  './performance/carga/',
];

export function validarConteudoPublicado({ html, portalPublicado, portalEsperado }) {
  assert.deepEqual(portalPublicado, portalEsperado, 'portal.json público diverge do artifact publicado.');
  assert.ok(html.includes(portalEsperado.status.texto), 'Status esperado ausente na página principal.');
  assert.ok(html.includes(portalEsperado.rastreabilidade.commit), 'Head SHA ausente na página principal.');
  assert.ok(html.includes(portalEsperado.rastreabilidade.urlWorkflow), 'Link da execução ausente na página principal.');

  if (portalEsperado.consolidado.failed > 0 || portalEsperado.resumo.status === 'failed') {
    assert.ok(!html.includes('>APROVADO<'), 'Portal com falhas não pode exibir APROVADO.');
  }

  for (const link of linksObrigatorios) {
    assert.ok(html.includes(`href="${link}"`), `Link público obrigatório ausente: ${link}`);
  }

  assert.ok(
    html.includes(`href="${portalEsperado.rastreabilidade.urlRepositorio}"`),
    'Link público do repositório ausente.',
  );
  assert.ok(html.includes('href="https://mailtonascimento.com"'), 'Assinatura profissional ausente.');
  assert.ok(!/href=["']\s*["']/i.test(html), 'Página pública contém link vazio.');
}

export function normalizarUrlBase(url) {
  assert.ok(url, 'URL do GitHub Pages não foi informada.');
  return url.endsWith('/') ? url : `${url}/`;
}

export { linksObrigatorios };
