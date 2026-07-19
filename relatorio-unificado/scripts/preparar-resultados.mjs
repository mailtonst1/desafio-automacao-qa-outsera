import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { rotularResultado } from './preparar-resultados-lib.mjs';

const raiz = resolve(import.meta.dirname, '..');
const destino = join(raiz, 'temporario');
const argumentos = process.argv.slice(2);
const entradas = new Map();

for (let indice = 0; indice < argumentos.length; indice += 2) {
  entradas.set(argumentos[indice]?.replace('--', ''), argumentos[indice + 1]);
}

const modulos = [
  ['api', 'API', undefined],
  ['web', 'Web E2E', undefined],
  ['web-funcional', 'Web E2E', 'Funcional'],
  ['web-acessibilidade', 'Web E2E', 'Acessibilidade'],
  ['mobile', 'Mobile', undefined],
];

async function rotularResultados(pasta, modulo, origem, arquivos) {
  await Promise.all(arquivos.filter((arquivo) => arquivo.endsWith('-result.json')).map(async (arquivo) => {
    const caminho = join(pasta, arquivo);
    const resultado = JSON.parse(await readFile(caminho, 'utf8'));
    await writeFile(caminho, JSON.stringify(rotularResultado(resultado, modulo, origem)), 'utf8');
  }));
}

await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });

for (const [chave, modulo, origemResultado] of modulos) {
  const origem = entradas.get(chave);
  if (!origem) continue;
  const pastaOrigem = resolve(origem);
  const pastaDestino = destino;
  try {
    const arquivos = await readdir(pastaOrigem);
    await cp(pastaOrigem, pastaDestino, { recursive: true, errorOnExist: false });
    await rotularResultados(pastaDestino, modulo, origemResultado, arquivos);
  } catch (erro) {
    if (erro.code !== 'ENOENT') throw erro;
  }
}

const k6 = entradas.get('k6');
if (k6) {
  const pastaK6 = resolve(k6);
  try {
    await mkdir(join(destino, 'performance'), { recursive: true });
    await cp(pastaK6, destino, { recursive: true, errorOnExist: false });
  } catch (erro) {
    if (erro.code !== 'ENOENT') throw erro;
  }
}
