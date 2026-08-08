/// Auditoría visual de las flashcards con Gemini Vision.
///   node scripts/verify-images.mjs                          # audita todo
///   node scripts/verify-images.mjs --only <tema>[/<slug>]   # subconjunto
///   node scripts/verify-images.mjs --refresh --only <tema>[/<slug>]  # re-audita los filtrados (borra progreso de esos)
///   node scripts/verify-images.mjs --reset                  # limpia progreso
/// Salida: reporte-imagenes.md + progreso reanudable en scripts/.verify-progress.json

import { promises as fs } from "node:fs";
import path from "node:path";
import { readCatalog, searchTerms, OUT_DIR } from "./lib/catalog.mjs";

const PROGRESS_FILE = path.resolve("scripts/.verify-progress.json");
const REPORT_FILE = path.resolve("reporte-imagenes.md");

async function loadEnv() {
  const txt = await fs.readFile(path.resolve(".env"), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function parseArgs() {
  const args = { reset: false, refresh: false, only: [], model: null, pace: 1400 };
  let prev = null;
  for (const a of process.argv.slice(2)) {
    if (a === "--reset") args.reset = true;
    else if (a === "--refresh") args.refresh = true;
    else if (a === "--only" || a === "--model" || a === "--pace") prev = a.slice(2);
    else if (a.startsWith("--only=")) args.only.push(a.slice(7));
    else if (a.startsWith("--model=")) args.model = a.slice(8);
    else if (a.startsWith("--pace=")) args.pace = Number(a.slice(7));
    else if (prev) {
      args[prev].push(a);
      prev = null;
    }
  }
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geminiVision(model, key, base64Img, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Img } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: "application/json" },
    }),
  });

  if (res.status === 429) {
    let wait = 30;
    try {
      const data = await res.json();
      const d = data?.error?.details?.[0];
      if (d?.retryDelay?.seconds) wait = Number(d.retryDelay.seconds);
    } catch {}
    return { rateLimited: true, wait };
  }
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error?.message ?? String(data?.error ?? "");
    } catch {}
    return { error: true, status: res.status, detail };
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text };
}

function parseVerdict(text) {
  const t = (text || "").trim().replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
  try {
    const j = JSON.parse(t);
    return { ok: Boolean(j.ok), confianza: Number(j.confianza) || 0, motivo: String(j.motivo ?? "").slice(0, 220) };
  } catch {
    // Gemini no devuelve JSON: lo infiere por palabras clave.
    const lower = t.toLowerCase();
    const ok = /(s[ií])|(true)|(correcta)|(corresponde)/.test(lower) && !/(no corresponde|no es|wrong|incorrecta)/.test(lower);
    return { ok, confianza: ok ? 0.6 : 0.5, motivo: t.slice(0, 220) };
  }
}

function buildPrompt(word, hint) {
  const pista = hint && hint !== word ? ` (${hint})` : "";
  return (
    `Eres un validador de tarjetas educativas. La tarjeta dice "${word}"${pista}. ` +
    `La foto debe mostrar CLARAMENTE ese concepto principal. Responde SOLO un JSON válido: ` +
    `JSON: {"ok": true/false, "confianza": 0.0 a 1.0 (de certeza de que la imagen SI corresponde), ` +
    `"motivo": "qué muestra la imagen en 1 frase"}`
  );
}

function estadoOf(r) {
  if (r.error) return "❌ NO_AUDITORIA";
  if (r.ok && Number(r.confianza) >= 0.6) return "✅ OK";
  if (!r.ok) return "⚠️ REVISAR";
  return "🟡 DUDOSA";
}

