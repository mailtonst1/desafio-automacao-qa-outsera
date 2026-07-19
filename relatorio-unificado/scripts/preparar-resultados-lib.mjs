export function rotularResultado(resultado, modulo, origem) {
  return {
    ...resultado,
    labels: [
      { name: 'parentSuite', value: modulo },
      { name: 'module', value: modulo },
      ...(origem ? [{ name: 'origin', value: origem }] : []),
      ...(resultado.labels || []).filter((label) => !['parentSuite', 'module', 'origin'].includes(label.name)),
    ],
  };
}
