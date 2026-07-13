import { cp, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const argumentos = process.argv.slice(2);
const valor = (nome) => {
  const indice = argumentos.indexOf(nome);
  return indice >= 0 ? argumentos[indice + 1] : undefined;
};

const saida = "saida";
const allure = join(saida, "allure");
const performance = join(saida, "performance");
const fumaca = valor("--fumaca");
const carga = valor("--carga");

if (!fumaca || !carga) {
  throw new Error("Informe --fumaca e --carga para preparar a publicacao.");
}

await mkdir(allure, { recursive: true });
await mkdir(performance, { recursive: true });
await rename(join(saida, "index.html"), join(allure, "index.html"));

for (const [origem, destino] of [[fumaca, "fumaca"], [carga, "carga"]]) {
  for (const arquivo of ["summary.html", "summary.json", "summary.txt"]) {
    await cp(join(origem, arquivo), join(performance, `${destino}-${basename(arquivo)}`));
  }
  await cp(join(origem, "summary.html"), join(performance, `${destino}.html`));
}

const repositorio = process.env.GITHUB_REPOSITORY || "mailtonst1/desafio-automacao-qa-outsera";
const servidor = process.env.GITHUB_SERVER_URL || "https://github.com";
const runId = process.env.GITHUB_RUN_ID;
const urlWorkflow = runId ? `${servidor}/${repositorio}/actions/runs/${runId}` : `${servidor}/${repositorio}/actions`;
const commit = process.env.GITHUB_SHA || "execucao local";
const branch = process.env.GITHUB_REF_NAME || "local";

await writeFile(join(saida, "index.html"), `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Outsera - Evidencias de Qualidade</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;padding:0 24px;color:#172033}h1{margin-bottom:8px}ul{padding-left:20px}li{margin:12px 0}a{color:#0057b8}code{background:#eef2f7;padding:2px 5px}</style></head><body><h1>Outsera: evidencias de qualidade</h1><p>Commit <code>${commit}</code><br>Branch <code>${branch}</code></p><ul><li><a href="allure/index.html">Relatorio Allure unificado</a></li><li><a href="performance/fumaca.html">Performance: fumaca</a></li><li><a href="performance/carga.html">Performance: carga</a></li><li><a href="${urlWorkflow}">Workflow no GitHub Actions</a></li></ul></body></html>`, "utf8");
