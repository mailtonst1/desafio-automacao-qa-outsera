import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  carregarResultados,
  obterRastreabilidade,
  resumirAcessibilidade,
  resumirModulos,
} from './portal.mjs';
import { validarPortal } from './validar-portal-lib.mjs';

const argumentos = process.argv.slice(2);
const valor = (nome, padrao) => {
  const indice = argumentos.indexOf(nome);
  return resolve(indice >= 0 ? argumentos[indice + 1] : padrao);
};
const saida = valor('--saida', 'saida');
const diretorioResultados = valor('--resultados', 'temporario');
const resumo = JSON.parse(await readFile(join(saida, 'summary.json'), 'utf8'));
const portal = JSON.parse(await readFile(join(saida, 'portal.json'), 'utf8'));
const html = await readFile(join(saida, 'index.html'), 'utf8');
const resultados = await carregarResultados(diretorioResultados);
const modulosEsperados = resumirModulos(resultados);
const acessibilidadeEsperada = await resumirAcessibilidade(resultados, diretorioResultados);
const rastreabilidadeEsperada = obterRastreabilidade(process.env);

validarPortal({
  resumo,
  portal,
  html,
  modulosEsperados,
  acessibilidadeEsperada,
  rastreabilidadeEsperada,
});

console.log(`Portal validado com status ${portal.status.texto}.`);