async function main() {
  const args = parseArgs();
  const env = await loadEnv();
  const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const model = args.model || env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!key) {
    console.error("Falta GEMINI_API_KEY en .env (o variable de entorno).");
    process.exit(1);
  }

  let progress = {};
  if (args.reset) await fs.rm(PROGRESS_FILE, { force: true });
  try {
    progress = JSON.parse(await fs.readFile(PROGRESS_FILE, "utf8"));
  } catch {}

  const onlySet = new Set(args.only);

  const catalog = await readCatalog();
  const tasks = [];

  for (const topic of Object.keys(catalog)) {
    const dir = path.join(OUT_DIR, topic);
    let files = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".jpg"));
    } catch {}
    for (const f of files) {
      const slug = f.replace(/\.jpg$/, "");
      const id = `${topic}/${slug}`;
      if (onlySet.size && !onlySet.has(topic) && !onlySet.has(id) && !onlySet.has(`${topic}/${slug}`)) continue;
      tasks.push({ id, topic, slug, file: path.join(dir, f), word: catalog[topic]?.get(slug) ?? slug });
    }
  }
  tasks.sort((a, b) => a.id.localeCompare(b.id));

  if (args.refresh) {
    for (const t of tasks) delete progress[t.id];
  }
  console.log(`Auditando ${tasks.length} imágenes con ${model} (progreso reanudable)...\n`);

  const paceMs = args.pace || 1400;
  let consecutive429 = 0;

  let nOk = 0;
  let nFix = 0;
  let nDoubt = 0;
  let nErr = 0;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (progress[t.id]) {
      const r = progress[t.id];
      const tag = estadoOf(r);
      if (tag.startsWith("✅")) nOk++;
      else if (tag.startsWith("⚠️")) nFix++;
      else if (tag.startsWith("🟡")) nDoubt++;
      else nErr++;
      continue;
    }

    const b64 = Buffer.from(await fs.readFile(t.file)).toString("base64");
    const hint = searchTerms(t.topic, t.slug)[0] ?? t.word;
    const prompt = buildPrompt(t.word, hint);
    let attempt = 0;
    let verdict = null;
    let hitLimit = false;

    while (attempt < 4) {
      if (attempt > 0) console.log(`  ↻ reintento ${t.id} (intento ${attempt + 1})`);
      await sleep(paceMs);
      const res = await geminiVision(model, key, b64, prompt);
      if (res.rateLimited) {
        consecutive429++;
        if (consecutive429 >= 3) {
          console.log(`\n⚠️  Límite de cuota alcanzado (varios 429 consecutivos).`);
          console.log(`   Progreso guardado: continúa con \`node scripts/verify-images.mjs\``);
          hitLimit = true;
          break;
        }
        const w = Math.max(res.wait || 20, 20);
        console.log(`  429 → esperando ${w}s…`);
        await sleep(w * 1000);
        attempt++;
        continue;
      }
      consecutive429 = 0;
      if (res.error) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            `\n✗ Credencial rechazada (${res.status}): ${res.detail}\n` +
            "Revisa GEMINI_API_KEY: debe estar creada en aistudio.google.com/apikey," +
            " empezar por AIza, no estar deshabilitada y tener habilitada la Generative Language API."
          );
        }
        if (res.status === 404) {
          throw new Error(`Modelo "${model}" no encontrado. Prueba --model gemini-3.1-flash-lite`);
        }
        console.error(`  ✗ error ${res.status} en ${t.id}: ${res.detail}`);
        await sleep(2500); // 503/500 transitorios
        attempt++;
        continue;
      }
      verdict = parseVerdict(res.text);
      break;
    }

    if (hitLimit) break;

    if (!verdict) {
      verdict = { ok: null, confianza: 0, motivo: "No respondió", error: true };
    }

    progress[t.id] = { ...verdict, ts: Date.now() };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 0));

    const se = estadoOf(verdict);
    if (se.startsWith("✅")) nOk++;
    else if (se.startsWith("⚠️")) nFix++;
    else if (se.startsWith("🟡")) nDoubt++;
    else nErr++;

    console.log(`${se} ${t.id} — ${t.word} — ${verdict.motivo ?? ""}`.trim());
    await new Promise((r) => setTimeout(r, 400));
  }

  const pendientes = tasks.filter(
    (t) => !progress[t.id] || (progress[t.id] && progress[t.id].error)
  ).length;
  console.log(`\n=== Resumen: ✅ ${nOk} · ⚠️ REVISAR ${nFix} · 🟡 DUDOSA ${nDoubt} · ❌ ERROR ${nErr} · pendientes ${pendientes}`);

  await writeReport(catalog, progress, { nOk, nFix, nDoubt, nErr, model });
}

async function writeReport(catalog, progress, sums) {
  const topics = Object.keys(catalog).sort();
  let nOk = 0, nFix = 0, nDoubt = 0, nErr = 0;
  for (const r of Object.values(progress)) {
    const tag = estadoOf(r);
    if (tag.startsWith("✅")) nOk++;
    else if (tag.startsWith("⚠️")) nFix++;
    else if (tag.startsWith("🟡")) nDoubt++;
    else nErr++;
  }
  const lines = [];
  lines.push(`# Reporte de imágenes (auditoría ${new Date().toISOString().slice(0, 10)})`);
  lines.push("");
  lines.push(
    `**✅ OK ${nOk} · ❌ REVISAR ${nFix} · 🟡 DUDOSA ${nDoubt} · ⚠ ERROR ${nErr || 0}**`
  );
  lines.push("");
  for (const topic of topics) {
    const entries = Object.entries(progress).filter(([id]) => id.startsWith(topic + "/"));
    if (!entries.length) continue;
    lines.push(`## ${topic}`);
    lines.push("");
    lines.push("| Imagen | Palabra | Estado | Motivo |");
    lines.push("| --- | --- | --- | --- |");
    for (const [id, r] of entries) {
      const slug = id.split("/")[1];
      const word = catalog[topic].get(slug) ?? slug;
      lines.push(`| \`${slug}.jpg\` | ${word} | ${estadoOf(r)} | ${r.motivo ?? r.detail ?? ""} |`);
    }
    lines.push("");
  }
  await fs.writeFile(REPORT_FILE, lines.join("\n"), "utf8");
  console.log(`Reporte: ${REPORT_FILE}`);
}

main()
  .then(() => {})
  .catch((e) => {
    console.error(e.message || e);
    process.exitCode = 1;
    setTimeout(() => {}, 300);
  });