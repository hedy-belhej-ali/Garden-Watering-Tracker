// Generates PWA / app icons as PNGs with a minimal hand-rolled encoder
// (no external image dependencies). The raster is the app's tree logo:
// teal rounded-square field, ochre trunk, mint canopy.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public')

// ---------- minimal PNG encoder ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const stride = 1 + width * 4
  const raw = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- raster ----------

const COLORS = {
  field: [26, 58, 58],
  ground: [18, 48, 52],
  trunk: [232, 185, 74],
  trunkDark: [212, 165, 58],
  canopy: [164, 212, 197],
  canopyLight: [207, 233, 221],
}

function inRoundedRect(px, py, size, r) {
  const half = size / 2
  if (Math.abs(px - half) > half || Math.abs(py - half) > half) return false
  const dx = Math.abs(px - half) - (half - r)
  const dy = Math.abs(py - half) - (half - r)
  if (dx > 0 && dy > 0) return dx * dx + dy * dy <= r * r
  return true
}

function inEllipse(px, py, cx, cy, rx, ry) {
  const dx = (px - cx) / rx
  const dy = (py - cy) / ry
  return dx * dx + dy * dy <= 1
}

function sample(size, px, py, scale, fullField) {
  const f = (p) => size * (0.5 + (p - 0.5) * scale)
  const cx = (c) => f(c)
  const s = (v) => v * size

  let color
  if (fullField || inRoundedRect(px, py, size, s(0.2))) {
    color = COLORS.field
  } else {
    return [0, 0, 0, 0]
  }

  const shapeOrder = [
    {
      c: COLORS.ground,
      hit: (x, y) => inEllipse(x, y, cx(0.5), cx(0.84), s(0.3), s(0.06)),
    },
    {
      c: COLORS.trunk,
      hit: (x, y) => x >= cx(0.46) && x <= cx(0.54) && y >= cx(0.56) && y <= cx(0.82),
    },
    {
      c: COLORS.trunkDark,
      hit: (x, y) => x >= cx(0.44) && x <= cx(0.56) && y >= cx(0.74) && y <= cx(0.84),
    },
    {
      c: COLORS.canopy,
      hit: (x, y) => inEllipse(x, y, cx(0.5), cx(0.46), s(0.28), s(0.24)),
    },
    {
      c: COLORS.canopy,
      hit: (x, y) => inEllipse(x, y, cx(0.36), cx(0.53), s(0.18), s(0.16)),
    },
    {
      c: COLORS.canopy,
      hit: (x, y) => inEllipse(x, y, cx(0.64), cx(0.53), s(0.18), s(0.16)),
    },
    {
      c: COLORS.canopyLight,
      hit: (x, y) => inEllipse(x, y, cx(0.44), cx(0.38), s(0.07), s(0.06)),
    },
    {
      c: COLORS.canopyLight,
      hit: (x, y) => inEllipse(x, y, cx(0.59), cx(0.47), s(0.05), s(0.045)),
    },
  ]

  for (const shape of shapeOrder) {
    if (shape.hit(px, py)) {
      color = shape.c
    }
  }
  return [color[0], color[1], color[2], 255]
}

function render(size, scale, fullField) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const acc = [0, 0, 0, 0]
      for (let sy = 0; sy < 2; sy += 1) {
        for (let sx = 0; sx < 2; sx += 1) {
          const px = x + (sx === 0 ? 0.25 : 0.75)
          const py = y + (sy === 0 ? 0.25 : 0.75)
          const c = sample(size, px, py, scale, fullField)
          const a = c[3]
          if (a === 255) {
            acc[0] += c[0]
            acc[1] += c[1]
            acc[2] += c[2]
            acc[3] += 255
          }
        }
      }
      const i = (y * size + x) * 4
      for (let k = 0; k < 4; k += 1) {
        rgba[i + k] = k === 3 ? Math.round(acc[3] / 4) : acc[3] === 0 ? 0 : Math.round((acc[k] * 255) / acc[3])
      }
    }
  }
  return rgba
}

const targets = [
  { file: 'pwa-192.png', size: 192, scale: 1, fullField: false },
  { file: 'pwa-512.png', size: 512, scale: 1, fullField: false },
  { file: 'pwa-maskable-512.png', size: 512, scale: 0.72, fullField: true },
  { file: 'apple-touch-icon.png', size: 180, scale: 1, fullField: false },
]

for (const t of targets) {
  writeFileSync(join(out, t.file), encodePNG(t.size, t.size, render(t.size, t.scale, t.fullField)))
  console.log(`wrote public/${t.file}`)
}