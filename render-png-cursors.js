const fs = require('fs');
const zlib = require('zlib');

// Read the polygon points from assets/cursor-black.svg
const svg = fs.readFileSync('assets/cursor-black.svg', 'utf8');
const match = svg.match(/points="([^"]+)"/);
const pts = match[1].trim().split(/\s+/).map(p => {
  const [x, y] = p.split(',').map(Number);
  return [x, y];
});

const w = 32, h = 36;
const ss = 4; // 4x super-sampling for buttery-smooth anti-aliasing
const bigW = w * ss;
const bigH = h * ss;

// Point-in-polygon algorithm
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
      // Solid black cursor
      blackBuf[idx] = 18;
      blackBuf[idx + 1] = 18;
      blackBuf[idx + 2] = 18;
      blackBuf[idx + 3] = alpha;

      // Solid white cursor
      whiteBuf[idx] = 255;
      whiteBuf[idx + 1] = 255;
      whiteBuf[idx + 2] = 255;
      whiteBuf[idx + 3] = alpha;
    }
  }
}

// Add crisp 1px black stroke to white cursor
const whiteOutlined = Buffer.from(whiteBuf);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    if (whiteBuf[idx + 3] === 0) {
      let neighborAlpha = 0;
      for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          neighborAlpha = Math.max(neighborAlpha, whiteBuf[(ny * w + nx) * 4 + 3]);
        }
      }
      if (neighborAlpha > 120) {
        whiteOutlined[idx] = 0;
        whiteOutlined[idx + 1] = 0;
        whiteOutlined[idx + 2] = 0;
        whiteOutlined[idx + 3] = 220;
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
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
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

fs.writeFileSync('assets/cursor-black.png', createPNG(w, h, blackBuf));
fs.writeFileSync('assets/cursor-white.png', createPNG(w, h, whiteOutlined));
console.log('High-precision anti-aliased PNG cursors generated successfully!');
