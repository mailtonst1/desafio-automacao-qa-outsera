import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const nomesDosModulos = ['API', 'Web E2E', 'Mobile', 'Performance'];

const escaparHtml = (valor) => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const rotulo = (resultado, nome) => resultado.labels?.find((item) => item.name === nome)?.value;

const anexosDoResultado = (resultado) => {
  const anexos = [...(resultado.attachments || [])];
  const visitar = (etapas) => {
    for (const etapa of etapas || []) {
      anexos.push(...(etapa.attachments || []));
      visitar(etapa.steps);
    }
  };
  visitar(resultado.steps);
  return anexos;
};

export async function carregarResultados(diretorio) {
  const arquivos = (await readdir(diretorio)).filter((arquivo) => arquivo.endsWith('-result.json'));
  return Promise.all(arquivos.map(async (arquivo) => JSON.parse(await readFile(join(diretorio, arquivo), 'utf8'))));
}

export function resumirModulos(resultados) {
  const modulos = Object.fromEntries(nomesDosModulos.map((nome) => [nome, { total: 0, passed: 0, failed: 0 }]));

  for (const resultado of resultados) {
    const modulo = rotulo(resultado, 'module');
    if (!modulos[modulo]) continue;
    modulos[modulo].total += 1;
    if (resultado.status === 'passed') modulos[modulo].passed += 1;
    else modulos[modulo].failed += 1;
  }

  return modulos;
}

const nomeDaPagina = (nome) => {
  if (nome.includes('login')) return 'Login';
  if (nome.includes('catalogo')) return 'Catálogo';
  if (nome.includes('carrinho')) return 'Carrinho';
  if (nome.includes('checkout')) return 'Checkout';
  return nome;
};

export async function resumirAcessibilidade(resultados, diretorio) {
  const cenarios = resultados.filter((resultado) => (
    rotulo(resultado, 'package')?.endsWith('acessibilidade.feature') && resultado.status === 'failed'
  ));
  const regras = new Map();

  for (const resultado of cenarios) {
    const anexos = anexosDoResultado(resultado).filter((anexo) => (
      anexo.name === 'Violacoes de acessibilidade' && anexo.type === 'application/json'
    ));
    for (const anexo of anexos) {
      const violacoes = JSON.parse(await readFile(join(diretorio, anexo.source), 'utf8'));
      for (const violacao of violacoes) regras.set(violacao.id, violacao.impacto);
    }
  }

  const ordemDosCenarios = ['Login', 'Catálogo', 'Carrinho', 'Checkout'];
  const ordemDasRegras = ['button-name', 'color-contrast', 'label'];

  return {
    total: cenarios.length,
    cenarios: cenarios
      .map((cenario) => nomeDaPagina(cenario.name))
      .sort((a, b) => ordemDosCenarios.indexOf(a) - ordemDosCenarios.indexOf(b)),
    regras: [...regras]
      .map(([id, impacto]) => ({ id, impacto }))
      .sort((a, b) => ordemDasRegras.indexOf(a.id) - ordemDasRegras.indexOf(b.id)),
  };
}

export function obterRastreabilidade(ambiente) {
  const pullRequest = ambiente.PORTAL_PR_NUMBER;
  const emPullRequest = ambiente.GITHUB_EVENT_NAME === 'pull_request' || Boolean(pullRequest);
  const branch = emPullRequest
    ? ambiente.GITHUB_HEAD_REF || ambiente.PORTAL_HEAD_REF || ambiente.GITHUB_REF_NAME
    : ambiente.GITHUB_REF_NAME;
  const commit = emPullRequest
    ? ambiente.PORTAL_HEAD_SHA || ambiente.GITHUB_SHA
    : ambiente.GITHUB_SHA;
  const repositorio = ambiente.GITHUB_REPOSITORY || 'mailtonst1/desafio-automacao-qa-outsera';
  const servidor = ambiente.GITHUB_SERVER_URL || 'https://github.com';
  const runId = ambiente.GITHUB_RUN_ID;

  return {
    branch: branch || 'local',
    commit: commit || 'execucao local',
    pullRequest,
    urlPullRequest: pullRequest ? `${servidor}/${repositorio}/pull/${pullRequest}` : undefined,
    urlRepositorio: `${servidor}/${repositorio}`,
    urlWorkflow: runId ? `${servidor}/${repositorio}/actions/runs/${runId}` : `${servidor}/${repositorio}/actions`,
  };
}

