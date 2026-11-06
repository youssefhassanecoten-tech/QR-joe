import type { QrDesign } from '../types'

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tl: number,
  tr: number,
  br: number,
  bl: number,
): void {
  const max = Math.min(width, height) / 2
  const radii = {
    tl: Math.max(0, Math.min(tl, max)),
    tr: Math.max(0, Math.min(tr, max)),
    br: Math.max(0, Math.min(br, max)),
    bl: Math.max(0, Math.min(bl, max)),
  }
  ctx.beginPath()
  ctx.moveTo(x + radii.tl, y)
  ctx.lineTo(x + width - radii.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr)
  ctx.lineTo(x + width, y + height - radii.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height)
  ctx.lineTo(x + radii.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl)
  ctx.lineTo(x, y + radii.tl)
  ctx.quadraticCurveTo(x, y, x + radii.tl, y)
  ctx.closePath()
}

function channelLuminance(value: number): number {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(first: number, second: number): number {
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

function toHex(r: number, g: number, b: number): string {
  const part = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

export function ensureContrast(foreground: string, background: string, target = 4): string {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  if (contrastRatio(foregroundLuminance, backgroundLuminance) >= target) return foreground

  const [r, g, b] = hexToRgb(foreground)
  const lighten = backgroundLuminance < foregroundLuminance
  let low = 0
  let high = 1
  let best = lighten ? toHex(255, 255, 255) : '#000000'

  for (let index = 0; index < 24; index += 1) {
    const amount = (low + high) / 2
    const next = lighten ? [r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount] : [r * (1 - amount), g * (1 - amount), b * (1 - amount)]
    const luminance = 0.2126 * channelLuminance(next[0]) + 0.7152 * channelLuminance(next[1]) + 0.0722 * channelLuminance(next[2])
    if (contrastRatio(luminance, backgroundLuminance) >= target) {
      high = amount
      best = toHex(next[0], next[1], next[2])
    } else {
      low = amount
    }
  }
  return best
}

function makeGradient(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  size: number,
  start: string,
  end: string,
): CanvasGradient {
  const center = size / 2
  if (design.gradientType === 'radial') {
    const gradient = ctx.createRadialGradient(center, center, size * 0.04, center, center, size * 0.72)
    gradient.addColorStop(0, start)
    gradient.addColorStop(1, end)
    return gradient
  }
  const angle = (design.gradientRotation * Math.PI) / 180
  const length = Math.abs(size * Math.cos(angle)) + Math.abs(size * Math.sin(angle))
  const dx = (Math.cos(angle) * length) / 2
  const dy = (Math.sin(angle) * length) / 2
  const gradient = ctx.createLinearGradient(center - dx, center - dy, center + dx, center + dy)
  gradient.addColorStop(0, start)
  gradient.addColorStop(1, end)
  return gradient
}

export function createDesignGradient(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  size: number,
): CanvasGradient {
  return makeGradient(ctx, design, size, design.fgColor, design.fgColor2)
}

export function designPaint(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  size: number,
): string | CanvasGradient {
  if (design.fgType === 'solid') return design.fgColor
  return createDesignGradient(ctx, design, size)
}

export function guardedDesignPaint(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  size: number,
): string | CanvasGradient {
  if (!design.contrastGuard) return designPaint(ctx, design, size)
  const background = design.bgColor
  if (design.fgType === 'solid') return ensureContrast(design.fgColor, background)
  return makeGradient(
    ctx,
    design,
    size,
    ensureContrast(design.fgColor, background),
    ensureContrast(design.fgColor2, background),
  )
}

export function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace('#', '').trim()
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return [0, 0, 0]
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

export function shade(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`
}

export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
}

export function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
