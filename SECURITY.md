# Política de Seguridad

## Claves y secretos

- Nunca se suben `.env`, `.env.local` ni ninguna clave al repositorio.
- Solo el servidor tiene las claves de IA (variables de entorno en Vercel): `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_VISION_MODEL`, `AI_VISION_BASE_URL`, `FALLBACK_AI_*`.
- `GEMINI_API_KEY` se usa únicamente para la auditoría local de imágenes (`scripts/verify-images.mjs`) y no se sube.
- `apis-banco-imagenes.txt` (claves de bancos de imágenes) está excluida del repo vía `.gitignore`.

## Protecciones de la app infantil

| Riesgo | Mitigación |
|---|---|
| Datos personales | Tino nunca pide nombre completo, dirección ni información privada (regla de sistema + clasificador) |
| Contenido no apto | Triple capa **en las dos rutas** (`/api/chat` y `/api/vision`): clasificador determinista que intercepta `danger` antes del proveedor con guion fijo + prompt de sistema + guard determinista de la respuesta (`isReplySafe`) |
| Imágenes no aptas | El texto que acompaña la foto pasa por el clasificador **antes** de subir la imagen. Si pasa, una sola llamada de visión (`/api/vision` → `analyzeImage`) integra el guard: si `safe:false` la ruta responde con guion fijo y la foto NUNCA se describe. Sin costo doble (evita 429 del plan gratuito) |
| Falsos positivos del clasificador | El matching es por palabra completa y las frases ambiguas del español piden contexto (`me toca` = turno de juego, `me pegan` = pegar stickers, `pistola de agua`). Un falso positivo de riesgo alto le cortaría el chat al niño, así que está cubierto por tests (`npm test`) |
| Situaciones de riesgo del menor | Categorías de riesgo alto → guion fijo "hablá con un adulto"; 3 alertas al día → bloqueo suave del chat que solo remueve el padre |
| Privacidad de fotos | Las fotos viven solo en memoria del navegador mientras se analizan; `/api/vision` es stateless |
| Consentimientos de menor | Micrófono y cámara exigen opt-in del adulto en el panel de papás; sin permiso, botones inactivos + modal explicativo |
| Voz natural (TTS) | Apagado por defecto (voz local del navegador). Si se activa, envía el texto a un proveedor externo y se explica en la política de privacidad |
| Creación de secretos | Las claves de IA nunca viajan al cliente; el teléfono/web llama a `/api/*` del servidor |
| Historial familiar | Opcional (opt-in del adulto), SOLO texto, guardado en el dispositivo (sin audio ni fotos) y borrable desde el panel de papás |
| Cuota del proveedor | Mensaje amistoso de Tino cuando el proveedor responde `429` |

## Límites en el servidor

- Imagen en `/api/vision`: máximo **4 MB** y solo `jpeg/png/webp`.
- Texto de chat y visión: truncado a **500 caracteres**.
- Texto de TTS: **600 caracteres**.
- Clasificador de riesgo (`lib/safety.ts`): guion fijo seguro sin llamada al proveedor.
- Guard de respuesta (`isReplySafe`): lista determinista; no gasta llamadas extra.

## Tests de seguridad

```bash
npm test
```

`lib/safety.test.mts` fija el contrato en las dos direcciones: lo que **debe**
interceptarse (autolesión con leetspeak y faltas, violencia en casa, abuso,
inyección de prompt) y lo que **debe pasar** (el habla normal de un niño
jugando). `lib/visionParse.test.mts` verifica que el parseo de la respuesta de
visión sea fail-closed ante cualquier formato inesperado.

## Permisos del dispositivo

La tabla completa por plataforma está en [README.md](./README.md#permisos-por-dispositivo).

## Reportar una vulnerabilidad

Abre un issue en el repositorio (mejor privado) describiendo el problema. Gracias por cuidar la seguridad de los niños.