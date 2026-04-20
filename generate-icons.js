const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const palette = {
  outer: [9, 16, 26],
  inner: [17, 26, 38],
  border: [37, 52, 71],
  purple: [139, 123, 255],
  teal: [102, 224, 194],
  tealSoft: [168, 244, 228],
};

function insideRoundedRect(nx, ny, left, top, right, bottom, radius) {
  if (nx < left || nx > right || ny < top || ny > bottom) return false;

  const innerLeft = left + radius;
  const innerRight = right - radius;
  const innerTop = top + radius;
  const innerBottom = bottom - radius;

  if (nx >= innerLeft && nx <= innerRight) return true;
  if (ny >= innerTop && ny <= innerBottom) return true;

  const corners = [
    [innerLeft, innerTop],
    [innerRight, innerTop],
    [innerLeft, innerBottom],
    [innerRight, innerBottom],
  ];

  return corners.some(([cx, cy]) => {
    const dx = nx - cx;
    const dy = ny - cy;
    return dx * dx + dy * dy <= radius * radius;
  });
}

function insideCircle(nx, ny, cx, cy, radius) {
  const dx = nx - cx;
  const dy = ny - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function insideTriangle(nx, ny, ax, ay, bx, by, cx, cy) {
  const denominator = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  const alpha = ((by - cy) * (nx - cx) + (cx - bx) * (ny - cy)) / denominator;
  const beta = ((cy - ay) * (nx - cx) + (ax - cx) * (ny - cy)) / denominator;
  const gamma = 1 - alpha - beta;
  return alpha >= 0 && beta >= 0 && gamma >= 0;
}

function isGlyphT(nx, ny) {
  const topBar = nx >= 0.20 && nx <= 0.43 && ny >= 0.17 && ny <= 0.24;
  const stem = nx >= 0.285 && nx <= 0.345 && ny >= 0.24 && ny <= 0.45;
  return topBar || stem;
}

function isGlyphThree(nx, ny) {
  const top = nx >= 0.56 && nx <= 0.79 && ny >= 0.17 && ny <= 0.24;
  const middle = nx >= 0.59 && nx <= 0.77 && ny >= 0.285 && ny <= 0.35;
  const bottom = nx >= 0.56 && nx <= 0.79 && ny >= 0.38 && ny <= 0.45;
  const upperRight = nx >= 0.72 && nx <= 0.79 && ny >= 0.17 && ny <= 0.31;
  const lowerRight = nx >= 0.72 && nx <= 0.79 && ny >= 0.31 && ny <= 0.45;
  return top || middle || bottom || upperRight || lowerRight;
}

function iconColor(nx, ny) {
  if (!insideRoundedRect(nx, ny, 0.08, 0.08, 0.92, 0.92, 0.16)) {
    return palette.outer;
  }

  if (insideRoundedRect(nx, ny, 0.10, 0.10, 0.90, 0.90, 0.14)) {
    if (insideRoundedRect(nx, ny, 0.15, 0.54, 0.85, 0.83, 0.06)) {
      const inner = insideRoundedRect(nx, ny, 0.19, 0.58, 0.81, 0.79, 0.03);
      if (!inner) return palette.teal;
    }

    if (insideCircle(nx, ny, 0.32, 0.635, 0.04)) return palette.tealSoft;

    if (insideTriangle(nx, ny, 0.22, 0.78, 0.38, 0.60, 0.52, 0.78)) {
      return palette.tealSoft;
    }

    if (insideTriangle(nx, ny, 0.40, 0.78, 0.58, 0.64, 0.76, 0.78)) {
      return palette.teal;
    }

    if (isGlyphT(nx, ny) || isGlyphThree(nx, ny)) {
      return palette.purple;
    }

    if (insideRoundedRect(nx, ny, 0.10, 0.10, 0.90, 0.90, 0.14) &&
        !insideRoundedRect(nx, ny, 0.12, 0.12, 0.88, 0.88, 0.12)) {
      return palette.border;
    }

    return palette.inner;
  }

  return palette.border;
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPng(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;

    for (let x = 0; x < size; x += 1) {
      const pixelOffset = rowOffset + 1 + x * 3;
      const nx = x / (size - 1);
      const ny = y / (size - 1);
      const [r, g, b] = iconColor(nx, ny);
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
    }
  }

  const idatData = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function writePng(relativePath, size) {
  const absolutePath = path.join(__dirname, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, createPng(size));
  console.log(`Wrote ${relativePath}`);
}

const outputs = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apk/app/src/main/res/mipmap-mdpi/ic_launcher.png', 48],
  ['apk/app/src/main/res/mipmap-hdpi/ic_launcher.png', 72],
  ['apk/app/src/main/res/mipmap-xhdpi/ic_launcher.png', 96],
  ['apk/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', 144],
  ['apk/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 192],
];

outputs.forEach(([relativePath, size]) => writePng(relativePath, size));
