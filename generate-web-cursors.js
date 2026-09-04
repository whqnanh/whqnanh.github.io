const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const srcPath = 'C:/Users/HOANG ANH/.gemini/antigravity-ide/brain/53a36830-e19f-49b5-b5ff-6e0f9f479400/.user_uploaded/media_1788516672761.png';
const buf = fs.readFileSync(srcPath);

let pos = 8, idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}
const decomp = zlib.inflateSync(Buffer.concat(idat));
const origW = 1024, origH = 682;
const raw = Buffer.alloc(origW * origH * 4);
for (let y = 0; y < origH; y++) {
  const rowStart = y * (1 + origW * 4);
  for (let i = 0; i < origW * 4; i++) {
    const val = decomp[rowStart + 1 + i];
    const up = y > 0 ? raw[(y - 1) * origW * 4 + i] : 0;
    raw[y * origW * 4 + i] = (val + up) & 0xff;
  }
}

// PNG Builder
function createPNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    rgba.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(scanlines);

  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc32(b) {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff);
  }
  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    chunk.writeInt32BE(crc32(chunk.slice(4, 8 + len)), 8 + len);
    return chunk;
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Function to extract black cursor with anti-aliasing and 1.5px white border
function extractCursor(minX, minY, maxX, maxY, targetW, targetH, align = 'center') {
  const pad = 2;
  const srcBoxX = minX - pad;
  const srcBoxY = minY - pad;
  const srcBoxW = (maxX - minX + 1) + pad * 2;
  const srcBoxH = (maxY - minY + 1) + pad * 2;

  // Extract alpha mask (dark pixels = foreground)
  const srcAlpha = new Float32Array(srcBoxW * srcBoxH);
  for (let sy = 0; sy < srcBoxH; sy++) {
    for (let sx = 0; sx < srcBoxW; sx++) {
      const px = srcBoxX + sx;
      const py = srcBoxY + sy;
      if (px >= 0 && px < origW && py >= 0 && py < origH) {
        const idx = (py * origW + px) * 4;
        const r = raw[idx], g = raw[idx+1], b = raw[idx+2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Background luminance is ~230
        const a = (230 - lum) / (230 - 32);
        srcAlpha[sy * srcBoxW + sx] = Math.max(0, Math.min(1, a));
      }
    }
  }

  // Downsample to target size with bilinear interpolation
  const outBuf = Buffer.alloc(targetW * targetH * 4);
  const maxDim = Math.max(targetW, targetH);
  const scale = Math.min((targetW - 5) / srcBoxW, (targetH - 5) / srcBoxH);
  const dstW = Math.round(srcBoxW * scale);
  const dstH = Math.round(srcBoxH * scale);

  let offX = 2;
  let offY = 2;
  if (align === 'center') {
    offX = Math.round((targetW - dstW) / 2);
    offY = Math.round((targetH - dstH) / 2);
  } else if (align === 'top-left') {
    offX = 2;
    offY = 2;
  } else if (align === 'top-center') {
    offX = Math.round((targetW - dstW) / 2);
    offY = 2;
  }

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const srcX = (dx / scale);
      const srcY = (dy / scale);
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = Math.min(srcBoxW - 1, x0 + 1);
      const y1 = Math.min(srcBoxH - 1, y0 + 1);
      const wx = srcX - x0;
      const wy = srcY - y0;

      const a00 = srcAlpha[y0 * srcBoxW + x0] || 0;
      const a10 = srcAlpha[y0 * srcBoxW + x1] || 0;
      const a01 = srcAlpha[y1 * srcBoxW + x0] || 0;
      const a11 = srcAlpha[y1 * srcBoxW + x1] || 0;
      const a = (1 - wy) * ((1 - wx) * a00 + wx * a10) + wy * ((1 - wx) * a01 + wx * a11);

      const outX = offX + dx;
      const outY = offY + dy;
      if (outX >= 0 && outX < targetW && outY >= 0 && outY < targetH) {
        const outIdx = (outY * targetW + outX) * 4;
        const alphaByte = Math.round(a * 255);
        if (alphaByte > 12) {
          outBuf[outIdx] = 18;
          outBuf[outIdx + 1] = 18;
          outBuf[outIdx + 2] = 18;
          outBuf[outIdx + 3] = alphaByte;
        }
      }
    }
  }

  // Add crisp 1px pure white outer border for high contrast
  const bordered = Buffer.from(outBuf);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const idx = (y * targetW + x) * 4;
      if (outBuf[idx + 3] < 120) {
        let maxNeighbor = 0;
        for (const [ox, oy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
          const nx = x + ox, ny = y + oy;
          if (nx >= 0 && nx < targetW && ny >= 0 && ny < targetH) {
            maxNeighbor = Math.max(maxNeighbor, outBuf[(ny * targetW + nx) * 4 + 3]);
          }
        }
        if (maxNeighbor > 90) {
          bordered[idx] = 255;
          bordered[idx + 1] = 255;
          bordered[idx + 2] = 255;
          bordered[idx + 3] = Math.round(maxNeighbor * 0.95);
        }
      }
    }
  }

  return { png: createPNG(targetW, targetH, bordered), rawRgba: bordered, width: targetW, height: targetH };
}

