const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/HOANG ANH/.gemini/antigravity-ide/brain/53a36830-e19f-49b5-b5ff-6e0f9f479400/.user_uploaded/media_1788517122294.png');
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

// Bounding box of original arrow
// minX: 195, maxX: 304, minY: 189, maxY: 304
const outW = 28, outH = 30;
const scale = 23.5 / 110;

// Grid for contour tracing
const grid = Buffer.alloc(origW * origH);
for (let i = 0; i < origW * origH; i++) {
  grid[i] = raw[i * 4] < 128 ? 1 : 0;
}

let startX = -1, startY = -1;
for (let y = 0; y < origH && startX === -1; y++) {
  for (let x = 0; x < origW; x++) {
    if (grid[y * origW + x] === 1) {
      startX = x;
      startY = y;
      break;
    }
  }
}

const dx = [1, 1, 0, -1, -1, -1, 0, 1];
const dy = [0, 1, 1, 1, 0, -1, -1, -1];

const contour = [];
let currX = startX, currY = startY;
let dir = 0;
contour.push([currX, currY]);

let maxSteps = 10000;
while (maxSteps-- > 0) {
  let checkDir = (dir + 5) % 8;
  let found = false;
  for (let i = 0; i < 8; i++) {
    const d = (checkDir + i) % 8;
    const nx = currX + dx[d];
    const ny = currY + dy[d];
    if (nx >= 0 && nx < origW && ny >= 0 && ny < origH && grid[ny * origW + nx] === 1) {
      currX = nx;
      currY = ny;
      dir = d;
      found = true;
      break;
    }
  }
  if (!found || (currX === startX && currY === startY)) break;
  contour.push([currX, currY]);
}

function perpendicularDist(p, lineStart, lineEnd) {
  const dX = lineEnd[0] - lineStart[0];
  const dY = lineEnd[1] - lineStart[1];
  const mag = Math.sqrt(dX * dX + dY * dY);
  if (mag === 0) return Math.sqrt((p[0] - lineStart[0])**2 + (p[1] - lineStart[1])**2);
  return Math.abs(dY * p[0] - dX * p[1] + lineEnd[0] * lineStart[1] - lineEnd[1] * lineStart[0]) / mag;
}

function douglasPeucker(pts, epsilon) {
  if (pts.length <= 2) return pts;
  let maxD = 0, index = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) {
      maxD = d;
      index = i;
    }
  }
  if (maxD > epsilon) {
    const left = douglasPeucker(pts.slice(0, index + 1), epsilon);
    const right = douglasPeucker(pts.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  }
  return [pts[0], pts[pts.length - 1]];
}

const simplified = douglasPeucker(contour, 0.75);

let minX = 999, minY = 999;
for (const [x, y] of simplified) {
  if (x < minX) minX = x;
  if (y < minY) minY = y;
}

const svgPoints = simplified.map(([x, y]) => {
  const px = Number(((x - minX) * scale + 2).toFixed(2));
  const py = Number(((y - minY) * scale + 2).toFixed(2));
  return `${px},${py}`;
}).join(' ');

// Pure solid fills with absolutely NO stroke/border
const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}">\n  <polygon points="${svgPoints}" fill="#000000"/>\n</svg>`;

const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${outW} ${outH}">\n  <polygon points="${svgPoints}" fill="#ffffff"/>\n</svg>`;

fs.writeFileSync('assets/cursor-black.svg', svgBlack);
fs.writeFileSync('assets/cursor-white.svg', svgWhite);
fs.writeFileSync('assets/cursor-default.svg', svgBlack);
console.log('✓ Successfully written borderless SVG cursors! Points:', simplified.length);
