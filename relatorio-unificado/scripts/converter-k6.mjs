import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const argumentos = process.argv.slice(2);
const valor = (nome) => argumentos[argumentos.indexOf(nome) + 1];
const origem = valor('--origem');
const destino = valor('--destino');
const perfil = valor('--perfil') || 'Fumaca';

if (!origem || !destino) throw new Error('Use --origem <pasta> --destino <pasta>.');

const pastaOrigem = resolve(origem);
const pastaDestino = resolve(destino);
const resumo = JSON.parse(await readFile(join(pastaOrigem, 'summary.json'), 'utf8'));
const metricas = resumo.metrics;
const valorMetrica = (nome, valor) => metricas[nome]?.values?.[valor] ?? 'indisponivel';
const thresholds = Object.values(metricas)
  .flatMap((metrica) => Object.values(metrica.thresholds || {}))
  .every((threshold) => threshold.ok === true);
const inicio = (await stat(join(pastaOrigem, 'summary.json'))).mtimeMs - resumo.state.testRunDurationMs;
const anexos = [];

await mkdir(pastaDestino, { recursive: true });
for (const arquivo of ['summary.json', 'summary.txt', 'summary.html']) {
  const nome = `${perfil.toLowerCase().replaceAll(' ', '-')}-${arquivo}`;
  await cp(join(pastaOrigem, arquivo), join(pastaDestino, nome));
  anexos.push({ name: arquivo, source: nome, type: arquivo.endsWith('.html') ? 'text/html' : arquivo.endsWith('.json') ? 'application/json' : 'text/plain' });
}

const linhas = [
  ['Duracao', `${resumo.state.testRunDurationMs.toFixed(2)} ms`],
  ['VUs maximos', valorMetrica('vus_max', 'max')],
  ['Requisicoes', valorMetrica('http_reqs', 'count')],
  ['Requisicoes por segundo', valorMetrica('http_reqs', 'rate')],
  ['Erros', valorMetrica('http_req_failed', 'rate')],
  ['Checks', valorMetrica('checks', 'rate')],
  ['p90', `${valorMetrica('http_req_duration', 'p(90)')} ms`],
  ['p95', `${valorMetrica('http_req_duration', 'p(95)')} ms`],
  ['p99', `${valorMetrica('http_req_duration', 'p(99)')} ms`],
];

const resultado = {
  uuid: crypto.randomUUID(),
  name: `Performance - ${perfil}`,
  fullName: `Performance.${perfil}`,
  status: thresholds ? 'passed' : 'failed',
  stage: 'finished',
  start: Math.round(inicio),
  stop: Math.round(inicio + resumo.state.testRunDurationMs),
  labels: [
    { name: 'parentSuite', value: 'Performance' },
    { name: 'suite', value: perfil },
    { name: 'module', value: 'Performance' },
  ],
  steps: linhas.map(([nome, valor]) => ({ name: `${nome}: ${valor}`, status: 'passed', stage: 'finished', start: Math.round(inicio), stop: Math.round(inicio) })),
  attachments: anexos,
};

await writeFile(join(pastaDestino, `${basename(perfil)}-result.json`), JSON.stringify(resultado), 'utf8');
