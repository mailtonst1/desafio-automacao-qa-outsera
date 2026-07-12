export function lerNumero(nome, padrao) {
  const valor = __ENV[nome];
  return valor ? Number(valor) : padrao;
}

export const limites = {
  falhasHttp: lerNumero('LIMITE_FALHAS_HTTP', 0.01),
  checks: lerNumero('LIMITE_CHECKS', 0.99),
  p95: lerNumero('LIMITE_P95_MS', 1000),
};

export function criarThresholds() {
  return {
    http_req_failed: [`rate<${limites.falhasHttp}`],
    checks: [`rate>${limites.checks}`],
    http_req_duration: [`p(95)<${limites.p95}`],
  };
}