export function gerarHtmlPortal({ resumo, modulos, acessibilidade, rastreabilidade, data }) {
  const bloqueado = resumo.status === 'failed' || resumo.stats.failed > 0;
  const status = bloqueado ? 'BLOQUEADO POR ACESSIBILIDADE' : 'APROVADO';
  const api = modulos.API;
  const web = modulos['Web E2E'];
  const mobile = modulos.Mobile;
  const performance = modulos.Performance;
  const funcionais = {
    total: api.total + web.total + mobile.total,
    passed: api.passed + web.passed + mobile.passed,
    failed: api.failed + web.failed + mobile.failed,
  };
  const consolidado = nomesDosModulos.reduce((total, nome) => ({
    total: total.total + modulos[nome].total,
    passed: total.passed + modulos[nome].passed,
    failed: total.failed + modulos[nome].failed,
  }), { total: 0, passed: 0, failed: 0 });

  if (
    consolidado.total !== resumo.stats.total
    || consolidado.passed !== resumo.stats.passed
    || consolidado.failed !== resumo.stats.failed
  ) {
    throw new Error('As metricas por modulo divergem do summary.json consolidado.');
  }
  const cenarios = acessibilidade.cenarios.map((cenario) => `<li>${escaparHtml(cenario)}</li>`).join('');
  const regras = acessibilidade.regras.map(({ id, impacto }) => (
    `<li><code>${escaparHtml(id)}</code> — <strong>${escaparHtml(impacto)}</strong></li>`
  )).join('');
  const pullRequest = rastreabilidade.pullRequest
    ? `<span>Pull request: <a href="${escaparHtml(rastreabilidade.urlPullRequest)}">#${escaparHtml(rastreabilidade.pullRequest)}</a></span>`
    : '';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outsera | Evidencias</title><style>:root{color:#172033;background:#f5f7fa;font-family:Arial,sans-serif}body{margin:0}.wrap{max-width:1080px;margin:auto;padding:44px 24px}.hero{background:#102a43;color:white;padding:40px;border-radius:8px}.hero.bloqueado{background:#7f1d1d}.hero p{max-width:760px;line-height:1.5}.status{color:#a7f3d0;font-weight:bold}.bloqueado .status{color:#fecaca}.meta{display:flex;gap:18px;flex-wrap:wrap;font-size:.9rem}.meta a{color:#fff}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:28px 0}.card,.panel{background:white;border:1px solid #d9e2ec;border-radius:8px;padding:20px}.card.reprovado{border-color:#b91c1c;background:#fef2f2}.card strong{font-size:1.8rem;display:block;margin-top:8px}.resumo{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.actions{display:flex;flex-wrap:wrap;gap:12px}.button{background:#0057b8;color:#fff;text-decoration:none;border-radius:6px;padding:12px 16px;font-weight:bold}.button.alt{background:#fff;color:#0057b8;border:1px solid #0057b8}h2{margin-top:34px}li{margin:.5rem 0}@media(max-width:700px){.wrap{padding:20px}.hero{padding:28px}.grid,.resumo{grid-template-columns:repeat(2,1fr)}.actions{display:grid}.button{text-align:center}}</style></head><body><main class="wrap"><section class="hero ${bloqueado ? 'bloqueado' : ''}"><p class="status" data-status="${bloqueado ? 'failed' : 'passed'}">${status}</p><h1>Desafio de Automacao QA Outsera</h1><p>Portal publico de evidencias da pipeline, gerado a partir do status consolidado do Allure e dos resultados reais de cada modulo.</p><div class="meta">${pullRequest}<span>Branch: <code>${escaparHtml(rastreabilidade.branch)}</code></span><span>Head SHA: <code>${escaparHtml(rastreabilidade.commit)}</code></span><span>Execucao: ${escaparHtml(data)}</span><span><a href="${escaparHtml(rastreabilidade.urlWorkflow)}">Abrir execucao</a></span></div></section><section class="resumo"><article class="card">Consolidado<strong>${resumo.stats.total} resultados</strong></article><article class="card">Aprovados<strong>${resumo.stats.passed}</strong></article><article class="card ${bloqueado ? 'reprovado' : ''}">Reprovados<strong>${resumo.stats.failed}</strong></article></section><section class="grid"><article class="card">API<strong>${api.passed}/${api.total}</strong>aprovados</article><article class="card ${web.failed ? 'reprovado' : ''}">Web E2E<strong>${web.passed}/${web.total}</strong>aprovados e ${web.failed} reprovados</article><article class="card">Mobile<strong>${mobile.passed}/${mobile.total}</strong>aprovados</article><article class="card">Performance<strong>${performance.passed}/${performance.total}</strong>perfis aprovados</article></section><section class="panel"><h2>Resultados funcionais</h2><p><strong>${funcionais.total} implementados</strong>, ${funcionais.passed} aprovados e ${funcionais.failed} reprovados.</p></section><section class="panel"><h2>Acessibilidade</h2><p><strong>${acessibilidade.total} cenários reprovados</strong> com múltiplas violações de impacto bloqueante.</p><h3>Páginas avaliadas</h3><ul>${cenarios}</ul><h3>${acessibilidade.regras.length} regras distintas encontradas</h3><ul>${regras}</ul><div class="actions"><a class="button" href="allure/index.html">Abrir Allure unificado</a></div></section><section class="panel"><h2>Evidencias de performance</h2><p>Os dashboards k6 apresentam series temporais, percentis e thresholds dos dois perfis aprovados.</p><div class="actions"><a class="button alt" href="performance/fumaca/index.html">k6: fumaca</a><a class="button alt" href="performance/carga/index.html">k6: carga 500 VUs</a><a class="button alt" href="${escaparHtml(rastreabilidade.urlRepositorio)}">Repositorio</a><a class="button alt" href="${escaparHtml(rastreabilidade.urlWorkflow)}">GitHub Actions</a></div></section></main></body></html>`;
}
