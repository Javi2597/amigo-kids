# Tino el Zorrito 🦊

Asistente de voz amigable para niños de 3 a 12 años: aprende vocabulario, juega y organiza rutinas diarias.

## Plataformas

| Plataforma | Cómo se instala | Micrófono (escuchar al niño) |
|---|---|---|
| **Web / PWA** | Web desplegada en Vercel; instalar desde el navegador (Inicio/Escritorio) | Web Speech API (Chrome, Edge). En iPhone/iOS se desactiva y se escribe por teclado |
| **Android (APK)** | `npm run cap:sync` + `npm run cap:open` (no pasa por Play Store) | Plugin nativo `@capacitor-community/speech-recognition` |
| **iOS (PWA)** | Añadir a pantalla de inicio desde Safari | No hay SpeechRecognition en iOS → se escribe por teclado |
| **Escritorio** | PWA instalada desde Chrome/Edge | Web Speech API |

> Las fotos funcionan en todas las plataformas: se comprimen en el dispositivo y Tino las analiza sin guardarlas.

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

## Desarrollo

```bash
npm install
npm run dev        # web en http://127.0.0.1:3000
```

Variables de entorno: copia `.env.example` a `.env` y pon tu clave de Groq. Cubren chat, TTS, reconocimiento de voz y visión.

## App nativa Android

```bash
npm run typecheck && npm run build
APP_URL=https://tu-dominio.vercel.app npx cap sync android
npx cap open android   # Android Studio / Gradle
```

La app Android es un *shell* que carga la web desplegada (`server.url`), así las
claves de IA quedan solo en el servidor y nunca llegan al teléfono.

## Privacidad

- Las fotos solo viven en memoria mientras se analizan; nunca se guardan en el teléfono ni en el servidor (`/api/vision` es stateless).
- El historial guarda el texto; la foto se muestra como "📷 le mostró una foto a Tino".
- Las claves de IA (`AI_API_KEY`, etc.) solo están en el servidor (Vercel) o en `.env` local, que no se sube al repo.

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