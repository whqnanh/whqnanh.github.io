const fs = require('fs');
const zlib = require('zlib');

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const decomp = zlib.inflateSync(Buffer.concat(idat));
  const origW = 498, origH = 501;
  const raw = Buffer.alloc(origW * origH * 4);
  for (let y = 0; y < origH; y++) {
    const rowStart = y * (1 + origW * 4);
    for (let i = 0; i < origW * 4; i++) {
      const val = decomp[rowStart + 1 + i];
      const up = y > 0 ? raw[(y - 1) * origW * 4 + i] : 0;
      raw[y * origW * 4 + i] = (val + up) & 0xff;
    }
  }
  return raw;
}

const raw = decodePNG('C:/Users/HOANG ANH/.gemini/antigravity-ide/brain/53a36830-e19f-49b5-b5ff-6e0f9f479400/.user_uploaded/media_1788517122294.png');

// Find centroid
let sumX = 0, sumY = 0, total = 0;
for (let y = 0; y < 501; y++) {
  for (let x = 0; x < 498; x++) {
    const idx = (y * 498 + x) * 4;
    if (raw[idx] < 128) {
      sumX += x; sumY += y; total++;
    }
  }
}
const cx = sumX / total;
const cy = sumY / total;

// Ray cast outwards for contour
const contour = [];
for (let a = 0; a < 360; a += 1.5) {
  const rad = (a * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let r = 85; r >= 0; r -= 0.4) {
    const px = Math.round(cx + cos * r);
    const py = Math.round(cy + sin * r);
    if (px >= 0 && px < 498 && py >= 0 && py < 501) {
      const idx = (py * 498 + px) * 4;
      if (raw[idx] < 128) {
        contour.push([px, py]);
        break;
      }
    }
  }
}

let minX = 999, minY = 999;
for (const [x, y] of contour) {
  if (x < minX) minX = x;
  if (y < minY) minY = y;
}

const w = 32, h = 34;
const scale = 27 / 115;
const pts = contour.map(([x, y]) => {
  const px = Number(((x - minX) * scale + 2).toFixed(2));
  const py = Number(((y - minY) * scale + 2).toFixed(2));
  return [px, py];
});

const polyStr = pts.map(p => p.join(',')).join(' ');

// Generate SVG files
const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <polygon points="${polyStr}" fill="#000000" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`;

const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <polygon points="${polyStr}" fill="#ffffff" stroke="#000000" stroke-width="1.4" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync('assets/cursor-black.svg', svgBlack);
fs.writeFileSync('assets/cursor-white.svg', svgWhite);
fs.writeFileSync('assets/cursor-default.svg', svgBlack);
console.log('✓ Wrote cursor-black.svg, cursor-white.svg, cursor-default.svg');

// Generate 4x super-sampled PNGs
const ss = 4;
const bigW = w * ss;
const bigH = h * ss;

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0] * ss, yi = poly[i][1] * ss;
    const xj = poly[j][0] * ss, yj = poly[j][1] * ss;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const blackBuf = Buffer.alloc(w * h * 4);
const whiteBuf = Buffer.alloc(w * h * 4);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    let hits = 0;
    for (let sy = 0; sy < ss; sy++) {
      for (let sx = 0; sx < ss; sx++) {
        const px = x * ss + sx + 0.5;
        const py = y * ss + sy + 0.5;
        if (pointInPoly(px, py, pts)) {
          hits++;
        }
      }
    }
    const alpha = Math.round((hits / (ss * ss)) * 255);
    const idx = (y * w + x) * 4;

    if (alpha > 0) {
      blackBuf[idx] = 16;
      blackBuf[idx + 1] = 16;
      blackBuf[idx + 2] = 16;
      blackBuf[idx + 3] = alpha;

      whiteBuf[idx] = 255;
      whiteBuf[idx + 1] = 255;
      whiteBuf[idx + 2] = 255;
      whiteBuf[idx + 3] = alpha;
    }
  }
}

// Add crisp 1px stroke around black cursor (white border) and white cursor (black border)
const blackBordered = Buffer.from(blackBuf);
const whiteBordered = Buffer.from(whiteBuf);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;

    // White outline on black cursor
    if (blackBuf[idx + 3] === 0) {
      let maxN = 0;
      for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          maxN = Math.max(maxN, blackBuf[(ny * w + nx) * 4 + 3]);
        }
      }
      if (maxN > 110) {
        blackBordered[idx] = 255;
        blackBordered[idx + 1] = 255;
        blackBordered[idx + 2] = 255;
        blackBordered[idx + 3] = 240;
      }
    }

    // Black outline on white cursor
    if (whiteBuf[idx + 3] === 0) {
      let maxN = 0;
      for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          maxN = Math.max(maxN, whiteBuf[(ny * w + nx) * 4 + 3]);
        }
      }
      if (maxN > 110) {
        whiteBordered[idx] = 0;
        whiteBordered[idx + 1] = 0;
        whiteBordered[idx + 2] = 0;
        whiteBordered[idx + 3] = 240;
      }
    }
  }
}

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

fs.writeFileSync('assets/cursor-black.png', createPNG(w, h, blackBordered));
fs.writeFileSync('assets/cursor-white.png', createPNG(w, h, whiteBordered));
fs.writeFileSync('assets/cursor-default.png', createPNG(w, h, blackBordered));

console.log('✓ Wrote cursor-black.png, cursor-white.png, cursor-default.png');
console.log('All custom cursors based on the uploaded images are ready!');
