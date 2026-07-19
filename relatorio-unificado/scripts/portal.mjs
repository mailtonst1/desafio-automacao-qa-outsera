import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const nomesDosModulos = ['API', 'Web E2E', 'Mobile', 'Performance'];

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

const somarModulos = (modulos, nomes = nomesDosModulos) => nomes.reduce((total, nome) => ({
  total: total.total + modulos[nome].total,
  passed: total.passed + modulos[nome].passed,
  failed: total.failed + modulos[nome].failed,
}), { total: 0, passed: 0, failed: 0 });

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

  return {
    total: cenarios.length,
    cenarios: cenarios
      .map((cenario) => nomeDaPagina(cenario.name))
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    regras: [...regras]
      .map(([id, impacto]) => ({ id, impacto }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function obterRastreabilidade(ambiente) {
  const pullRequest = ambiente.PORTAL_PR_NUMBER || null;
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
    urlPullRequest: pullRequest ? `${servidor}/${repositorio}/pull/${pullRequest}` : null,
    urlRepositorio: `${servidor}/${repositorio}`,
    urlWorkflow: runId ? `${servidor}/${repositorio}/actions/runs/${runId}` : `${servidor}/${repositorio}/actions`,
  };
}

export function classificarStatus({ resumo, modulos, acessibilidade }) {
  const consolidado = somarModulos(modulos);
  if (
    consolidado.total !== resumo.stats.total
    || consolidado.passed !== resumo.stats.passed
    || consolidado.failed !== resumo.stats.total - resumo.stats.passed
  ) {
    throw new Error('As metricas por modulo divergem do summary.json consolidado.');
  }

  const resumoFalhou = resumo.status === 'failed';
  if (resumoFalhou !== (consolidado.failed > 0)) {
    throw new Error('O status do summary.json diverge da quantidade consolidada de falhas.');
  }

  if (consolidado.failed === 0) {
    return { codigo: 'approved', texto: 'APROVADO' };
  }
  if (consolidado.failed > 0 && acessibilidade.total === consolidado.failed) {
    return { codigo: 'blocked-accessibility', texto: 'BLOQUEADO POR ACESSIBILIDADE' };
  }
  return { codigo: 'blocked-quality', texto: 'BLOQUEADO POR FALHAS DE QUALIDADE' };
}

export function criarDadosPortal({ resumo, modulos, acessibilidade, rastreabilidade, data }) {
  const status = classificarStatus({ resumo, modulos, acessibilidade });
  const consolidado = somarModulos(modulos);
  const funcionais = somarModulos(modulos, ['API', 'Web E2E', 'Mobile']);

  return {
    versao: 1,
    status,
    resumo: { status: resumo.status, stats: resumo.stats },
    consolidado,
    modulos,
    funcionais,
    acessibilidade,
    rastreabilidade,
    data,
  };
}

export function gerarHtmlPortal(portal) {
  const aprovado = portal.status.codigo === 'approved';
  const bloqueadoPorAcessibilidade = portal.status.codigo === 'blocked-accessibility';
  const bloqueadoPorQualidade = portal.status.codigo === 'blocked-quality';
  const api = portal.modulos.API;
  const web = portal.modulos['Web E2E'];
  const mobile = portal.modulos.Mobile;
  const performance = portal.modulos.Performance;
  const acessibilidadeBloqueada = portal.acessibilidade.total > 0;
  const qualidadeFuncionalAprovada = aprovado || bloqueadoPorAcessibilidade;
  const runId = portal.rastreabilidade.urlWorkflow.match(/\/actions\/runs\/([^/?#]+)/)?.[1] || 'Local';
  const shaCompleto = String(portal.rastreabilidade.commit);
  const shaCurto = shaCompleto.length > 12 ? shaCompleto.slice(0, 12) : shaCompleto;
  const classeStatus = aprovado ? 'approved' : 'blocked';
  const icone = (nome, classe = '') => {
    const caminhos = {
      shield: '<path d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      pipeline: '<path d="M6 4v4m0 4v8m12-16v8m0 4v4M3 8h6v4H3V8Zm12 4h6v4h-6v-4Z"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      alert: '<path d="M12 4 3 20h18L12 4Z"/><path d="M12 9v4m0 3h.01"/>',
      chart: '<path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/>',
      api: '<path d="M8 9 4 12l4 3m8-6 4 3-4 3m-2-9-4 12"/>',
      web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z"/>',
      mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4m-3 13.5h2"/>',
      gauge: '<path d="M5.6 18a8 8 0 1 1 12.8 0"/><path d="m12 14 4-4"/><path d="M4 18h16"/>',
      branch: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10m2-6h4a6 6 0 0 0 6-2"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
      report: '<path d="M6 3h9l3 3v15H6V3Z"/><path d="M14 3v4h4M9 12h6m-6 4h6"/>',
      github: '<path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 7 9c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 1.9v2.6c0 .3.2.6.7.5A9.2 9.2 0 0 0 12 2.8Z"/>',
    };
    return `<svg class="icon ${classe}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${caminhos[nome]}</svg>`;
  };
  const explicacaoStatus = bloqueadoPorAcessibilidade
    ? `A qualidade funcional foi aprovada, mas ${portal.acessibilidade.total} cenários possuem violações de acessibilidade serious ou critical.`
    : bloqueadoPorQualidade
      ? `${portal.consolidado.failed} resultados impedem a aprovação do quality gate consolidado.`
      : 'Todos os resultados consolidados atenderam aos critérios definidos pela pipeline de qualidade.';
  const cenarios = portal.acessibilidade.cenarios.map((cenario) => (
    `<li>${icone('web')}<span>${escaparHtml(cenario)}</span></li>`
  )).join('');
  const regras = portal.acessibilidade.regras.map(({ id, impacto }) => {
    const impactoNormalizado = String(impacto || 'não informado').toLowerCase();
    const classeImpacto = ['critical', 'serious', 'moderate', 'minor'].includes(impactoNormalizado)
      ? impactoNormalizado
      : 'neutral';
    return `<article class="rule-card"><div><code>${escaparHtml(id)}</code><p>Regra identificada nos resultados reais da auditoria automatizada.</p></div><span class="impact-badge ${classeImpacto}">${escaparHtml(impactoNormalizado)}</span></article>`;
  }).join('');
  const pullRequest = portal.rastreabilidade.pullRequest
    ? `<div class="trace-item"><dt>Pull Request</dt><dd><a class="trace-link" href="${escaparHtml(portal.rastreabilidade.urlPullRequest)}" target="_blank" rel="noopener noreferrer">#${escaparHtml(portal.rastreabilidade.pullRequest)} ${icone('external')}<span class="sr-only"> (abre em nova aba)</span></a></dd></div>`
    : '';
  const cardModulo = (nome, metricas, nomeIcone, descricao, evidencia) => {
    const percentual = metricas.total > 0 ? Math.round((metricas.passed / metricas.total) * 100) : 0;
    const estado = metricas.total === 0
      ? { codigo: 'empty', texto: 'Sem resultados' }
      : metricas.failed === 0
        ? { codigo: 'approved', texto: 'Aprovado' }
        : metricas.passed === 0
          ? { codigo: 'blocked', texto: 'Bloqueado' }
          : { codigo: 'partial', texto: 'Parcial' };
    return `<article class="module-card ${estado.codigo}" data-module="${nome}" data-total="${metricas.total}" data-passed="${metricas.passed}" data-failed="${metricas.failed}"><div class="card-heading"><span class="icon-box">${icone(nomeIcone)}</span><span class="state-label ${estado.codigo}">${estado.texto}</span></div><h3>${nome}</h3><p class="module-description">${descricao}</p><div class="module-metric"><strong>${metricas.passed} / ${metricas.total}</strong><span>${percentual}% aprovado</span></div><div class="progress" role="progressbar" aria-label="Progresso de ${nome}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentual}"><span style="width:${percentual}%"></span></div><div class="module-footer"><span>${metricas.failed} ${metricas.failed === 1 ? 'resultado reprovado' : 'resultados reprovados'}</span><a href="${evidencia}">Abrir evidência <span aria-hidden="true">→</span></a></div></article>`;
  };
  const statusFuncional = qualidadeFuncionalAprovada ? 'Aprovada' : 'Bloqueada';
  const statusAcessibilidade = acessibilidadeBloqueada ? 'Bloqueada' : 'Aprovada';
  const percentualFuncional = portal.funcionais.total > 0
    ? Math.round((portal.funcionais.passed / portal.funcionais.total) * 100)
    : 0;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#07111f">
  <title>QA Evidence Hub | Outsera</title>
  <style>
    :root {
      --bg: #07111f;
      --bg-deep: #050b14;
      --surface: #0d1a2d;
      --surface-raised: #122139;
      --surface-soft: #162741;
      --border: rgba(174, 194, 224, .16);
      --border-strong: rgba(174, 194, 224, .28);
      --text: #f4f7fb;
      --text-soft: #d6dfec;
      --muted: #aebcd0;
      --accent: #8d9cff;
      --accent-strong: #aeb8ff;
      --success: #56e2a3;
      --danger: #ff8793;
      --warning: #f5c96d;
      --neutral: #b7c3d5;
      --shadow: 0 24px 64px rgba(0, 0, 0, .28);
      --radius-lg: 24px;
      --radius-md: 16px;
      --radius-sm: 11px;
      --container: 1240px;
      color: var(--text);
      background: var(--bg);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-synthesis: none;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-width: 320px;
      overflow-x: hidden;
      background:
        radial-gradient(circle at 12% 0%, rgba(93, 111, 226, .15), transparent 30rem),
        radial-gradient(circle at 88% 18%, rgba(34, 197, 168, .08), transparent 27rem),
        var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    a { color: inherit; }
    a:focus-visible, button:focus-visible, [tabindex]:focus-visible {
      outline: 3px solid var(--accent-strong);
      outline-offset: 4px;
      border-radius: 6px;
    }
    .skip-link {
      position: fixed;
      z-index: 100;
      left: 16px;
      top: 12px;
      transform: translateY(-160%);
      padding: 12px 16px;
      border-radius: 10px;
      background: var(--text);
      color: var(--bg);
      font-weight: 800;
      transition: transform .18s ease;
    }
    .skip-link:focus { transform: translateY(0); }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .shell { width: min(calc(100% - 48px), var(--container)); margin-inline: auto; }
    .site-header {
      position: sticky;
      top: 0;
      z-index: 40;
      border-bottom: 1px solid var(--border);
      background: rgba(5, 11, 20, .9);
      backdrop-filter: blur(18px);
    }
    .header-inner {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      padding-block: 12px;
    }
    .brand { display: flex; align-items: center; gap: 12px; min-width: max-content; }
    .brand-mark, .icon-box {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      flex: 0 0 auto;
      border: 1px solid rgba(141, 156, 255, .35);
      border-radius: 12px;
      background: linear-gradient(145deg, rgba(141, 156, 255, .18), rgba(86, 226, 163, .08));
      color: var(--accent-strong);
    }
    .brand-copy { display: grid; line-height: 1.2; }
    .brand-copy strong { font-size: .98rem; letter-spacing: .01em; }
    .brand-copy span { margin-top: 4px; color: var(--muted); font-size: .72rem; }
    .icon { width: 21px; height: 21px; flex: 0 0 auto; }
    .site-nav { display: flex; align-items: center; justify-content: flex-end; gap: 4px; flex-wrap: wrap; }
    .site-nav a {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 10px 11px;
      border-radius: 10px;
      color: var(--muted);
      font-size: .82rem;
      font-weight: 700;
      text-decoration: none;
      transition: color .18s ease, background .18s ease;
    }
    .site-nav a:hover { background: rgba(141, 156, 255, .1); color: var(--text); }
    .site-nav .icon { width: 14px; height: 14px; }
    main { padding-block: 48px 72px; }
    .hero {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(280px, .65fr);
      gap: 36px;
      padding: clamp(28px, 5vw, 58px);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      background: linear-gradient(145deg, rgba(18, 33, 57, .98), rgba(9, 21, 38, .98));
      box-shadow: var(--shadow);
    }
    .hero::before {
      content: "";
      position: absolute;
      z-index: -1;
      width: 360px;
      height: 360px;
      top: -230px;
      right: -70px;
      border-radius: 50%;
      background: rgba(141, 156, 255, .2);
      filter: blur(4px);
    }
    .hero.blocked { border-color: rgba(255, 135, 147, .3); }
    .eyebrow {
      margin: 0 0 14px;
      color: var(--accent-strong);
      font-size: .72rem;
      font-weight: 850;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 { max-width: 800px; margin-bottom: 16px; font-size: clamp(2rem, 4.2vw, 3.85rem); line-height: 1.05; letter-spacing: -.045em; }
    h2 { margin-bottom: 10px; font-size: clamp(1.45rem, 2vw, 2rem); line-height: 1.2; letter-spacing: -.025em; }
    h3 { line-height: 1.25; }
    .hero-description, .section-heading p, .module-description, .rule-card p, .evidence-card p { color: var(--muted); }
    .hero-description { max-width: 680px; font-size: 1.02rem; }
    .status-block { margin-top: 28px; }
    .status-pill {
      width: fit-content;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      min-height: 42px;
      padding: 9px 14px;
      border: 1px solid rgba(255, 135, 147, .38);
      border-radius: 999px;
      background: rgba(255, 135, 147, .1);
      color: #ffc2c8;
      font-size: .78rem;
      font-weight: 850;
      letter-spacing: .03em;
    }
    .hero.approved .status-pill { border-color: rgba(86, 226, 163, .4); background: rgba(86, 226, 163, .1); color: #8ef0bd; }
    .status-pill .icon { width: 17px; height: 17px; }
    .status-explanation { max-width: 700px; margin: 13px 0 0; color: var(--text-soft); font-size: .91rem; }
    .decision-panel {
      align-self: stretch;
      padding: 22px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: rgba(5, 11, 20, .42);
    }
    .panel-kicker { margin: 0 0 16px; color: var(--muted); font-size: .7rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
    .decision-list { display: grid; gap: 0; margin: 0; }
    .decision-row { display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--border); }
    .decision-row:last-child { border-bottom: 0; }
    .decision-row dt { color: var(--muted); font-size: .82rem; }
    .decision-row dd { margin: 0; font-size: .82rem; font-weight: 800; text-align: right; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .decision-updated { display: flex; gap: 9px; align-items: center; margin: 18px 0 0; color: var(--muted); font-size: .76rem; }
    .decision-updated .icon { width: 16px; height: 16px; }
    .trace-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0 0;
    }
    .trace-item { min-width: 0; padding: 16px 18px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: rgba(13, 26, 45, .72); }
    .trace-item dt { margin-bottom: 7px; color: var(--muted); font-size: .68rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
    .trace-item dd { min-width: 0; margin: 0; font-size: .88rem; font-weight: 750; }
    .trace-value { display: block; overflow: hidden; color: var(--text-soft); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; text-overflow: ellipsis; white-space: nowrap; }
    .trace-link { display: inline-flex; align-items: center; gap: 7px; color: var(--accent-strong); text-decoration: none; }
    .trace-link:hover { text-decoration: underline; }
    .trace-link .icon { width: 15px; height: 15px; }
    .trace-action { display: flex; align-items: center; }
    .button {
      min-height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 11px 16px;
      border: 1px solid transparent;
      border-radius: 11px;
      background: var(--accent);
      color: #07111f;
      font-size: .84rem;
      font-weight: 850;
      text-decoration: none;
      transition: transform .18s ease, filter .18s ease, border-color .18s ease;
    }
    .button:hover { transform: translateY(-2px); filter: brightness(1.08); }
    .button.secondary { border-color: var(--border-strong); background: var(--surface-soft); color: var(--text); }
    .button .icon { width: 17px; height: 17px; }
    .section { margin-top: 56px; scroll-margin-top: 110px; }
    .section-heading { max-width: 720px; margin-bottom: 22px; }
    .section-heading p { margin-bottom: 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .summary-card, .module-card, .functional-card, .accessibility-panel, .evidence-card {
      border: 1px solid var(--border);
      background: linear-gradient(145deg, rgba(18, 33, 57, .9), rgba(10, 22, 39, .94));
      box-shadow: 0 14px 40px rgba(0, 0, 0, .12);
    }
    .summary-card { position: relative; overflow: hidden; min-height: 190px; padding: 24px; border-radius: var(--radius-md); }
    .summary-card::after { content: ""; position: absolute; inset: auto -30px -54px auto; width: 130px; height: 130px; border-radius: 50%; background: currentColor; opacity: .045; }
    .summary-card.approved { border-color: rgba(86, 226, 163, .23); }
    .summary-card.failed { border-color: rgba(255, 135, 147, .34); }
    .summary-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; color: var(--muted); font-size: .82rem; font-weight: 750; }
    .summary-card .icon { color: var(--accent-strong); }
    .summary-card.approved .icon { color: var(--success); }
    .summary-card.failed .icon { color: var(--danger); }
    .summary-card strong { display: block; margin: 20px 0 3px; font-size: clamp(2.35rem, 4vw, 3.5rem); line-height: 1; letter-spacing: -.05em; }
    .summary-card p { margin: 9px 0 0; color: var(--muted); font-size: .86rem; }
    .modules-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .module-card { min-width: 0; padding: 22px; border-radius: var(--radius-md); }
    .module-card.partial, .module-card.blocked { border-color: rgba(255, 135, 147, .3); }
    .card-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .state-label, .impact-badge {
      display: inline-flex;
      align-items: center;
      min-height: 29px;
      padding: 5px 9px;
      border-radius: 999px;
      font-size: .68rem;
      font-weight: 850;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .state-label.approved { background: rgba(86, 226, 163, .1); color: var(--success); }
    .state-label.partial, .state-label.blocked { background: rgba(255, 135, 147, .1); color: var(--danger); }
    .state-label.empty { background: rgba(183, 195, 213, .1); color: var(--neutral); }
    .module-card h3 { margin: 20px 0 7px; font-size: 1.14rem; }
    .module-description { min-height: 63px; margin-bottom: 18px; font-size: .8rem; }
    .module-metric { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .module-metric strong { font-size: 1.55rem; letter-spacing: -.035em; }
    .module-metric span { color: var(--muted); font-size: .75rem; }
    .progress { height: 7px; overflow: hidden; margin: 13px 0 17px; border-radius: 999px; background: rgba(174, 194, 224, .12); }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--success)); }
    .partial .progress span, .blocked .progress span { background: linear-gradient(90deg, var(--warning), var(--danger)); }
    .module-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--muted); font-size: .72rem; }
    .module-footer a { min-height: 44px; display: inline-flex; align-items: center; color: var(--accent-strong); font-weight: 800; text-decoration: none; }
    .module-footer a:hover { text-decoration: underline; }
    .functional-card { display: grid; grid-template-columns: 1.2fr .8fr; gap: 36px; padding: 30px; border-radius: var(--radius-lg); }
    .functional-status { display: inline-flex; align-items: center; gap: 8px; color: ${qualidadeFuncionalAprovada ? 'var(--success)' : 'var(--danger)'}; font-size: .78rem; font-weight: 850; text-transform: uppercase; }
    .functional-card p { color: var(--muted); }
    .functional-numbers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-content: center; }
    .functional-number { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: rgba(5, 11, 20, .25); }
    .functional-number span { display: block; color: var(--muted); font-size: .72rem; }
    .functional-number strong { display: block; margin-top: 5px; font-size: 1.5rem; }
    .functional-progress { margin-top: 22px; }
    .functional-progress > div:first-child { display: flex; justify-content: space-between; gap: 18px; color: var(--muted); font-size: .78rem; }
    .accessibility-panel { overflow: hidden; border-color: rgba(255, 135, 147, .26); border-radius: var(--radius-lg); }
    .accessibility-intro { display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: start; padding: 30px; border-bottom: 1px solid var(--border); }
    .accessibility-count { min-width: 170px; padding: 18px; border: 1px solid rgba(255, 135, 147, .28); border-radius: var(--radius-md); background: rgba(255, 135, 147, .07); text-align: center; }
    .accessibility-count strong { display: block; color: var(--danger); font-size: 2.35rem; line-height: 1; }
    .accessibility-count span { display: block; margin-top: 8px; color: var(--text-soft); font-size: .78rem; }
    .accessibility-body { display: grid; grid-template-columns: .72fr 1.28fr; gap: 34px; padding: 30px; }
    .subheading { margin-bottom: 15px; color: var(--muted); font-size: .7rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
    .page-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .page-list li { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; background: rgba(5, 11, 20, .22); color: var(--text-soft); font-size: .84rem; }
    .page-list .icon { width: 16px; height: 16px; color: var(--accent-strong); }
    .rules-grid { display: grid; gap: 9px; }
    .rule-card { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 15px 16px; border: 1px solid var(--border); border-radius: 11px; background: rgba(5, 11, 20, .22); }
    .rule-card code { color: var(--text); font-size: .84rem; font-weight: 800; }
    .rule-card p { margin: 4px 0 0; font-size: .73rem; }
    .impact-badge.critical { background: rgba(255, 135, 147, .12); color: #ffadb5; }
    .impact-badge.serious { background: rgba(245, 201, 109, .12); color: var(--warning); }
    .impact-badge.moderate, .impact-badge.minor, .impact-badge.neutral { background: rgba(183, 195, 213, .1); color: var(--neutral); }
    .integrity-note { display: flex; align-items: flex-start; gap: 12px; margin: 0 30px 30px; padding: 16px; border: 1px solid rgba(141, 156, 255, .22); border-radius: 12px; background: rgba(141, 156, 255, .07); color: var(--text-soft); font-size: .82rem; }
    .integrity-note .icon { color: var(--accent-strong); }
    .accessibility-actions { display: flex; gap: 12px; padding: 0 30px 30px; }
    .evidence-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
    .evidence-card { min-height: 230px; display: flex; flex-direction: column; padding: 21px; border-radius: var(--radius-md); color: var(--text); text-decoration: none; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
    .evidence-card:hover { transform: translateY(-4px); border-color: rgba(141, 156, 255, .42); background: var(--surface-raised); }
    .evidence-card h3 { margin: 18px 0 8px; font-size: 1rem; }
    .evidence-card p { flex: 1; margin-bottom: 18px; font-size: .78rem; }
    .evidence-action { display: inline-flex; align-items: center; gap: 7px; color: var(--accent-strong); font-size: .78rem; font-weight: 850; }
    .site-footer { border-top: 1px solid var(--border); background: var(--bg-deep); }
    .footer-inner { min-height: 92px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-block: 22px; color: var(--muted); font-size: .76rem; }
    .footer-inner p { margin: 0; }
    .signature { min-height: 44px; display: inline-flex; align-items: center; gap: 6px; color: var(--text-soft); text-decoration: none; }
    .signature:hover { color: var(--accent-strong); }
    .signature .icon { width: 14px; height: 14px; }
    @media (max-width: 1100px) {
      .header-inner { align-items: flex-start; flex-direction: column; gap: 8px; }
      .site-nav { width: 100%; justify-content: flex-start; }
      .hero { grid-template-columns: 1fr; }
      .decision-panel { display: grid; grid-template-columns: 1fr auto; gap: 18px; }
      .decision-panel .panel-kicker, .decision-panel .decision-updated { grid-column: 1 / -1; }
      .trace-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .modules-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .evidence-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 780px) {
      .shell { width: min(calc(100% - 32px), var(--container)); }
      main { padding-block: 30px 54px; }
      .site-header { position: relative; }
      .site-nav { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .site-nav a { justify-content: center; padding-inline: 8px; text-align: center; }
      .hero { padding: 28px; border-radius: 19px; }
      .decision-panel { display: block; }
      .trace-grid, .summary-grid, .functional-card, .accessibility-body { grid-template-columns: 1fr; }
      .functional-numbers { grid-template-columns: repeat(3, 1fr); }
      .accessibility-intro { grid-template-columns: 1fr; }
      .accessibility-count { width: 100%; }
      .evidence-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .evidence-card { min-height: 210px; }
      .footer-inner { align-items: flex-start; flex-direction: column; gap: 10px; }
    }
    @media (max-width: 520px) {
      .shell { width: min(calc(100% - 24px), var(--container)); }
      .header-inner { padding-block: 14px; }
      .brand { min-width: 0; }
      .brand-copy span { font-size: .68rem; }
      .site-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .site-nav a { min-width: 0; font-size: .76rem; }
      .hero { padding: 23px 19px; }
      h1 { font-size: 2.05rem; }
      .status-pill { align-items: flex-start; border-radius: 14px; }
      .trace-grid, .modules-grid, .functional-numbers, .evidence-grid { grid-template-columns: 1fr; }
      .trace-action .button, .accessibility-actions .button { width: 100%; }
      .module-description { min-height: 0; }
      .module-footer, .rule-card { align-items: flex-start; flex-direction: column; }
      .accessibility-intro, .accessibility-body { padding: 22px 18px; }
      .integrity-note { margin: 0 18px 22px; }
      .accessibility-actions { padding: 0 18px 22px; }
      .section { margin-top: 44px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body data-portal-state="${portal.status.codigo}">
  <a class="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
  <header class="site-header">
    <div class="shell header-inner">
      <div class="brand" aria-label="QA Evidence Hub — Desafio de Automação QA Outsera">
        <span class="brand-mark">${icone('shield')}</span>
        <span class="brand-copy"><strong>QA Evidence Hub</strong><span>Desafio de Automação QA Outsera</span></span>
      </div>
      <nav class="site-nav" aria-label="Navegação principal">
        <a href="#visao-geral">Visão geral</a>
        <a href="./allure/">Allure</a>
        <a href="./performance/fumaca/">k6 Fumaça</a>
        <a href="./performance/carga/">k6 Carga</a>
        <a href="${escaparHtml(portal.rastreabilidade.urlWorkflow)}" target="_blank" rel="noopener noreferrer">GitHub Actions ${icone('external')}<span class="sr-only"> (abre em nova aba)</span></a>
        <a href="${escaparHtml(portal.rastreabilidade.urlRepositorio)}" target="_blank" rel="noopener noreferrer">Repositório ${icone('external')}<span class="sr-only"> (abre em nova aba)</span></a>
      </nav>
    </div>
  </header>
  <main id="conteudo-principal" class="shell">
    <section id="visao-geral" class="hero ${classeStatus}" aria-labelledby="titulo-portal">
      <div>
        <p class="eyebrow">Relatório consolidado de qualidade</p>
        <h1 id="titulo-portal">Desafio de Automação QA Outsera</h1>
        <p class="hero-description">Evidências consolidadas de API, Web, acessibilidade, Mobile e Performance.</p>
        <div class="status-block">
          <span class="status-pill">${icone(aprovado ? 'check' : 'alert')}<span data-status="${portal.status.codigo}">${escaparHtml(portal.status.texto)}</span></span>
          <p class="status-explanation">${escaparHtml(explicacaoStatus)}</p>
        </div>
      </div>
      <aside class="decision-panel" aria-label="Decisão do quality gate">
        <p class="panel-kicker">Decisão da execução</p>
        <dl class="decision-list">
          <div class="decision-row"><dt>Qualidade funcional</dt><dd class="${qualidadeFuncionalAprovada ? 'text-success' : 'text-danger'}">${statusFuncional}</dd></div>
          <div class="decision-row"><dt>Acessibilidade</dt><dd class="${acessibilidadeBloqueada ? 'text-danger' : 'text-success'}">${statusAcessibilidade}</dd></div>
          <div class="decision-row"><dt>Decisão final</dt><dd class="${aprovado ? 'text-success' : 'text-danger'}">${aprovado ? 'Aprovado' : 'Bloqueado'}</dd></div>
        </dl>
        <p class="decision-updated">${icone('clock')} Última atualização: ${escaparHtml(portal.data)}</p>
      </aside>
    </section>
    <dl class="trace-grid" aria-label="Rastreabilidade da execução">
      <div class="trace-item"><dt>Branch</dt><dd><code class="trace-value">${escaparHtml(portal.rastreabilidade.branch)}</code></dd></div>
      <div class="trace-item"><dt>Head SHA</dt><dd><code class="trace-value" title="${escaparHtml(shaCompleto)}" aria-label="Head SHA completo: ${escaparHtml(shaCompleto)}" data-full-sha="${escaparHtml(shaCompleto)}">${escaparHtml(shaCurto)}</code></dd></div>
      <div class="trace-item"><dt>Run ID</dt><dd><code class="trace-value">${escaparHtml(runId)}</code></dd></div>
      <div class="trace-item"><dt>Data e horário</dt><dd>${escaparHtml(portal.data)}</dd></div>
      ${pullRequest}
      <div class="trace-item trace-action"><a class="button" href="${escaparHtml(portal.rastreabilidade.urlWorkflow)}" target="_blank" rel="noopener noreferrer">${icone('pipeline')} Abrir execução no GitHub Actions<span class="sr-only"> (abre em nova aba)</span></a></div>
    </dl>
    <section class="section" aria-labelledby="resumo-titulo">
      <div class="section-heading"><p class="eyebrow">Visão executiva</p><h2 id="resumo-titulo">Resumo da qualidade</h2><p>Indicadores consolidados diretamente do relatório unificado desta execução.</p></div>
      <div class="summary-grid" data-summary-total="${portal.consolidado.total}" data-summary-passed="${portal.consolidado.passed}" data-summary-failed="${portal.consolidado.failed}">
        <article class="summary-card"><div class="summary-top"><span>Consolidado</span>${icone('chart')}</div><strong>${portal.consolidado.total}</strong><p>resultados processados</p></article>
        <article class="summary-card approved"><div class="summary-top"><span>Aprovados</span>${icone('check')}</div><strong>${portal.consolidado.passed}</strong><p>resultados aprovados</p></article>
        <article class="summary-card ${portal.consolidado.failed ? 'failed' : 'approved'}"><div class="summary-top"><span>Reprovados</span>${icone(portal.consolidado.failed ? 'alert' : 'check')}</div><strong>${portal.consolidado.failed}</strong><p>resultados bloqueantes</p></article>
      </div>
    </section>
    <section class="section" aria-labelledby="modulos-titulo">
      <div class="section-heading"><p class="eyebrow">Cobertura por camada</p><h2 id="modulos-titulo">Módulos da automação</h2><p>Progresso, resultado e acesso rápido às evidências técnicas de cada frente.</p></div>
      <div class="modules-grid">
        ${cardModulo('API', api, 'api', 'Contratos, autenticação e regras de negócio do ServeRest.', './allure/')}
        ${cardModulo('Web E2E', web, 'web', 'Jornadas funcionais e auditorias de acessibilidade do alvo Web.', './allure/')}
        ${cardModulo('Mobile', mobile, 'mobile', 'Fluxos do aplicativo Android executados em emulador.', './allure/')}
        ${cardModulo('Performance', performance, 'gauge', 'Perfis k6 de fumaça e carga com thresholds verificáveis.', './performance/fumaca/')}
      </div>
    </section>
    <section class="section functional-card" aria-labelledby="funcionais-titulo">
      <div>
        <p class="eyebrow">Quality gate funcional</p>
        <h2 id="funcionais-titulo">Resultados funcionais</h2>
        <p class="functional-status">${icone(qualidadeFuncionalAprovada ? 'check' : 'alert')} ${statusFuncional}</p>
        <p>${bloqueadoPorAcessibilidade ? 'As reprovações consolidadas atuais pertencem aos cenários de acessibilidade; os fluxos funcionais permaneceram aprovados.' : bloqueadoPorQualidade ? 'Há falhas de qualidade fora da classificação exclusiva de acessibilidade e o componente permanece bloqueado.' : 'Todos os fluxos funcionais e critérios consolidados foram aprovados.'}</p>
        <div class="functional-progress"><div><span>Progresso consolidado</span><strong>${percentualFuncional}%</strong></div><div class="progress" role="progressbar" aria-label="Progresso dos resultados funcionais" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentualFuncional}"><span style="width:${percentualFuncional}%"></span></div></div>
      </div>
      <div class="functional-numbers">
        <div class="functional-number"><span>Implementados</span><strong>${portal.funcionais.total}</strong></div>
        <div class="functional-number"><span>Aprovados</span><strong>${portal.funcionais.passed}</strong></div>
        <div class="functional-number"><span>Reprovados</span><strong>${portal.funcionais.failed}</strong></div>
      </div>
    </section>
    <section class="section accessibility-panel" data-accessibility-failed="${portal.acessibilidade.total}" aria-labelledby="acessibilidade-titulo">
      <div class="accessibility-intro">
        <div><p class="eyebrow">Auditoria técnica</p><h2 id="acessibilidade-titulo">Acessibilidade</h2><p>Resultados rastreáveis das verificações automatizadas, organizados por cenário, regra e impacto.</p></div>
        <div class="accessibility-count"><strong>${portal.acessibilidade.total}</strong><span>${portal.acessibilidade.total === 1 ? 'cenário reprovado' : 'cenários reprovados'}</span></div>
      </div>
      <div class="accessibility-body">
        <div><h3 class="subheading">Páginas avaliadas</h3><ul class="page-list">${cenarios || '<li>Nenhum cenário reprovado nesta execução.</li>'}</ul></div>
        <div><h3 class="subheading">${portal.acessibilidade.regras.length} regras distintas encontradas</h3><div class="rules-grid">${regras || '<p class="module-description">Nenhuma regra bloqueante identificada.</p>'}</div></div>
      </div>
      <p class="integrity-note">${icone('shield')}<span>As falhas pertencem ao alvo externo e permanecem visíveis para preservar a integridade do quality gate.</span></p>
      <div class="accessibility-actions"><a class="button" href="./allure/">${icone('report')} Abrir detalhes no Allure</a></div>
    </section>
    <section class="section" aria-labelledby="evidencias-titulo">
      <div class="section-heading"><p class="eyebrow">Diagnóstico completo</p><h2 id="evidencias-titulo">Evidências e relatórios</h2><p>Acesse resultados detalhados, anexos, métricas de performance e rastreabilidade da execução.</p></div>
      <div class="evidence-grid">
        <a class="evidence-card" href="./allure/"><span class="icon-box">${icone('report')}</span><h3>Allure unificado</h3><p>Resultados detalhados, steps, anexos, screenshots e evidências.</p><span class="evidence-action">Abrir relatório <span aria-hidden="true">→</span></span></a>
        <a class="evidence-card" href="./performance/fumaca/"><span class="icon-box">${icone('gauge')}</span><h3>k6 Fumaça</h3><p>Métricas, percentis e thresholds do perfil de fumaça.</p><span class="evidence-action">Abrir dashboard <span aria-hidden="true">→</span></span></a>
        <a class="evidence-card" href="./performance/carga/"><span class="icon-box">${icone('chart')}</span><h3>k6 Carga</h3><p>Comportamento do serviço sob o perfil de 500 usuários virtuais.</p><span class="evidence-action">Abrir dashboard <span aria-hidden="true">→</span></span></a>
        <a class="evidence-card" href="${escaparHtml(portal.rastreabilidade.urlWorkflow)}" target="_blank" rel="noopener noreferrer"><span class="icon-box">${icone('pipeline')}</span><h3>GitHub Actions</h3><p>Jobs, logs, decisões dos gates e artifacts desta execução.</p><span class="evidence-action">Abrir execução ${icone('external')}<span class="sr-only"> (abre em nova aba)</span></span></a>
        <a class="evidence-card" href="${escaparHtml(portal.rastreabilidade.urlRepositorio)}" target="_blank" rel="noopener noreferrer"><span class="icon-box">${icone('github')}</span><h3>Repositório</h3><p>Código-fonte, arquitetura da automação e documentação técnica.</p><span class="evidence-action">Abrir repositório ${icone('external')}<span class="sr-only"> (abre em nova aba)</span></span></a>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="shell footer-inner">
      <p>Relatório gerado automaticamente pela pipeline de qualidade.</p>
      <a class="signature" href="https://mailtonascimento.com" target="_blank" rel="noopener noreferrer" aria-label="Desenvolvido por Mailton Nascimento — abrir portfólio em nova aba">Desenvolvido por <strong>Mailton Nascimento</strong> ${icone('external')}</a>
    </div>
  </footer>
</body>
</html>`;
}
