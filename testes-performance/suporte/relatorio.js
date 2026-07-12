function percentual(metrica, nome) {
  return metrica && metrica.values[nome] !== undefined ? metrica.values[nome] : 'indisponivel';
}

function formatar(valor) {
  return typeof valor === 'number' ? valor.toFixed(2) : valor;
}

export function criarResumo(data) {
  const metricas = data.metrics;
  return [
    `duracao: ${data.state.testRunDurationMs} ms`,
    `http_reqs: ${formatar(percentual(metricas.http_reqs, 'count'))}`,
    `requisicoes_por_segundo: ${formatar(percentual(metricas.http_reqs, 'rate'))}`,
    `http_req_failed: ${formatar(percentual(metricas.http_req_failed, 'rate') * 100)}%`,
    `checks: ${formatar(percentual(metricas.checks, 'rate') * 100)}%`,
    `p50: ${formatar(percentual(metricas.http_req_duration, 'med'))} ms`,
    `p90: ${formatar(percentual(metricas.http_req_duration, 'p(90)'))} ms`,
    `p95: ${formatar(percentual(metricas.http_req_duration, 'p(95)'))} ms`,
    `p99: ${formatar(percentual(metricas.http_req_duration, 'p(99)'))} ms`,
  ].join('\n');
}

export function criarHtml(data) {
  const resumo = criarResumo(data).split('\n').map((linha) => `<li>${linha}</li>`).join('');
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Resumo k6</title><style>body{font-family:Arial,sans-serif;margin:2rem;color:#172033}li{margin:.5rem 0}</style><h1>Resumo de performance k6</h1><ul>${resumo}</ul></html>`;
}

export function gerarRelatorios(data) {
  const diretorio = __ENV.DIRETORIO_RELATORIOS || 'relatorios';
  return {
    [`${diretorio}/summary.json`]: JSON.stringify(data, null, 2),
    [`${diretorio}/summary.txt`]: criarResumo(data),
    [`${diretorio}/summary.html`]: criarHtml(data),
  };
}
