// Catálogo compartido por fetch-images.mjs y verify-images.mjs.
// Lee lib/content.ts igual que antes y aporta las búsquedas corregidas.

import { promises as fs } from "node:fs";
import path from "node:path";

export const DOWNLOAD_TOPICS = [
  "colores",
  "animales",
  "formas",
  "lectura",
  "vocabulario",
  "clima",
  "espacio",
  "transportes",
  "profesiones",
  "naturaleza",
  "musica",
  "comidas",
  "deportes",
];

export const PREFIX_TOPIC = {
  cor: "colores",
  num: "numeros",
  ani: "animales",
  for: "formas",
  let: "letras",
  lec: "lectura",
  mat: "mates",
  voc: "vocabulario",
  cli: "clima",
  esp: "espacio",
  tra: "transportes",
  pro: "profesiones",
  nat: "naturaleza",
  mus: "musica",
  com: "comidas",
  dep: "deportes",
  emo: "emociones",
};

const NO_ACCENT = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function slugify(word) {
  return NO_ACCENT(String(word))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// OVERRIDES: clave = slug real (sin acentos) -> [término_principal, término_alt].
// El primero se usa para buscar y también como «pista» para el verificador.
export const OVERRIDES = {
  colores: {
    "rojo": ["fondo rojo", "cartulina roja"],
    "azul": ["fondo azul", "pintura azul"],
    "verde": ["fondo verde", "pintura verde"],
    "amarillo": ["fondo amarillo", "pintura amarilla"],
    "naranja": ["naranja color", "naranja"],
    "rosado": ["fondo rosa pastel", "pintura rosa"],
    "morado": ["fondo morado", "pintura morada"],
    "blanco": ["blanco bandera", "pared blanca"],
    "negro": ["fondo negro", "pizarra negra"],
    "marron": ["marrón madera", "pintura marron"],
    "gris": ["fondo gris", "pintura gris"],
    "dorado": ["dorado brillante", "oro"],
    "plateado": ["plateado metal", "plata metal"],
    "turquesa": ["turquesa", "mar turquesa"],
    "lila": ["flor lila", "lila"],
    "esmeralda": ["esmeralda gema", "verde esmeralda"],
    "borgona": ["borgoña vino", "vino tinto oscuro"],
    "beige": ["beige tela", "color beige"],
    "celeste": ["cielo celeste", "azul claro"],
  },
  animales: {
    "leon": ["leon africano", "leon"],
    "delfin": ["delfin mar", "delfin"],
    "pinguino": ["pinguino", "pinguino hielo"],
    "aguila": ["aguila vuelo", "aguila"],
    "camaleon": ["camaleon", "camaleon lagarto"],
    "tiburon": ["tiburon", "tiburon mar"],
    "murcielago": ["murcielago", "murcielago volando"],
    "oso": ["oso pardo", "oso"],
    "zorro": ["rojo zorro", "zorro"],
    "gallina": ["gallina granja", "gallina"],
    "cabra": ["cabra montana", "cabra"],
    "pavo": ["pavo animal", "pavo"],
    "cocodrilo": ["cocodrilo", "cocodrilo rio"],
    "hipopotamo": ["hipopotamo", "hipopotamo animal"],
    "rinoceronte": ["rinoceronte", "rinoceronte animal"],
    "guepardo": ["guepardo", "cheetah guepardo"],
    "suricato": ["suricato", "meerkat suricata"],
    "panda": ["panda oso panda", "panda"],
  },
  formas: {
    "valo": ["óvalo forma", "valo"],
    "cuadrado": ["cuadrado geometria", "cuadrado"],
    "triangulo": ["triangulo geometria", "triangulo"],
    "rectangulo": ["rectangulo geometria", "rectangulo"],
    "circulo": ["circulo geometria", "circulo"],
    "rombo": ["rombo geometria", "rombo"],
    "corazon": ["corazon rojo", "corazon"],
    "estrella": ["estrella dorada", "estrella"],
    "luna": ["media luna", "luna"],
    "cruz": ["cruz", "cruz roja"],
    "pentagono": ["pentagono", "pentagono geometria"],
    "hexagono": ["hexagono", "hexagono geometria"],
    "espiral": ["espiral", "espiral"],
    "diamante": ["diamante brillante", "jewel diamante"],
    "esfera": ["pelota esferica", "esfera"],
    "cilindro": ["lata cilindro", "cilindro"],
    "cono": ["cono helado", "cono"],
    "cubo": ["cubo dado", "cubo"],
    "piramide": ["piramide", "piramide geometria"],
    "prisma": ["prisma geometria", "prisma triangular"],
  },
  lectura: {
    "el-gato-come-pescado": ["gato", "gato pescado"],
    "la-luna-brilla-de-noche": ["luna", "luna de noche"],
    "voy-a-la-escuela-en-tren": ["escuela", "escuela tren"],
    "me-gusta-pintar-un-arco-ris": ["arco iris", "arco iris pintura"],
    "el-delfin-nada-en-el-mar": ["delfin", "delfin mar"],
    "los-planetas-giran-al-sol": ["planetas", "planetas sol espacio"],
  },
  vocabulario: {
    "mama": ["mama hijo", "mama"],
    "papa": ["papa hijo", "papa"],
    "abuelita": ["abuela", "abuela"],
    "abuelito": ["abuelito", "abuelo"],
    "bebe": ["bebe", "bebe sonriendo"],
    "hermana": ["hermana", "nina"],
    "hermano": ["hermano", "nino"],
    "ojos": ["ojos", "ojo"],
    "nariz": ["nariz", "nariz"],
    "boca": ["boca", "boca sonrisa"],
    "orejas": ["orejas", "oreja"],
    "manos": ["manos", "mano"],
    "pies": ["pies", "pie"],
    "camisa": ["camisa", "camisa"],
    "pantalon": ["pantalon", "pantalon vaqueros"],
    "vestido": ["vestido", "vestido"],
    "zapatos": ["zapatos", "zapatos"],
    "sombrero": ["sombrero", "sombrero"],
    "manzana": ["manzana", "manzana"],
    "naranja": ["naranja", "naranja fruta"],
    "leche": ["leche", "glas de leche"],
    "pan": ["pan", "pan"],
    "queso": ["queso", "queso"],
    "mesa": ["mesa", "mesa madera"],
    "silla": ["silla", "silla"],
    "puerta": ["puerta", "puerta"],
    "ventana": ["ventana", "ventana"],
    "cocina": ["cocina", "cocina"],
    "bano": ["bano", "bano ducha"],
    "escalera": ["escalera", "escalera"],
    "television": ["television", "television"],
    "refrigerador": ["refrigerador", "heladera"],
    "lavadora": ["lavadora", "lavadora"],
    "computadora": ["computadora", "computadora"],
    "tablet": ["tablet", "tablet"],
    "bicicleta": ["bicicleta", "bicicleta"],
    "autobus": ["autobus escolar", "autobus"],
    "avion": ["avion", "avion"],
    "barco": ["barco", "barco"],
    "biblioteca": ["biblioteca", "biblioteca"],
    "columpio": ["columpio", "columpio"],
    "supermercado": ["supermarket", "grocery store interior"],
    "jardin": ["jardin flores", "jardin"],
  },
  clima: {
    "arco-ris": ["arco iris cielo", "arco iris"],
    "relampago": ["tormenta relampago", "rayo tormenta"],
    "frio": ["inverno frio", "frio"],
    "sequia": ["sequia desierto", "tierra seca"],
    "granizo": ["granizo", "hielo granizo"],
    "tormenta": ["tormenta", "tormenta nubes"],
    "huracan": ["huracan", "tornado huracan"],
    "calor": ["calor sol", "dia caluroso"],
    "niebla": ["niebla neblina", "niebla"],
  },
  espacio: {
    "sol": ["sol brillante", "sol"],
    "estrella": ["estrellas noche", "estrellas"],
    "planeta": ["planeta", "planeta tierra"],
    "tierra": ["tierra planeta", "planeta tierra"],
    "fase-lunar": ["luna fases", "fases de la luna"],
    "orbita": ["orbita espacial", "orbita"],
    "asteroides": ["asteroides espacio", "asteroides"],
    "mercurio": ["planeta mercurio", "mercurio planeta"],
    "venus": ["planeta venus", "venus planeta"],
    "marte": ["planeta marte", "marte planeta"],
    "jupiter": ["planeta jupiter", "jupiter planeta"],
    "saturno": ["saturno anillos", "planeta saturno"],
    "urano": ["planeta urano", "urano planeta"],
    "neptuno": ["planeta neptuno", "neptuno planeta"],
    "galaxia": ["galaxia espiral", "galaxia"],
    "pluton": ["planeta pluton", "pluton planeta"],
    "estacion-espacial": ["estacion espacial", "iss estacion"],
  },
  transportes: {
    "auto": ["coche auto", "automovil"],
    "metro": ["metro tren", "subterraneo"],
    "estacion-de-tren": ["estacion de tren", "estacion ferrocarril"],
    "crucero": ["crucero barco", "barco crucero"],
    "moto": ["motocicleta moto", "moto"],
    "autobus": ["autobus", "bus ciudad"],
    "avion": ["avion vuelo", "avion"],
    "camion": ["camion", "camion carretera"],
    "helicoptero": ["helicoptero", "helicoptero"],
    "semaforo": ["semaforo", "semaforo calle"],
  },
  profesiones: {
    "doctor": ["medico doctor", "doctor"],
    "cocinero": ["chef cocinero", "chef cocina"],
    "maestro": ["maestra escuela", "profesor escuela"],
    "veterinaria": ["veterinario animal", "veterinaria"],
    "policia": ["policia", "oficial de policia"],
    "panadero": ["panadero pan", "panaderia"],
    "camarero": ["camarero restaurante", "mesero"],
    "ingeniera": ["ingeniera construccion", "ingeniero"],
    "arquitecto": ["arquitecto plano", "arquitectura"],
    "granjero": ["granjero campo", "agricultor"],
    "exploradora": ["explorador mapa", "aventura mapa"],
    "jardinera": ["jardineria plantas", "jardinero"],
    "musica": ["profesion musica", "musico"],
    "directora": ["directora cine", "director cine"],
    "dentista": ["dentista", "dentista"],
    "bombero": ["bombero", "bombero casco"],
    "astronauta": ["astronauta", "astronauta espacio"],
    "peinadora": ["hair salon styling", "hairdresser cutting hair"],
    "carpintera": ["woman carpenter", "carpintera workbench"],
    "programadora": ["woman programmer computer", "developer coding"],
  },
  naturaleza: {
    "mar": ["mar oceano", "mar playa"],
    "rio": ["rio", "rio naturaleza"],
    "selva": ["selva tropical", "selva"],
    "lago": ["lago naturaleza", "lago"],
    "pradera": ["pradera campos", "pradera verde"],
    "arrecife-de-coral": ["arrecife de coral", "coral marino"],
    "ciclo-del-agua": ["ciclo del agua", "ciclo hidrologico"],
    "fotosintesis": ["fotosintesis planta", "hoja verde"],
    "reciclaje": ["reciclaje botellas", "reciclaje"],
    "huerto": ["huerto vegetales", "jardin vegetales"],
    "arbol": ["arbol", "arbol vista"],
    "montana": ["montana montanas", "montana"],
    "tundra": ["tundra", "tundra paisaje"],
    "estanque": ["estanque agua", "estanque"],
    "volcan": ["volcano eruption", "volcan eruption"],
    "ecosistema": ["forest ecosystem", "rainforest ecosystem lush"],
    "cadena-alimentaria": ["food chain", "cadena alimenticia"],
  },
  musica: {
    "notas": ["notas musicales", "notas"],
    "escala": ["escala musical", "piano teclas"],
    "orquesta": ["orquesta sinfonica", "orquesta"],
    "director": ["director de orquesta", "director musica"],
    "salsa": ["salsa baile", "baile salsa"],
    "clasica": ["musica clasica violin", "piano clasico"],
    "rock": ["guitarra rock", "rock musica"],
    "jazz": ["trompeta jazz", "jazz musica"],
    "microfono": ["microfono", "microfono cantante"],
    "violin": ["violin", "violin"],
    "bateria": ["bateria tambores", "bateria musical",],
    "saxofon": ["saxofon", "saxophone"],
    "corneta": ["trumpet gold", "corneta trompeta"],
    "cumbia": ["danza colores pueblo", "baile folklorico"],
  },
  comidas: {
    "frutas": ["frutas frescas", "frutas"],
    "verduras": ["verduras frescas", "vegetales"],
    "lacteos": ["productos lacteos", "leche queso"],
    "cereales": ["cereales desayuno", "cereal bowl"],
    "proteinas": ["carne huevos proteina", "proteinas"],
    "platano": ["platano", "banana"],
    "brocoli": ["brocoli", "brocoli"],
  },
  deportes: {
    "pelota": ["pelota", "ball"],
    "correr": ["correr corredor", "running"],
    "nadar": ["nadar piscina", "natacion"],
    "baloncesto": ["baloncesto basketball", "baloncesto"],
    "gimnasia": ["gimnasia gimnasio", "gym"],
    "ciclismo": ["ciclista bicicleta", "ciclismo"],
    "tenis": ["raqueta tenis", "tenis"],
    "voleibol": ["voleibol voley", "volei"],
    "beisbol": ["beisbol baseball", "beisbol"],
    "rugby": ["rugby juego", "rugby"],
    "estadio": ["estadio futbol", "estadio"],
    "esqui": ["esqui nieve", "esquiar"],
    "patin": ["patines patinaje", "patinar"],
    "tabla": ["surf tabla", "surfing"],
    "trofeo": ["trofeo", "trofeo copa"],
  },
};

export async function readCatalog() {
  const txt = await fs.readFile(path.resolve("lib/content.ts"), "utf8");
  const wordsByTopic = {};
  for (const [prefix, topic] of Object.entries(PREFIX_TOPIC)) {
    if (!DOWNLOAD_TOPICS.includes(topic)) continue;
    const blockRe = new RegExp(
      `const ${prefix}\\w*: Item\\[\\] = \\[([\\s\\S]*?)\\];`,
      "g"
    );
    let m;
    const set = new Map();
    while ((m = blockRe.exec(txt)) !== null) {
      const wordRe = /word: "([^"]+)"/g;
      let w;
      while ((w = wordRe.exec(m[1])) !== null) {
        set.set(slugify(w[1]), w[1]);
      }
    }
    wordsByTopic[topic] = set;
  }
  return wordsByTopic;
}

