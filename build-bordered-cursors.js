const fs = require('fs');
const zlib = require('zlib');

// Read polygon points
const svg = fs.readFileSync('assets/cursor-black.svg', 'utf8');
const match = svg.match(/points="([^"]+)"/);
const ptsStr = match[1].trim();
const pts = ptsStr.split(/\s+/).map(p => {
  const [x, y] = p.split(',').map(Number);
  return [x, y];
});

const w = 28, h = 30;

// 1. Generate Razor-Sharp SVGs with paint-order="stroke fill"
// White cursor: crisp black border (stroke-width: 2.2 with paint-order gives ~1.1px clean outer border)
const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="geometricPrecision">
  <polygon points="${ptsStr}" fill="#ffffff" stroke="#000000" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"/>
</svg>`;

// Black cursor: pure solid black with NO border ("đen thì khỏi viền")
const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="geometricPrecision">
  <polygon points="${ptsStr}" fill="#000000"/>
</svg>`;

fs.writeFileSync('assets/cursor-white.svg', svgWhite);
fs.writeFileSync('assets/cursor-black.svg', svgBlack);
fs.writeFileSync('assets/cursor-default.svg', svgBlack);

console.log('✓ Wrote razor-sharp SVGs with paint-order="stroke fill"');

// 2. High-Precision Super-Sampled (4x) Subpixel PNG Renderer
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

// Compute high-resolution binary mask on 4x grid
const fillMask = Buffer.alloc(bigW * bigH);
for (let by = 0; by < bigH; by++) {
  for (let bx = 0; bx < bigW; bx++) {
    if (pointInPoly(bx + 0.5, by + 0.5, pts)) {
      fillMask[by * bigW + bx] = 1;
    }
  }
}

// Compute Euclidean distance transform to fill mask on 4x grid
// for subpixel-accurate border dilation
function renderCursorPNG(fillColor, strokeColor, strokeRadiusSubpixels) {
  const r2 = strokeRadiusSubpixels * strokeRadiusSubpixels;
  const radiusInt = Math.ceil(strokeRadiusSubpixels);

  // Dilate fill mask
  const strokeMask = Buffer.alloc(bigW * bigH);
  for (let by = 0; by < bigH; by++) {
    for (let bx = 0; bx < bigW; bx++) {
      if (fillMask[by * bigW + bx] === 1) {
        strokeMask[by * bigW + bx] = 1;
        continue;
      }
      let found = false;
      for (let dy = -radiusInt; dy <= radiusInt && !found; dy++) {
        const ny = by + dy;
        if (ny < 0 || ny >= bigH) continue;
        for (let dx = -radiusInt; dx <= radiusInt; dx++) {
          if (dx * dx + dy * dy <= r2) {
            const nx = bx + dx;
            if (nx >= 0 && nx < bigW && fillMask[ny * bigW + nx] === 1) {
              strokeMask[by * bigW + bx] = 2; // stroke area
              found = true;
              break;
            }
          }
        }
      }
    }
  }

  // Downsample 4x4 subpixel blocks to 1px with anti-aliasing
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const bx = x * ss + sx;
          const by = y * ss + sy;
          const type = strokeMask[by * bigW + bx];
          if (type === 1) {
            // Fill pixel
            rSum += fillColor[0];
            gSum += fillColor[1];
            bSum += fillColor[2];
            aSum += 255;
          } else if (type === 2) {
            // Stroke pixel
            rSum += strokeColor[0];
            gSum += strokeColor[1];
            bSum += strokeColor[2];
            aSum += 255;
          }
        }
      }
      const totalSubpixels = ss * ss;
      const alpha = Math.round(aSum / totalSubpixels);
      const outIdx = (y * w + x) * 4;
      if (alpha > 0) {
        rgba[outIdx] = Math.round(rSum / totalSubpixels);
        rgba[outIdx + 1] = Math.round(gSum / totalSubpixels);
        rgba[outIdx + 2] = Math.round(bSum / totalSubpixels);
        rgba[outIdx + 3] = alpha;
      }
    }
  }

  return createPNG(w, h, rgba);
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

// Render White Cursor: Fill #FFFFFF, Stroke #000000 (1.2px = 4.8 subpixels for clear sharp definition)
const whitePng = renderCursorPNG([255, 255, 255], [0, 0, 0], 4.8);

// Render Black Cursor: Fill #000000, NO border (stroke radius 0)
const blackPng = renderCursorPNG([0, 0, 0], [0, 0, 0], 0);

fs.writeFileSync('assets/cursor-white.png', whitePng);
fs.writeFileSync('assets/cursor-black.png', blackPng);
fs.writeFileSync('assets/cursor-default.png', blackPng);

console.log('✓ Wrote ultra-crisp subpixel PNGs: cursor-white.png & cursor-black.png!');
