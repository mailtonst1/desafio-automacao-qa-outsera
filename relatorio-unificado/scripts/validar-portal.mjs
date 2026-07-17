import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const argumentos = process.argv.slice(2);
const indice = argumentos.indexOf('--saida');
const saida = resolve(indice >= 0 ? argumentos[indice + 1] : 'saida');
const resumo = JSON.parse(await readFile(join(saida, 'summary.json'), 'utf8'));
const html = await readFile(join(saida, 'index.html'), 'utf8');
const bloqueado = resumo.status === 'failed' || resumo.stats.failed > 0;

assert.ok(html.includes(`${resumo.stats.total} resultados`), 'Total consolidado divergente do summary.json.');
assert.ok(html.includes(`Aprovados<strong>${resumo.stats.passed}</strong>`), 'Total de aprovados divergente do summary.json.');
assert.ok(html.includes(`Reprovados<strong>${resumo.stats.failed}</strong>`), 'Total de reprovados divergente do summary.json.');

if (bloqueado) {
  assert.ok(!html.includes('>APROVADO<'), 'Portal reprovado nao pode exibir APROVADO.');
  assert.ok(html.includes('BLOQUEADO POR ACESSIBILIDADE'), 'Portal reprovado deve exibir o bloqueio.');
  assert.match(html, /Web E2E<strong>7\/11<\/strong>aprovados e 4 reprovados/);
}

console.log(`Portal validado com status ${bloqueado ? 'BLOQUEADO' : 'APROVADO'}.`);