// Correcciones de la auditoría (resultado de Gemini, 2026-08-07):
// slug -> [término_es, término_alt] con términos precisos para foto educativa.
export const FIX_TERMS = {
animales: {
    aguila: ["eagle flying", "águila real"],
    leon: ["lion", "león animal"],
    mariposa: ["butterfly on flower", "mariposa"],
    murcielago: ["flying bat", "murciélago"],
    oso: ["brown bear", "oso pardo"],
    pato: ["duck pond", "pato en el agua"],
    pez: ["clownfish", "pez payaso"],
    flamenco: ["pink flamingo", "flamenco ave"],
    cabra: ["mountain goat standing", "goat animal grass"],
    cocodrilo: ["crocodile close up water", "crocodile reptile"],
    gallina: ["hen chicken coop", "chicken hen"],
    hipopotamo: ["hippopotamus river", "hippo in water"],
    pavo: ["wild turkey bird", "pavo común ave"],
  },
  clima: {
    frio: ["frost grass", "escarcha"],
    granizo: ["hail ice", "granizo hielo"],
    huracan: ["tornado", "huracán satélite"],
    nube: ["white cloud sky", "nube en el cielo"],
    sequia: ["drought cracked earth", "sequía"],
    sol: ["sun rising", "sol amaneciendo"],
  },
  colores: {
    azul: ["blue sky", "cielo azul"],
    beige: ["beige fabric", "tela beige"],
    blanco: ["white wall", "pared blanca"],
    dorado: ["golden ornament", "dorado"],
    esmeralda: ["green crystal gemstone", "cristal esmeralda"],
    gris: ["grey stone texture", "gris pared"],
    lila: ["lilac flowers", "flores lilas"],
    marron: ["brown wood", "marrón madera"],
    morado: ["purple flower", "flor morada"],
    naranja: ["orange fruit", "naranja fruta"],
    negro: ["black cat closeup", "gato negro"],
    plateado: ["silver metal", "plateado dorado"],
    rojo: ["red apple", "manzana roja"],
    verde: ["green leaves", "hojas verdes"],
  },
  comidas: {
    pepino: ["cucumber", "pepino verde"],
  },
  deportes: {
    pelota: ["soccer ball", "pelota de futbol"],
  },
  espacio: {
    "fase-lunar": ["moon phases", "fases de la luna"],
    galaxia: ["spiral galaxy", "galaxia espiral"],
    jupiter: ["jupiter planet", "planeta jupiter"],
    neptuno: ["neptune planet", "planeta neptuno"],
    saturno: ["saturn rings planet", "planeta saturno"],
    sol: ["sun", "sol"],
    telescopio: ["telescope observatory", "telescopio telescopio"],
    venus: ["venus planet", "planeta venus"],
  },
  formas: {
    circulo: ["circle shape", "círculo"],
    cono: ["ice cream cone", "cono de helado"],
    corazon: ["red heart plush", "corazón rojo"],
    cruz: ["christian cross", "cruz de madera"],
    cuadrado: ["square shape", "cuadrado"],
    diamante: ["diamond jewel", "diamante"],
    estrella: ["gold star ornament", "estrella dorada"],
    "luna": ["crescent moon night", "luna creciente"],
    ovalo: ["oval shape", "óvalo"],
    pentagono: ["pentagon shape", "pentágono"],
    prisma: ["prism glass triangle", "prisma de cristal"],
    rectangulo: ["rectangle shape", "rectángulo"],
    rombo: ["rhombus symbol", "rombo figura"],
  },
  lectura: {
    a: ["letter a alphabet", "letra A"],
    e: ["letter e alphabet", "letra E"],
    i: ["letter i isolated", "letra I"],
    u: ["letter u typography", "letra U"],
    "el-gato-come-pescado": ["cat eating fish", "gato pescado"],
    escuela: ["school building", "escuela edificio"],
    "los-planetas-giran-al-sol": ["solar system planets", "sistema solar"],
    "me-gusta-pintar-un-arcoiris": ["child painting rainbow", "niño pintando"],
    nido: ["bird nest eggs", "nido de pájaro"],
    pan: ["bread baguette", "pan barra"],
    papa: ["father and son", "papá hijo"],
    sol: ["sun bright sky", "sol brillante"],
    "voy-a-la-escuela-en-tren": ["children train station", "estación tren"],
  },
  musica: {
    director: ["orchestra conductor", "director orquesta"],
    escala: ["piano key scale", "escala piano"],
    notas: ["sheet music notes", "notas musicales"],
    rock: ["rock band concert", "banda rock"],
    salsa: ["dancing salsa couple", "bailando salsa"],
  },
  naturaleza: {
    arbol: ["tall tree field", "árbol grande"],
    "arrecife-de-coral": ["colorful coral reef", "arrecife coral"],
    "ciclo-del-agua": ["water cycle diagram", "ciclo hidrológico"],
    huerto: ["vegetable garden", "huerto verduras"],
    reciclaje: ["recycling bins", "reciclaje"],
    rio: ["river in the mountains", "río montañas"],
    selva: ["dense rainforest", "selva frondosa"],
  },
  profesiones: {
    arquitecto: ["architect blueprints", "arquitecto planos"],
    bombero: ["firefighter rescue", "bombero héroe"],
    cocinero: ["chef cooking", "cocinero cocina"],
    directora: ["film director camera", "directora cine"],
    granjero: ["farmer fields", "granjero campo"],
    ingeniera: ["woman engineer", "ingeniera mujer"],
    musica: ["musician playing", "música músico"],
    panadero: ["baker kneading dough", "panadero amasando"],
    veterinaria: ["veterinarian dog", "veterinaria perro"],
  },
  transportes: {
    auto: ["sedan", "coche"],
    avion: ["passenger airplane", "avión pasajeros"],
    moto: ["motorcycle", "motocicleta"],
    bicicleta: ["bicycle person cycling", "bicicleta"],
  },
  vocabulario: {
    abuelita: ["grandmother portrait", "abuela retrato"],
    avion: ["passenger airplane", "avión pasajeros"],
    bicicleta: ["bicycle simple bike", "bicicleta"],
    bano: ["bathroom", "baño lavabo"],
    boca: ["smiling lips", "boca labios"],
    camisa: ["button shirt", "camisa botones"],
    hermano: ["brother sibling", "hermano niños"],
    leche: ["milk glass", "vaso leche"],
    manos: ["hands open palms", "manos abiertas"],
    mesa: ["dining table", "mesa de comedor"],
    naranja: ["orange fruit", "naranja fruta"],
    orejas: ["side profile ear", "oreja perfil"],
    pan: ["whole grain bread", "pan integral"],
    pies: ["feet walking", "pies persona"],
    puerta: ["wooden door", "puerta madera"],
    refrigerador: ["open refrigerator", "refrigerador abierto"],
  },
};

/** Términos de búsqueda para un slug, en orden de preferencia (español y alt). */
export function searchTerms(topic, slug) {
  const fix = FIX_TERMS?.[topic]?.[slug];
  if (fix) return fix;
  const over = OVERRIDES?.[topic]?.[slug];
  const terms = [];
  if (over) terms.push(...over);
  return terms.length ? terms : [slug];
}

/** Conceptos que solo se representan bien con ilustraciones (diagramas/formas). */
const ILLUSTRATION_ONLY = new Set([
  "naturaleza/ciclo-del-agua",
  "formas/rombo",
  "musica/escala",
  "naturaleza/cadena-alimentaria",
]);

export function imageType(topic, slug) {
  return ILLUSTRATION_ONLY.has(`${topic}/${slug}`) ? "illustration" : "photo";
}

export const OUT_DIR = path.resolve("public/images");