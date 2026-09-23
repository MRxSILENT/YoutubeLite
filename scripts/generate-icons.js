import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// 1. Create SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1A1A" />
      <stop offset="100%" stop-color="#CC0000" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>
  <!-- Background with subtle corner rounding -->
  <rect width="512" height="512" rx="115" fill="url(#grad)" />
  <!-- White Play Button -->
  <path d="M210 160 L360 256 L210 352 Z" fill="#FFFFFF" filter="url(#shadow)" />
  <!-- "Go / Lite" badge inside -->
  <g transform="translate(340, 360)">
    <rect x="-10" y="-12" width="90" height="42" rx="10" fill="#000000" opacity="0.65" />
    <text x="35" y="16" fill="#00E676" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" text-anchor="middle">LITE</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

// Helper to write valid PNG using Node's built-in zlib
function createPng(width, height, isMaskable = false) {
  // RGBA buffer
  const stride = width * 4 + 1; // 1 filter byte per row
  const rawData = Buffer.alloc(stride * height);

  const cx = width / 2;
  const cy = height / 2;
  const rx = isMaskable ? width * 0.44 : width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center for rounded rect
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const cornerR = width * 0.22;
      const innerW = cx - cornerR;
      const innerH = cy - cornerR;

      let inBody = false;
      if (isMaskable) {
        // full bleed for maskable safe zone
        inBody = true;
      } else {
        if (dx <= innerW && dy <= cy - 10) inBody = true;
        else if (dy <= innerH && dx <= cx - 10) inBody = true;
        else if (dx > innerW && dy > innerH) {
          const cdx = dx - innerW;
          const cdy = dy - innerH;
          if (cdx * cdx + cdy * cdy <= cornerR * cornerR) inBody = true;
        }
      }

      // Check play triangle
      // Triangle coords roughly: (0.42 * width, 0.32 * height) to (0.42 * width, 0.68 * height) to (0.68 * width, 0.50 * height)
      const tx1 = width * 0.42;
      const ty1 = height * 0.32;
      const ty2 = height * 0.68;
      const tx3 = width * 0.68;
      const ty3 = height * 0.5;

      // Barycentric / point-in-triangle check
      let inTriangle = false;
      if (x >= tx1 && x <= tx3) {
        const progress = (x - tx1) / (tx3 - tx1);
        const topY = ty1 + progress * (ty3 - ty1);
        const botY = ty2 - progress * (ty2 - ty3);
        if (y >= topY && y <= botY) {
          inTriangle = true;
        }
      }

      if (inTriangle) {
        rawData[pixelOffset] = 255;     // R
        rawData[pixelOffset + 1] = 255; // G
        rawData[pixelOffset + 2] = 255; // B
        rawData[pixelOffset + 3] = 255; // A
      } else if (inBody) {
        // Red background (#FF0000 to #D00000)
        const factor = y / height;
        rawData[pixelOffset] = Math.round(255 - factor * 35); // R
        rawData[pixelOffset + 1] = Math.round(15 * (1 - factor)); // G
        rawData[pixelOffset + 2] = Math.round(15 * (1 - factor)); // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        // Transparent
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  // Deflate IDAT data
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crcData = Buffer.concat([Buffer.from(type), data]);
  const crc = calculateCrc32(crcData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Precomputed CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
console.log('Icons successfully created in /public');
