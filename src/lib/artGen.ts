import type { ArtTexture, QrDesign } from '../types'

function mulberry32(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((part) => part + part).join('') : clean
  const value = Number.parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(value)) return `rgba(139,92,246,${alpha})`
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red},${green},${blue},${alpha})`
}

export function generateArtTexture(design: QrDesign, size = 720): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const random = mulberry32(design.artSeed || 1)
  const primary = design.fgColor
  const secondary = design.fgColor2
  const accent = design.accentColor

  ctx.fillStyle = hexToRgba(primary, 0.1)
  ctx.fillRect(0, 0, size, size)

  const texture: ArtTexture = design.artTexture

  if (texture === 'blobs') {
    for (let index = 0; index < 14; index += 1) {
      const x = random() * size
      const y = random() * size
      const radius = size * (0.08 + random() * 0.24)
      const palette = [primary, secondary, accent][index % 3]
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, hexToRgba(palette, 0.75))
      gradient.addColorStop(1, hexToRgba(palette, 0))
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (texture === 'waves') {
    const lines = 18
    for (let line = 0; line < lines; line += 1) {
      const phase = random() * Math.PI * 2
      const amplitude = size * (0.03 + random() * 0.07)
      const offset = ((line + 0.5) / lines) * size
      const palette = [primary, secondary, accent][line % 3]
      ctx.strokeStyle = hexToRgba(palette, 0.55)
      ctx.lineWidth = size * 0.006
      ctx.beginPath()
      for (let x = 0; x <= size; x += 8) {
        const y = offset + Math.sin((x / size) * Math.PI * (2 + (line % 4)) + phase) * amplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  } else if (texture === 'stars') {
    for (let index = 0; index < 160; index += 1) {
      const x = random() * size
      const y = random() * size
      const radius = size * (0.004 + random() * 0.014)
      const palette = [primary, secondary, accent][index % 3]
      ctx.fillStyle = hexToRgba(palette, 0.4 + random() * 0.5)
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      if (index % 9 === 0) {
        ctx.strokeStyle = hexToRgba(palette, 0.5)
        ctx.lineWidth = Math.max(1, size * 0.002)
        ctx.beginPath()
        ctx.moveTo(x - radius * 3, y)
        ctx.lineTo(x + radius * 3, y)
        ctx.moveTo(x, y - radius * 3)
        ctx.lineTo(x, y + radius * 3)
        ctx.stroke()
      }
    }
  } else {
    const rings = 16
    const cx = size / 2
    const cy = size / 2
    for (let ring = 1; ring <= rings; ring += 1) {
      const radius = (ring / rings) * size * 0.62
      const wobble = size * 0.02 * random()
      const palette = [primary, secondary, accent][ring % 3]
      ctx.strokeStyle = hexToRgba(palette, 0.6 - ring * 0.02)
      ctx.lineWidth = Math.max(1, size * 0.004)
      ctx.beginPath()
      for (let step = 0; step <= 120; step += 1) {
        const angle = (step / 120) * Math.PI * 2
        const r = radius + Math.sin(angle * 6 + ring) * wobble
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (step === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }

  return canvas.toDataURL('image/png')
}
