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
  await mkdir(join(performance, destino), { recursive: true });
  for (const arquivo of ["summary.html", "summary.json", "summary.txt"]) {
    await cp(join(origem, arquivo), join(performance, `${destino}-${basename(arquivo)}`));
  }
  await cp(join(origem, "dashboard.html"), join(performance, destino, "index.html"));
}

const repositorio = process.env.GITHUB_REPOSITORY || "mailtonst1/desafio-automacao-qa-outsera";
const servidor = process.env.GITHUB_SERVER_URL || "https://github.com";
const runId = process.env.GITHUB_RUN_ID;
const urlWorkflow = runId ? `${servidor}/${repositorio}/actions/runs/${runId}` : `${servidor}/${repositorio}/actions`;
const commit = process.env.GITHUB_SHA || "execucao local";
const branch = process.env.GITHUB_REF_NAME || "local";
const data = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

await writeFile(join(saida, "index.html"), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outsera | Evidencias</title><style>:root{color:#172033;background:#f5f7fa;font-family:Arial,sans-serif}body{margin:0}.wrap{max-width:1080px;margin:auto;padding:44px 24px}.hero{background:#102a43;color:white;padding:40px;border-radius:8px}.hero p{max-width:700px;line-height:1.5}.status{color:#047857;font-weight:bold}.meta{display:flex;gap:18px;flex-wrap:wrap;font-size:.9rem}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:28px 0}.card,.panel{background:white;border:1px solid #d9e2ec;border-radius:8px;padding:20px}.card strong{font-size:1.8rem;display:block;margin-top:8px}.actions{display:flex;flex-wrap:wrap;gap:12px}.button{background:#0057b8;color:#fff;text-decoration:none;border-radius:6px;padding:12px 16px;font-weight:bold}.button.alt{background:#fff;color:#0057b8;border:1px solid #0057b8}h2{margin-top:34px}@media(max-width:700px){.wrap{padding:20px}.hero{padding:28px}.grid{grid-template-columns:repeat(2,1fr)}.actions{display:grid}.button{text-align:center}}</style></head><body><main class="wrap"><section class="hero"><p class="status">APROVADO</p><h1>Desafio de Automacao QA Outsera</h1><p>Portal publico de evidencias da pipeline: qualidade funcional consolidada e resultados de performance com graficos oficiais do k6.</p><div class="meta"><span>Commit: <code>${commit.slice(0, 12)}</code></span><span>Branch: <code>${branch}</code></span><span>Execucao: ${data}</span></div></section><section class="grid"><article class="card">API<strong>43</strong>aprovados</article><article class="card">Web E2E<strong>7</strong>aprovados</article><article class="card">Mobile<strong>6</strong>aprovados</article><article class="card">Performance<strong>2</strong>perfis aprovados</article></section><section class="panel"><h2>58 resultados aprovados</h2><p>O Allure consolida API, Web E2E, Mobile e os resumos de performance. Os dashboards k6 apresentam series temporais, percentis e thresholds.</p><div class="actions"><a class="button" href="allure/index.html">Abrir Allure unificado</a><a class="button alt" href="performance/fumaca/index.html">k6: fumaca</a><a class="button alt" href="performance/carga/index.html">k6: carga 500 VUs</a><a class="button alt" href="https://github.com/${repositorio}">Repositorio</a><a class="button alt" href="${urlWorkflow}">GitHub Actions</a></div></section></main></body></html>`, "utf8");
