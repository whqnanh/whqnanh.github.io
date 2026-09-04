const zlib = require('zlib');
const fs = require('fs');

const buf = fs.readFileSync('C:/Users/HOANG ANH/.gemini/antigravity-ide/brain/db391d29-77a3-4559-8d8e-997db353932a/.user_uploaded/media_1788424346521.png');
let pos = 8, idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}
const decomp = zlib.inflateSync(Buffer.concat(idat));
const origW = 235, origH = 267;
const raw = Buffer.alloc(origW * origH * 4);
for (let y = 0; y < origH; y++) {
  const rowStart = y * (1 + origW * 4);
  for (let i = 0; i < origW * 4; i++) {
    const val = decomp[rowStart + 1 + i];
    const up = y > 0 ? raw[(y - 1) * origW * 4 + i] : 0;
    raw[y * origW * 4 + i] = (val + up) & 0xff;
  }
}

// Flood fill from (160, 180) which is inside component 3
const isComp3 = new Uint8Array(origW * origH);
const queue = [[160, 180]];
isComp3[180 * origW + 160] = 1;

while (queue.length > 0) {
  const [cx, cy] = queue.pop();
  for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
    const nx = cx + dx, ny = cy + dy;
    if (nx >= 0 && nx < origW && ny >= 0 && ny < origH && isComp3[ny * origW + nx] === 0) {
      const idx = (ny * origW + nx) * 4;
      if (raw[idx] < 80) {
        isComp3[ny * origW + nx] = 1;
        queue.push([nx, ny]);
      }
    }
  }
}

// Find boundary pixels of isComp3
// A pixel is on the outer boundary if it is in isComp3 and has a 4-neighbor not in isComp3
let startX = -1, startY = 999;
for (let y = 0; y < origH; y++) {
  for (let x = 0; x < origW; x++) {
    if (isComp3[y * origW + x] === 1) {
      if (y < startY) {
        startY = y;
        startX = x;
      }
    }
  }
}
console.log('Topmost arrow pixel:', startX, startY);

// Radial sorting around centroid or Marching Squares
let sumX = 0, sumY = 0, total = 0;
for (let y = 0; y < origH; y++) {
  for (let x = 0; x < origW; x++) {
    if (isComp3[y * origW + x] === 1) {
      sumX += x; sumY += y; total++;
    }
  }
}
const cx = sumX / total;
const cy = sumY / total;

// Sample outer boundary at 180 angles
const contour = [];
for (let a = 0; a < 360; a += 2) {
  const rad = (a * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let r = 90; r >= 0; r -= 0.5) {
    const px = Math.round(cx + cos * r);
    const py = Math.round(cy + sin * r);
    if (px >= 0 && px < origW && py >= 0 && py < origH && isComp3[py * origW + px] === 1) {
      contour.push([px, py]);
      break;
    }
  }
}

console.log('Contour points:', contour.length);

// Normalize so tip is at (2, 2)
// Tip is at (startX, startY) = (119, 123)
const s = 0.26;
const points = contour.map(([x, y]) => {
  const px = Number(((x - startX) * s + 2).toFixed(2));
  const py = Number(((y - startY) * s + 2).toFixed(2));
  return `${px},${py}`;
}).join(' ');

// Generate SVG: Black cursor with clean rounded corners
const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36">
  <polygon points="${points}" fill="#000000" stroke="#ffffff" stroke-width="1" stroke-linejoin="round"/>
</svg>`;

// Generate SVG: White cursor with crisp 1.4px black outline
const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36">
  <polygon points="${points}" fill="#ffffff" stroke="#000000" stroke-width="1.4" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync('assets/cursor-black.svg', svgBlack);
fs.writeFileSync('assets/cursor-white.svg', svgWhite);
console.log('SVG files created successfully!');