// Function to generate pure SVG data URI and SVG file from RGBA
function generateSVGFromPNG(pngBuffer, width, height) {
  const b64 = pngBuffer.toString('base64');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" href="data:image/png;base64,${b64}"/>
</svg>`;
}

const cursors = [
  { name: 'cursor-default', box: [57, 131, 113, 191], w: 32, h: 36, align: 'top-left', hot: [2, 2], desc: 'Normal Select' },
  { name: 'cursor-pointer', box: [303, 119, 359, 186], w: 32, h: 36, align: 'top-center', hot: [11, 2], desc: 'Link / Hover' },
  { name: 'cursor-click', box: [554, 128, 604, 188], w: 32, h: 36, align: 'top-center', hot: [11, 4], desc: 'Click (Pressed)' },
  { name: 'cursor-text', box: [816, 133, 844, 184], w: 26, h: 34, align: 'center', hot: [13, 17], desc: 'Text Select (I-beam)' },
  { name: 'cursor-move', box: [45, 337, 106, 399], w: 34, h: 34, align: 'center', hot: [17, 17], desc: 'Move / Drag 4-way' },
  { name: 'cursor-not-allowed', box: [59, 534, 113, 588], w: 32, h: 32, align: 'center', hot: [16, 16], desc: 'Not Allowed' },
  { name: 'cursor-help', box: [792, 531, 858, 587], w: 36, h: 36, align: 'top-left', hot: [2, 2], desc: 'Help / Info' },
  { name: 'cursor-crosshair', box: [553, 534, 605, 588], w: 32, h: 32, align: 'center', hot: [16, 16], desc: 'Precision Select (+)' }
];

console.log('Generating website cursor assets from master design...');

for (const c of cursors) {
  const res = extractCursor(c.box[0], c.box[1], c.box[2], c.box[3], c.w, c.h, c.align);
  fs.writeFileSync(`assets/${c.name}.png`, res.png);
  const svg = generateSVGFromPNG(res.png, c.w, c.h);
  fs.writeFileSync(`assets/${c.name}.svg`, svg);
  console.log(`✓ Generated ${c.name}.png & .svg (${c.w}x${c.h}, Hotspot: [${c.hot.join(', ')}]) - ${c.desc}`);
}

// Also update legacy cursor-black.svg and cursor-black.png to match cursor-default
fs.copyFileSync('assets/cursor-default.png', 'assets/cursor-black.png');
fs.copyFileSync('assets/cursor-default.svg', 'assets/cursor-black.svg');

console.log('All cursors generated successfully into assets/ directory!');
