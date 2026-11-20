/**
 * Generates the PWA icons without any image dependencies:
 * a dark field, the seven stars of the cluster, and the eighth in blue.
 * Run with `npm run icons` after changing the palette or the cluster.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const VOID = [8, 13, 20]
const CREAM = [230, 217, 184]
const BLUE = [126, 166, 198]

/** Same constellation as src/components/brand/StarCluster.tsx (0..100 x 0..52). */
const STARS = [
  { x: 12, y: 14, r: 1.5 },
  { x: 16.5, y: 33, r: 1.15 },
  { x: 33, y: 40, r: 1.1 },
  { x: 37.5, y: 25.5, r: 0.9 },
  { x: 54, y: 19.5, r: 1.2 },
  { x: 70, y: 14, r: 1.3 },
  { x: 88, y: 9, r: 1.15 },
]
const EIGHTH = { x: 29, y: 19, r: 1.1 }

const SUPERSAMPLE = 3

function crcTable() {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
}

const CRC_TABLE = crcTable()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

/** `inset` is the fraction of the canvas the constellation may use. */
function render(size, inset) {
  const big = size * SUPERSAMPLE
  const field = new Float32Array(big * big * 3)
  const center = big / 2
  const halo = big * 0.62

  for (let y = 0; y < big; y += 1) {
    for (let x = 0; x < big; x += 1) {
      const dx = x + 0.5 - center
      const dy = y + 0.5 - center
      const falloff = Math.max(0, 1 - Math.hypot(dx, dy * 1.35) / halo) ** 2
      const glow = falloff * 0.11
      const index = (y * big + x) * 3
      field[index] = VOID[0] + (BLUE[0] - VOID[0]) * glow
      field[index + 1] = VOID[1] + (BLUE[1] - VOID[1]) * glow
      field[index + 2] = VOID[2] + (BLUE[2] - VOID[2]) * glow
    }
  }

  const scale = (big * inset) / 116
  const offsetX = center - 50 * scale
  const offsetY = center - 26 * scale

  const paint = (star, color, radiusBoost) => {
    const cx = offsetX + star.x * scale
    const cy = offsetY + star.y * scale
    const radius = star.r * scale * radiusBoost
    const reach = Math.ceil(radius + SUPERSAMPLE * 1.5)
    const glowSigma = radius * 2.6

    for (let y = Math.max(0, Math.floor(cy - reach)); y < Math.min(big, cy + reach); y += 1) {
      for (let x = Math.max(0, Math.floor(cx - reach)); x < Math.min(big, cx + reach); x += 1) {
        const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
        const coverage = clamp((radius - distance) / SUPERSAMPLE + 0.5)
        const glow = Math.exp(-(distance ** 2) / (2 * glowSigma ** 2)) * 0.5
        const index = (y * big + x) * 3
        for (let channel = 0; channel < 3; channel += 1) {
          const base = field[index + channel]
          const lit = base + (color[channel] - base) * coverage
          field[index + channel] = lit + (color[channel] - lit) * glow
        }
      }
    }
  }

  STARS.forEach((star) => paint(star, CREAM, 1))
  paint(EIGHTH, BLUE, 1.15)

  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0
      let g = 0
      let b = 0
      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const index = ((y * SUPERSAMPLE + sy) * big + (x * SUPERSAMPLE + sx)) * 3
          r += field[index]
          g += field[index + 1]
          b += field[index + 2]
        }
      }
      const samples = SUPERSAMPLE * SUPERSAMPLE
      const index = (y * size + x) * 4
      rgba[index] = Math.round(r / samples)
      rgba[index + 1] = Math.round(g / samples)
      rgba[index + 2] = Math.round(b / samples)
      rgba[index + 3] = 255
    }
  }

  return encodePng(size, size, rgba)
}

mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true })

const output = [
  ['icon-192.png', render(192, 0.78)],
  ['icon-512.png', render(512, 0.78)],
  ['icon-maskable-512.png', render(512, 0.5)],
]

for (const [name, buffer] of output) {
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), buffer)
  console.log(`icons/${name}  ${(buffer.length / 1024).toFixed(1)} kB`)
}
