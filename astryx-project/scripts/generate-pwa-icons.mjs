import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');

const NAVY = '#142b49';
const EMERALD = '#10b981';
const WHITE = '#ffffff';

function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.22 : size * 0.16;
  const inner = size - pad * 2;
  const s = inner / 24;
  const ox = pad;
  const oy = pad + inner * 0.04;

  const cap = `
    <g transform="translate(${ox} ${oy}) scale(${s})">
      <path d="M2 10l10-5 10 5-10 5z" fill="${WHITE}"/>
      <path d="M22 10v6" stroke="${EMERALD}" stroke-width="2" stroke-linecap="round"/>
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" fill="none" stroke="${EMERALD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `;

  const radius = maskable ? size * 0.22 : size * 0.18;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/>
  ${cap}
</svg>`;
}

async function writePng(filename, svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
    background: 'rgba(0,0,0,0)',
  });
  const png = resvg.render().asPng();
  await writeFile(join(outDir, filename), png);
}

await mkdir(outDir, { recursive: true });
await writePng('icon-192.png', iconSvg(192));
await writePng('icon-512.png', iconSvg(512));
await writePng('icon-maskable-512.png', iconSvg(512, { maskable: true }));
await writePng('apple-touch-icon.png', iconSvg(180));
console.log('Wrote PWA icons to public/icons');
