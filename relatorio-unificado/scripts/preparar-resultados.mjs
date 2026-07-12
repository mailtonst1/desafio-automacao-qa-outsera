import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const destino = join(raiz, 'temporario');
const argumentos = process.argv.slice(2);
const entradas = new Map();

for (let indice = 0; indice < argumentos.length; indice += 2) {
  entradas.set(argumentos[indice]?.replace('--', ''), argumentos[indice + 1]);
}

const modulos = [
  ['api', 'API'],
  ['web', 'Web E2E'],
  ['mobile', 'Mobile'],
];

async function rotularResultados(pasta, modulo, arquivos) {
  await Promise.all(arquivos.filter((arquivo) => arquivo.endsWith('-result.json')).map(async (arquivo) => {
    const caminho = join(pasta, arquivo);
    const resultado = JSON.parse(await readFile(caminho, 'utf8'));
    resultado.labels = [
      { name: 'parentSuite', value: modulo },
      { name: 'module', value: modulo },
      ...(resultado.labels || []).filter((label) => !['parentSuite', 'module'].includes(label.name)),
    ];
    await writeFile(caminho, JSON.stringify(resultado), 'utf8');
  }));
}

await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });

for (const [chave, modulo] of modulos) {
  const origem = entradas.get(chave);
  if (!origem) continue;
  const pastaOrigem = resolve(origem);
  const pastaDestino = destino;
  try {
    const arquivos = await readdir(pastaOrigem);
    await cp(pastaOrigem, pastaDestino, { recursive: true, errorOnExist: false });
    await rotularResultados(pastaDestino, modulo, arquivos);
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
