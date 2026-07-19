import assert from 'node:assert/strict';
import test from 'node:test';
import { rotularResultado } from '../scripts/preparar-resultados-lib.mjs';

test('mantém Web no mesmo módulo e identifica a origem funcional', () => {
  const resultado = rotularResultado({
    name: 'Cenário funcional',
    labels: [
      { name: 'module', value: 'valor antigo' },
      { name: 'origin', value: 'valor antigo' },
      { name: 'feature', value: 'Autenticação' },
    ],
  }, 'Web E2E', 'Funcional');

  assert.deepEqual(resultado.labels, [
    { name: 'parentSuite', value: 'Web E2E' },
    { name: 'module', value: 'Web E2E' },
    { name: 'origin', value: 'Funcional' },
    { name: 'feature', value: 'Autenticação' },
  ]);
});

test('identifica a origem de acessibilidade sem duplicar labels', () => {
  const resultado = rotularResultado({ name: 'Cenário axe', labels: [] }, 'Web E2E', 'Acessibilidade');

  assert.equal(resultado.labels.find((label) => label.name === 'module').value, 'Web E2E');
  assert.equal(resultado.labels.find((label) => label.name === 'origin').value, 'Acessibilidade');
  assert.equal(resultado.labels.filter((label) => label.name === 'origin').length, 1);
});
