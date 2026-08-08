import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("public", { recursive: true });

const FOX = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
  <path d="M120 150 q40 5 55 -28 q12 -26 -12 -30 q-20 -2 -28 18 q-8 20 -15 40z" fill="#FFB877"/>
  <path d="M152 102 q22 -6 20 -26 q-14 -2 -24 10 q6 10 4 16z" fill="#FFF8F1" opacity="0.9"/>
  <path d="M45 32 L55 88 L20 74 Z" fill="#E86A33"/>
  <path d="M46 48 L50 74 L30 68 Z" fill="#FFB9A8"/>
  <path d="M155 32 L145 88 L180 74 Z" fill="#E86A33"/>
  <path d="M154 48 L150 74 L170 68 Z" fill="#FFB9A8"/>
  <path d="M40 60 Q100 52 160 60 Q168 120 150 138 Q100 160 50 138 Q32 120 40 60Z" fill="#FF8A42"/>
  <path d="M58 70 Q100 62 142 70 Q148 116 138 130 Q100 148 62 130 Q52 116 58 70Z" fill="#FFF4E3"/>
  <ellipse cx="70" cy="120" rx="14" ry="9" fill="#FFC2A8" opacity="0.8"/>
  <ellipse cx="130" cy="120" rx="14" ry="9" fill="#FFC2A8" opacity="0.8"/>
  <circle cx="82" cy="82" r="7" fill="#3A3A55"/>
  <circle cx="118" cy="82" r="7" fill="#3A3A55"/>
  <circle cx="84" cy="80" r="2.2" fill="#fff"/>
  <circle cx="120" cy="80" r="2.2" fill="#fff"/>
  <ellipse cx="100" cy="98" rx="11" ry="8" fill="#E86A33"/>
  <path d="M102 98 q3 4 0 7 q-3 3 -6 0 q-3 -3 0 -7z" fill="#3A3A55"/>
  <path d="M92 104 q8 6 16 0" stroke="#3A3A55" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
</svg>
`;

// Icono cuadrado sobre fondo crema (safe-zone = 80% central).
function iconSvg(size) {
  const margin = size * 0.1;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#FFF8F1"/>
  <g transform="translate(${margin} ${margin}) scale(${(size - margin * 2) / 200})">
    ${FOX}
  </g>
</svg>
`;
}

const sizes = [192, 512];
for (const s of sizes) {
  const buf = await sharp(Buffer.from(iconSvg(s))).png().toBuffer();
  await sharp(buf).toFile(`public/icon-${s}.png`);
}

// Maskable: fondo ocupa toda la pantalla; zorro al 60% central.
for (const s of sizes) {
  const box = s * 0.6;
  const off = s * 0.2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#FFF8F1"/>
  <g transform="translate(${off} ${off}) scale(${box / 200})">
    ${FOX}
  </g>
</svg>
`;
  await sharp(Buffer.from(svg)).png().toBuffer().then((b) =>
    sharp(b).toFile(`public/icon-maskable-${s}.png`)
  );
}

// apple-touch-icon 180
{
  const size = 180;
  const margin = size * 0.1;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FFF8F1"/>
  <g transform="translate(${margin} ${margin}) scale(${(size - margin * 2) / 200})">
    ${FOX}
  </g>
</svg>
`;
  await sharp(Buffer.from(svg)).png().toBuffer().then((b) =>
    sharp(b).toFile("public/apple-touch-icon.png")
  );
}

// favicon.svg
writeFileSync("public/favicon.svg", iconSvg(64));

console.log("Iconos generados en public/");