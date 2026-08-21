# Amigo Kids 🦊

Asistente de voz amigable para niños de 3 a 12 años (con la mascota Tino el Zorrito): aprende vocabulario, juega y organiza rutinas diarias.

- **Web / PWA:** desplegada en Vercel (ver [Plataformas](#plataformas)).
- [Política de privacidad](./app/politica-privacidad/page.tsx), también enlazada desde el panel de papás.

## Estrategias por edad

Todo se adapta con la edad de cada perfil (panel de papás → agregar perfiles):

| Edad | Qué activa |
|---|---|
| **3–6** | Recompensas inmediatas: estrellas animadas, sonidos y celebraciones al acertar, completar tarjetas o rutinas. Botones grandes, voz y repetición. |
| **7–9** | Gamificación: misiones diarias, medallas, barras de progreso por tema, historias interactivas (elige tu camino) y retos de lógica (secuencias y clasificación). |
| **10–12** | Retos contra el tiempo, logros desbloqueables, proyectos de investigación y creación, y tabla de la familia opcional (local, sin presión, activable por papás). |
| **Todas** | Tino sugiere temas a repasar o explorar según el desempeño y adapta el chat al nivel. |

El progreso (estrellas, medallas, logros, misiones, desempeño) y los perfiles se guardan **solo en el dispositivo** (localStorage), nunca en el servidor. Cada niño de la familia tiene su propio progreso.

## Empezar / Desarrollo

```bash
npm install
npm run dev        # web en http://127.0.0.1:3000
```

Variables de entorno: copia `.env.example` a `.env` y pon tu clave de **Groq** (`AI_API_KEY`). Cubren **chat y visión de fotos**; el resto funciona sin claves:

- **Reconocimiento de voz:** usa las APIs del dispositivo (Web Speech API en el navegador, plugin de Capacitor en Android), sin clave de IA.
- **Voz (TTS):** por defecto síntesis local del dispositivo; la "voz natural" va al `GET /api/tts` del servidor (sin clave).
- **Proveedor de respaldo (opcional):** si configurás `FALLBACK_AI_API_KEY` (recomendado: Gemini de Google AI Studio, gratis), cuando Groq agota su límite diario el chat pasa automáticamente al respaldo y, si también falla, Tino responde con mini-juegos locales desde el contenido de la app (sin IA). Las fotos **solo** van a Groq, nunca a un tercer proveedor.

Scripts útiles:

```bash
npm run typecheck   # chequeo de tipos
npm test            # tests del clasificador de seguridad y del parseo de visión
npm run build       # build de producción
npm run images      # descargar ilustraciones de las flashcards
npm run icons       # regenerar iconos de la PWA
```

## Plataformas

| Plataforma | Cómo se instala | Micrófono (escuchar al niño) |
|---|---|---|
| **Web / PWA** | Web desplegada en Vercel; instalar desde el navegador (Inicio/Escritorio) | Web Speech API (Chrome, Edge). En iPhone/iOS se desactiva y se escribe por teclado |
| **Android (APK)** | `npm run cap:sync` + `npm run cap:open` (no pasa por Play Store) | Plugin nativo `@capacitor-community/speech-recognition` |
| **iOS (PWA)** | Añadir a pantalla de inicio desde Safari | No hay SpeechRecognition en iOS → se escribe por teclado |
| **Escritorio** | PWA instalada desde Chrome/Edge | Web Speech API |

> Las fotos funcionan en todas las plataformas: se comprimen en el dispositivo y Tino las analiza sin guardarlas.

## App nativa Android

```bash
npm run typecheck && npm run build
APP_URL=https://tu-dominio.vercel.app npx cap sync android
npx cap open android   # Android Studio / Gradle
```

La app Android es un *shell* que carga la web desplegada (`server.url`), así las
claves de IA quedan solo en el servidor y nunca llegan al teléfono.

## Permisos por dispositivo

### Web / PWA

| Permiso | Cuándo pide | Quién lo pide |
|---|---|---|
| Micrófono | Al tocar el botón de hablar | El navegador |
| Cámara / Galería | Al enviar una foto | Selector nativo del navegador (`<input capture>`) |

### Android (Capacitor)
Declarados en `android/app/src/main/AndroidManifest.xml`:

| Permiso | Motivo |
|---|---|
| `RECORD_AUDIO` | Reconocimiento de voz del niño |
| `CAMERA` | Tomar / subir fotos (PhotoButton) |
| `READ_MEDIA_IMAGES` (API 33+) | Leer la galería de fotos |
| `READ_EXTERNAL_STORAGE` (hasta API 32) | Leer la galería en versiones anteriores |

### iOS (actualmente solo PWA)
No necesita permisos extra en Safari. Si algún día se genera la app nativa (`npx cap add ios`), declarar en `Info.plist`: `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`.

## Seguridad y privacidad

- **Moderación real**: `lib/safety.ts` clasifica cada mensaje de **las dos rutas** (`/api/chat` y `/api/vision`): riesgo alto → guion fijo seguro, sin que el LLM responda libremente y sin que la foto llegue a subirse. La respuesta de Tino pasa por un guard antes de hablar, también en visión. Además `/api/vision` integra una pasada de seguridad en la misma llamada y nunca describe fotos no aptas (una sola llamada por foto evita caer en 429 del plan gratuito).
- **Sin falsos positivos que rompan el juego**: el clasificador compara palabras completas y pide contexto en las frases ambiguas del español ("me toca" es el turno del juego, "me pegan los stickers" es una manualidad, "pistola de agua" es un juguete). Está cubierto por `npm test` en las dos direcciones: lo que debe interceptar y lo que debe dejar pasar.
- **Espacios de riesgo**: 3 alertas de riesgo alto en un día → pausa automática del chat que solo puede quitar un adulto.
- **Consentimientos**: micrófono y cámara son opt-in del adulto en el panel de papás; sin permiso los botones quedan inactivos.
- Las fotos solo viven en memoria mientras se analizan; nunca se guardan en el teléfono ni en el servidor (`/api/vision` es stateless).
- Historial familiar opcional (solo texto, sin audio ni fotos) se guarda en el dispositivo y se puede borrar desde `app/padres/historial`.
- Voz: por defecto se usa la síntesis local del dispositivo (sin envío del texto). La "voz natural" envía texto a un proveedor externo y lo explica la [Política de privacidad](./app/politica-privacidad/page.tsx), también enlazada desde el panel de papás.
- Las claves de IA (`AI_API_KEY`, `AI_VISION_MODEL`, `FALLBACK_AI_API_KEY`, etc.) solo están en el servidor (Vercel) o en `.env` local, que no se sube al repo.
- Tino acompaña momentos de juego y aprendizaje; **no reemplaza la supervisión de un adulto** (ver política de privacidad).

## Versiones

Se usa **semantic-release** con Conventional Commits. Al llegar a `main`, el
workflow `.github/workflows/release.yml` genera la etiqueta `vX.Y.Z` y una Release automáticamente:

```bash
git commit -m "feat: nueva palabra"   # versión menor
git commit -m "fix: correcto"          # versión patch
git commit -m "feat!: cambio rompe"    # versión mayor
```

---

Hecho con ❤️ para los niños.