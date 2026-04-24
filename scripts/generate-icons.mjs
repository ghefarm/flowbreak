// Generates tray + app icons into public/.
//
//   public/tray-icon.png      16x16   tray icon
//   public/tray-icon@2x.png   32x32   tray icon (HiDPI)
//   public/icon.png           512x512 app icon (Linux / fallback)
//   public/icon.ico           Windows app icon with 16,32,48,64,128,256 sizes
//
// Run with: node scripts/generate-icons.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

// -- PNG encoding --------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

// raw: Buffer with size rows, each row = 1 filter byte + size*4 RGBA bytes.
function encodePng(raw, size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const idat = deflateSync(raw)
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// -- Drawing primitives (hard edges; AA comes from supersampling) --------------

const BLUE = [74, 120, 200, 255]
const FACE = [246, 249, 255, 255]
const TRANSPARENT = [0, 0, 0, 0]

function writePixel(raw, size, x, y, rgba) {
  const stride = 1 + size * 4
  const i = y * stride + 1 + x * 4
  raw[i] = rgba[0]; raw[i + 1] = rgba[1]; raw[i + 2] = rgba[2]; raw[i + 3] = rgba[3]
}

// Tray icon: simple clock hands, no face (matches old design).
function renderTray(size) {
  const stride = 1 + size * 4
  const raw = Buffer.alloc(size * stride)
  const cx = (size - 1) / 2, cy = (size - 1) / 2
  const rOuter = size / 2 - 0.5
  const rInner = rOuter - Math.max(1.5, size * 0.18)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      let c = TRANSPARENT
      if (d <= rOuter && d >= rInner) c = BLUE
      else if (d < rInner && dy < 0 && Math.abs(dx) < 1) c = BLUE
      else if (d < rInner && Math.abs(dy) < 1 && dx > 0 && dx < rInner * 0.7) c = BLUE
      writePixel(raw, size, x, y, c)
    }
  }
  return raw
}

// App icon: filled circle, clock face with tick marks, hour + minute hands, center dot.
function renderApp(size) {
  const stride = 1 + size * 4
  const raw = Buffer.alloc(size * stride)
  const cx = (size - 1) / 2, cy = (size - 1) / 2
  const outerR = size / 2 - size * 0.03
  const faceR = outerR * 0.82
  const tickThick = size * 0.012
  const tickStart = faceR * 0.85
  const tickEnd = faceR * 0.96
  const hourLen = faceR * 0.50
  const hourThick = size * 0.035
  const minLen = faceR * 0.70
  const minThick = size * 0.027
  const centerR = size * 0.045

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)

      let color = TRANSPARENT
      if (d <= outerR) color = BLUE
      if (d <= faceR) color = FACE

      // Tick marks at 12/6/3/9.
      if (Math.abs(dx) <= tickThick && dy <= -tickStart && dy >= -tickEnd) color = BLUE
      if (Math.abs(dx) <= tickThick && dy >= tickStart && dy <= tickEnd) color = BLUE
      if (Math.abs(dy) <= tickThick && dx >= tickStart && dx <= tickEnd) color = BLUE
      if (Math.abs(dy) <= tickThick && dx <= -tickStart && dx >= -tickEnd) color = BLUE

      // Hour hand pointing to 12 o'clock.
      if (Math.abs(dx) <= hourThick && dy <= 0 && dy >= -hourLen) color = BLUE
      // Minute hand pointing to 3 o'clock.
      if (Math.abs(dy) <= minThick && dx >= 0 && dx <= minLen) color = BLUE

      // Center dot.
      if (d <= centerR) color = BLUE

      writePixel(raw, size, x, y, color)
    }
  }
  return raw
}

// -- Supersampled render with alpha-weighted downsample ------------------------

function supersample(renderFn, size, factor = 4) {
  const bigSize = size * factor
  const bigRaw = renderFn(bigSize)
  const bigStride = 1 + bigSize * 4
  const smallStride = 1 + size * 4
  const out = Buffer.alloc(size * smallStride)

  for (let sy = 0; sy < size; sy++) {
    out[sy * smallStride] = 0
    for (let sx = 0; sx < size; sx++) {
      let sumA = 0, sumR = 0, sumG = 0, sumB = 0
      for (let fy = 0; fy < factor; fy++) {
        for (let fx = 0; fx < factor; fx++) {
          const by = sy * factor + fy
          const bx = sx * factor + fx
          const bi = by * bigStride + 1 + bx * 4
          const a = bigRaw[bi + 3]
          sumA += a
          sumR += bigRaw[bi]     * a
          sumG += bigRaw[bi + 1] * a
          sumB += bigRaw[bi + 2] * a
        }
      }
      const n = factor * factor
      const outA = Math.round(sumA / n)
      const i = sy * smallStride + 1 + sx * 4
      out[i + 3] = outA
      if (sumA > 0) {
        out[i] = Math.round(sumR / sumA)
        out[i + 1] = Math.round(sumG / sumA)
        out[i + 2] = Math.round(sumB / sumA)
      }
    }
  }
  return out
}

// -- ICO packing ---------------------------------------------------------------

function buildIco(pngs) {
  const count = pngs.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  const entries = []
  let offset = 6 + 16 * count
  for (const { size, bytes } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(bytes.length, 8)
    e.writeUInt32LE(offset, 12)
    entries.push(e)
    offset += bytes.length
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.bytes)])
}

// -- Main ----------------------------------------------------------------------

writeFileSync(join(outDir, 'tray-icon.png'), encodePng(renderTray(16), 16))
writeFileSync(join(outDir, 'tray-icon@2x.png'), encodePng(renderTray(32), 32))

const ICO_SIZES = [16, 32, 48, 64, 128, 256]
const pngs = ICO_SIZES.map((size) => {
  const raw = supersample(renderApp, size, 4)
  return { size, bytes: encodePng(raw, size) }
})
writeFileSync(join(outDir, 'icon.ico'), buildIco(pngs))

const bigRaw = supersample(renderApp, 512, 4)
writeFileSync(join(outDir, 'icon.png'), encodePng(bigRaw, 512))

console.log('Wrote:')
console.log('  tray-icon.png (16)')
console.log('  tray-icon@2x.png (32)')
console.log('  icon.ico (' + ICO_SIZES.join(', ') + ')')
console.log('  icon.png (512)')
