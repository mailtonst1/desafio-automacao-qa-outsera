import { sleep } from 'k6';
import { criarThresholds } from '../configuracao/limites.js';
import { executarFluxo, obterBaseUrl, prepararAutenticacao } from '../suporte/fluxo.js';
import { gerarRelatorios } from '../suporte/relatorio.js';

const baseUrl = obterBaseUrl();

export const options = {
  vus: 5,
  duration: '30s',
  summaryTrendStats: ['med', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: criarThresholds(),
};

export function setup() {
  return prepararAutenticacao(baseUrl);
}

export default function (credenciais) {
  executarFluxo(baseUrl, credenciais);
  sleep(1);
}

export function handleSummary(data) {
  return gerarRelatorios(data);
}
