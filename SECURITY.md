# Política de Seguridad

## Claves y secretos

- Nunca se suben `.env`, `.env.local` ni ninguna clave al repositorio.
- Solo el servidor tiene las claves de IA (variables de entorno en Vercel): `AI_API_KEY`, `AI_STT_*`, `AI_VISION_MODEL`.
- `GEMINI_API_KEY` se usa únicamente para la auditoría local de imágenes (`scripts/verify-images.mjs`) y no se sube.
- `apis-banco-imagenes.txt` (claves de bancos de imágenes) está excluida del repo vía `.gitignore`.

## Protecciones de la app infantil

| Riesgo | Mitigación |
|---|---|
| Datos personales | Tino nunca pide nombre completo, dirección ni información privada (regla de sistema) |
| Contenido no apto | Doble moderación: filtro por palabras + revisión con modelo (`/api/moderate`) |
| Privacidad de fotos | Las fotos viven solo en memoria del navegador mientras se analizan; `/api/vision` es stateless y no guarda nada |
| Creación de secretos | Las claves de IA nunca viajan al cliente; el teléfono/web llama a `/api/*` del servidor |
| Cuota del proveedor | Mensaje amistoso de Tino cuando el proveedor responde `429` |

## Límites en el servidor

- Imagen en `/api/vision`: máximo **4 MB** y solo `jpeg/png/webp`.
- Texto de chat y visión: truncado a **500 caracteres**.
- Texto de TTS: **600 caracteres**.

## Permisos del dispositivo

La tabla completa por plataforma está en [README.md](./README.md#permisos-por-dispositivo).

## Reportar una vulnerabilidad

Abre un issue en el repositorio (mejor privado) describiendo el problema. Gracias por cuidar la seguridad de los niños.