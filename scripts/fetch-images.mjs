/// Descarga fotos reales para las flashcards.
///   node scripts/fetch-images.mjs                 # solo faltantes
///   node scripts/fetch-images.mjs --force         # re-descarga todo
///   node scripts/fetch-images.mjs --only <tema>   # solo un tema
///   node scripts/fetch-images.mjs --only <tema>/<slug>  # una tarjeta
///   node scripts/fetch-images.mjs --force --only tema/a --only tema/b  # varios
/// Fuentes: Pixabay (principal) -> Pexels (respaldo).
/// Elige el candidato con mejores etiquetas (tags/alt) contra el término.

import { promises as fs } from "node:fs";
import path from "node:path";
import { readCatalog, searchTerms, imageType, OUT_DIR } from "./lib/catalog.mjs";

const CREDS_FILE = path.resolve("apis-banco-imagenes.txt");

let PIXABAY_KEY = "";
let PEXELS_KEY = "";

const emoticon = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function tokensOf(term) {
  return emoticon(term).match(/[a-z0-9]+/g) ?? [];
}

function scoreHit(queryTokens, bioText) {
  if (!bioText) return 0;
  const tokens = emoticon(bioText).match(/[a-z0-9]+/g) ?? [];
  const set = new Set(tokens);
  let hits = 0;
  for (const t of queryTokens) if (set.has(t)) hits++;
  if (hits === 0) return 0;
  const phrase = bioText.toLowerCase();
  if (queryTokens.length > 1 && phrase.includes(queryTokens.join(" "))) hits += 2;
  return hits;
}

async function fetchWithRetry(url, init = {}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status === 500) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      if (!res.ok) return null;
      return res;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

async function pixabay(term, imageType = "photo") {
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
    term
  )}&image_type=${imageType}&safesearch=true&orientation=landscape&per_page=6`;
  const res = await fetchWithRetry(url);
  if (!res) return null;
  const data = await res.json();
  return data?.hits ?? null;
}

async function pexels(term) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    term
  )}&orientation=landscape&per_page=6`;
  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${PEXELS_KEY}` },
  });
  if (!res) return null;
  const data = await res.json();
  return data?.photos ?? null;
}

async function findImage(topic, slug) {
  const terms = searchTerms(topic, slug);
  const queryTokens = [...new Set(terms.flatMap((t) => tokensOf(t)))];
  const iType = imageType(topic, slug);

  // Solo candidatos cuyas etiquetas coincidan con ALGUN término de búsqueda;
  // así evitamos "mejores" fotos de resultado genérico (nube nociones/atardecer).
  const ranked = (items, getBio) =>
    (items || [])
      .map((x) => ({ x, s: scoreHit(queryTokens, getBio(x)) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);

  for (const term of terms) {
    const hits = await pixabay(term, iType);
    const best = ranked(hits, (x) => x.tags)[0];
    if (best?.x?.webformatURL) return best.x.webformatURL;
  }
  for (const term of terms) {
    const photos = await pexels(term);
    const best = ranked(photos, (x) => x.alt)[0];
    if (best?.x?.src?.large) return best.x.src.large;
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return false;
  await fs.writeFile(dest, buf);
  return true;
}

function parseArgs() {
  const args = { force: false, only: [] };
  let prev = null;
  for (const a of process.argv.slice(2)) {
    if (a === "--force") args.force = true;
    else if (a === "--only") prev = "only";
    else if (a.startsWith("--only=")) args.only.push(a.slice(7));
    else if (prev) {
      args[prev].push(a);
      prev = null;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  try {
    const creds = await fs.readFile(CREDS_FILE, "utf8");
    const readKey = (name) => {
      const m = creds.match(new RegExp(`${name}=([A-Za-z0-9-]+)`));
      return m?.[1] ?? "";
    };
    PIXABAY_KEY = readKey("PIXABAY_API_KEY");
    PEXELS_KEY = readKey("PEXELS_API_KEY");
  } catch {
    console.error("Falta apis-banco-imagenes.txt con PIXABAY_API_KEY y PEXELS_API_KEY");
    process.exit(1);
  }
  if (!PIXABAY_KEY) console.warn("⚠ No hay PIXABAY_API_KEY; solo se usará Pexels.");

  const catalog = await readCatalog();

  let onlyTopic = null;
  let onlySlug = null;
  if (args.only.length && args.only[args.only.length - 1].includes("/")) {
    [onlyTopic, onlySlug] = args.only[args.only.length - 1].split("/");
  } else if (args.only.length) {
    onlyTopic = args.only[args.only.length - 1];
  }
  // `--only` puede ser `tema`, `tema/slug`, o varios `--only` repetidos.
  const onlySet = new Set(args.only);
  const useOnly = args.only.length > 0;

  const tasks = [];
  for (const topic of Object.keys(catalog)) {
    const dir = path.join(OUT_DIR, topic);
    await fs.mkdir(dir, { recursive: true });
    for (const [slug, word] of catalog[topic]) {
      if (!useOnly || onlySet.has(topic) || onlySet.has(`${topic}/${slug}`))
        tasks.push({ topic, slug, word, dest: path.join(dir, `${slug}.jpg`) });
    }
  }

  tasks.sort((a, b) => (onlyTopic ? 0 : a.topic.localeCompare(b.topic)));

  let okCount = 0;
  let failCount = 0;
  const failures = [];
  let cursor = 0;

  const workers = Array.from({ length: 4 }, async () => {
    while (cursor < tasks.length) {
      const t = tasks[cursor++];
      if (!args.force) {
        try {
          await fs.access(t.dest);
          continue; // ya existe
        } catch {}
      }
      const img = await findImage(t.topic, t.slug, t.word);
      if (!img) {
        failCount++;
        failures.push(`${t.topic}/${t.slug}`);
        console.log(`✗ ${t.topic}/${t.slug}`);
        continue;
      }
      if (await download(img, t.dest)) {
        okCount++;
        console.log(`✓ ${t.topic}/${t.slug} <- ${img.split("?")[0].slice(0, 70)}`);
      } else {
        failCount++;
        failures.push(`${t.topic}/${t.slug}`);
        console.log(`✗ descarga falló ${t.topic}/${t.slug}`);
      }
    }
  });

  await Promise.all(workers);

  console.log(
    `\nListo. Descargadas: ${okCount} · Fallaron: ${failCount} · Total tareas: ${tasks.length}`
  );
  if (failures.length) console.log("Fallidas:", failures.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});