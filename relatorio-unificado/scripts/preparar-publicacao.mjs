import { cp, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import {
  carregarResultados,
  gerarHtmlPortal,
  obterRastreabilidade,
  resumirAcessibilidade,
  resumirModulos,
} from './portal.mjs';

const argumentos = process.argv.slice(2);
const valor = (nome) => {
  const indice = argumentos.indexOf(nome);
  return indice >= 0 ? argumentos[indice + 1] : undefined;
};

const saida = resolve('saida');
const allure = join(saida, 'allure');
const performance = join(saida, 'performance');
const resultados = resolve(valor('--resultados') || 'temporario');
const fumaca = valor('--fumaca');
const carga = valor('--carga');

if (!fumaca || !carga) {
  throw new Error('Informe --fumaca e --carga para preparar a publicacao.');
}

const resumo = JSON.parse(await readFile(join(saida, 'summary.json'), 'utf8'));
const resultadosAllure = await carregarResultados(resultados);
const modulos = resumirModulos(resultadosAllure);
const acessibilidade = await resumirAcessibilidade(resultadosAllure, resultados);
const rastreabilidade = obterRastreabilidade(process.env);

await mkdir(allure, { recursive: true });
await mkdir(performance, { recursive: true });
await rename(join(saida, 'index.html'), join(allure, 'index.html'));

for (const [origem, destino] of [[fumaca, 'fumaca'], [carga, 'carga']]) {
  await mkdir(join(performance, destino), { recursive: true });
  for (const arquivo of ['summary.html', 'summary.json', 'summary.txt']) {
    await cp(join(origem, arquivo), join(performance, `${destino}-${basename(arquivo)}`));
  }
  await cp(join(origem, 'dashboard.html'), join(performance, destino, 'index.html'));
}

await writeFile(join(saida, 'index.html'), gerarHtmlPortal({
  resumo,
  modulos,
  acessibilidade,
  rastreabilidade,
  data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
}), 'utf8');
