import qrcode from 'qrcode-generator'
import type { QrDesign } from '../types'
import {
  createRng,
  drawImageCover,
  ensureContrast,
  guardedDesignPaint,
  hashString,
  loadImageFromSrc,
  roundedRectPath,
  withAlpha,
} from './canvas'

qrcode.stringToBytes = (value: string) => Array.from(new TextEncoder().encode(value))

interface QrMatrix {
  count: number
  isDark: (row: number, col: number) => boolean
}

function buildMatrix(payload: string, errorCorrection: QrDesign['errorCorrection']): QrMatrix {
  const qr = qrcode(0, errorCorrection)
  qr.addData(payload)
  qr.make()
  const count = qr.getModuleCount()
  return {
    count,
    isDark: (row, col) => row >= 0 && col >= 0 && row < count && col < count && qr.isDark(row, col),
  }
}

function isFinder(row: number, col: number, count: number): boolean {
  return (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7)
}

function finderOrigins(count: number): Array<[number, number]> {
  return [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ]
}

function drawFinder(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  row: number,
  col: number,
  moduleSize: number,
  margin: number,
  paint: string | CanvasGradient,
): void {
  const x = margin + col * moduleSize
  const y = margin + row * moduleSize
  const corner = design.contrastGuard ? ensureContrast(design.cornerColor, design.bgColor) : design.cornerColor
  const cornerDot = design.contrastGuard ? ensureContrast(design.cornerDotColor, design.bgColor) : design.cornerDotColor
  const squarePaint = design.matchCorners ? paint : corner
  const dotPaint = design.matchCorners ? paint : cornerDot
  const radius = design.cornerSquareType === 'square' ? 0 : moduleSize * 1.7

  ctx.strokeStyle = squarePaint
  ctx.lineWidth = moduleSize
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  roundedRectPath(
    ctx,
    x + moduleSize / 2,
    y + moduleSize / 2,
    moduleSize * 6,
    moduleSize * 6,
    radius,
    radius,
    radius,
    radius,
  )
  ctx.stroke()

  const innerRadius =
    design.cornerDotType === 'dot' ? moduleSize * 1.5 : design.cornerSquareType === 'square' ? 0 : moduleSize * 0.6
  ctx.fillStyle = dotPaint
  roundedRectPath(
    ctx,
    x + moduleSize * 2,
    y + moduleSize * 2,
    moduleSize * 3,
    moduleSize * 3,
    innerRadius,
    innerRadius,
    innerRadius,
    innerRadius,
  )
  ctx.fill()
}

function drawMaze(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  matrix: QrMatrix,
  size: number,
  margin: number,
  paint: string | CanvasGradient,
): void {
  const { count, isDark } = matrix
  const area = size - margin * 2
  const moduleSize = area / count

  ctx.strokeStyle = paint
  ctx.fillStyle = paint
  ctx.lineWidth = Math.max(1, moduleSize * design.mazeThickness * 0.55)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const centerX = (col: number) => margin + (col + 0.5) * moduleSize
  const centerY = (row: number) => margin + (row + 0.5) * moduleSize
  const isDataDark = (row: number, col: number) =>
    isDark(row, col) && !isFinder(row, col, count)

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!isDataDark(row, col)) continue
      if (isDataDark(row, col + 1)) {
        ctx.beginPath()
        ctx.moveTo(centerX(col), centerY(row))
        ctx.lineTo(centerX(col + 1), centerY(row))
        ctx.stroke()
      }
      if (isDataDark(row + 1, col)) {
        ctx.beginPath()
        ctx.moveTo(centerX(col), centerY(row))
        ctx.lineTo(centerX(col), centerY(row + 1))
        ctx.stroke()
      }
    }
  }

  const pad = moduleSize * 0.14
  const baseSize = moduleSize - pad * 2
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!isDataDark(row, col)) continue
      const x = margin + col * moduleSize
      const y = margin + row * moduleSize
      if (design.dotsType === 'dots') {
        ctx.beginPath()
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, baseSize / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (design.dotsType === 'square') {
        ctx.fillRect(x + pad, y + pad, baseSize, baseSize)
      } else {
        const radius =
          design.dotsType === 'extra-rounded'
            ? baseSize * 0.42
            : design.dotsType === 'rounded'
              ? baseSize * 0.28
              : design.dotsType === 'classy-rounded'
                ? baseSize * 0.4
                : design.dotsType === 'classy'
                  ? baseSize * 0.2
                  : baseSize * 0.08
        roundedRectPath(ctx, x + pad, y + pad, baseSize, baseSize, radius, radius, radius, radius)
        ctx.fill()
      }
    }
  }

  for (const [row, col] of finderOrigins(count)) {
    drawFinder(ctx, design, row, col, moduleSize, margin, paint)
  }
}

function drawArtModule(
  ctx: CanvasRenderingContext2D,
  design: QrDesign,
  x: number,
  y: number,
  moduleSize: number,
  fill: string,
): void {
  const pad = moduleSize * 0.06
  const size = moduleSize - pad * 2
  ctx.fillStyle = fill
  if (design.dotsType === 'dots') {
    ctx.beginPath()
    ctx.arc(x + moduleSize / 2, y + moduleSize / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (design.dotsType === 'square') {
    ctx.fillRect(x + pad, y + pad, size, size)
    return
  }
  const radius =
    design.dotsType === 'extra-rounded'
      ? size * 0.45
      : design.dotsType === 'rounded'
        ? size * 0.3
        : design.dotsType === 'classy-rounded'
          ? size * 0.42
          : design.dotsType === 'classy'
            ? size * 0.2
            : size * 0.08
  roundedRectPath(ctx, x + pad, y + pad, size, size, radius, radius, radius, radius)
  ctx.fill()
}

async function createArtCanvas(payload: string, design: QrDesign, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')

  if (design.artImage) {
    const image = await loadImageFromSrc(design.artImage)
    drawImageCover(ctx, image, 0, 0, size, size)
    return canvas
  }

  const rng = createRng(hashString(`${payload}|${design.fgColor}|${design.fgColor2}|${design.accentColor}`))
  const base = ctx.createLinearGradient(0, 0, size, size)
  base.addColorStop(0, design.fgColor2)
  base.addColorStop(0.55, design.fgColor)
  base.addColorStop(1, design.accentColor)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  const palette = [design.fgColor, design.fgColor2, design.accentColor, design.cornerColor, '#ffffff']
  for (let index = 0; index < 24; index += 1) {
    const x = rng() * size
    const y = rng() * size
    const radius = size * (0.06 + rng() * 0.24)
    const color = palette[Math.floor(rng() * palette.length)]
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, withAlpha(color, 0.5))
    gradient.addColorStop(1, withAlpha(color, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  for (let index = 0; index < 10; index += 1) {
    const x = rng() * size
    const y = rng() * size
    const radius = size * (0.05 + rng() * 0.16)
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, withAlpha('#05050a', 0.32))
    gradient.addColorStop(1, withAlpha('#05050a', 0))
    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  for (let index = 0; index < 14; index += 1) {
    ctx.beginPath()
    ctx.moveTo(rng() * size, rng() * size)
    ctx.bezierCurveTo(rng() * size, rng() * size, rng() * size, rng() * size, rng() * size, rng() * size)
    ctx.strokeStyle = withAlpha(rng() > 0.45 ? '#ffffff' : design.accentColor, 0.06 + rng() * 0.14)
    ctx.lineWidth = size * (0.002 + rng() * 0.012)
    ctx.stroke()
  }

  return canvas
}

async function drawArt(
  ctx: CanvasRenderingContext2D,
  payload: string,
  design: QrDesign,
  matrix: QrMatrix,
  size: number,
  margin: number,
): Promise<void> {
  const { count, isDark } = matrix
  const art = await createArtCanvas(payload, design, size)
  ctx.drawImage(art, 0, 0)

  const fade = Math.max(0, Math.min(95, design.artFade)) / 100
  ctx.fillStyle = `rgba(255, 255, 255, ${fade})`
  ctx.fillRect(0, 0, size, size)

  const sampleSize = Math.min(512, size)
  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = sampleSize
  sampleCanvas.height = sampleSize
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
  if (!sampleCtx) throw new Error('Canvas is unavailable')
  sampleCtx.drawImage(art, 0, 0, sampleSize, sampleSize)
  const pixels = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data

  const area = size - margin * 2
  const moduleSize = area / count
  const sampleScale = sampleSize / size

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!isDark(row, col) || isFinder(row, col, count)) continue
      const x = margin + col * moduleSize
      const y = margin + row * moduleSize
      const sampleX = Math.min(sampleSize - 1, Math.floor((x + moduleSize / 2) * sampleScale))
      const sampleY = Math.min(sampleSize - 1, Math.floor((y + moduleSize / 2) * sampleScale))
      const offset = (sampleY * sampleSize + sampleX) * 4
      const red = Math.round(pixels[offset] * 0.34)
      const green = Math.round(pixels[offset + 1] * 0.34)
      const blue = Math.round(pixels[offset + 2] * 0.34)
      drawArtModule(ctx, design, x, y, moduleSize, `rgb(${red}, ${green}, ${blue})`)
    }
  }

  const finderPaint = '#0b0b12'
  for (const [row, col] of finderOrigins(count)) {
    drawFinder(ctx, design, row, col, moduleSize, margin, finderPaint)
  }
}

async function drawLogo(ctx: CanvasRenderingContext2D, design: QrDesign, size: number): Promise<void> {
  if (!design.logo) return
  const image = await loadImageFromSrc(design.logo)
  const logoSize = size * design.logoSize
  const logoMargin = (design.logoMargin * size) / 1024
  const x = (size - logoSize) / 2
  const y = (size - logoSize) / 2
  if (design.hideLogoDots) {
    const pad = Math.max(2, logoMargin)
    const radius = Math.min(logoSize, logoSize) * 0.14
    ctx.fillStyle = '#ffffff'
    roundedRectPath(
      ctx,
      x - pad,
      y - pad,
      logoSize + pad * 2,
      logoSize + pad * 2,
      radius,
      radius,
      radius,
      radius,
    )
    ctx.fill()
  }
  ctx.drawImage(image, x, y, logoSize, logoSize)
}

export async function renderMatrixCanvas(
  payload: string,
  design: QrDesign,
  size: number,
): Promise<HTMLCanvasElement> {
  const scale = size / 1024
  const margin = Math.round(design.margin * scale)
  const matrix = buildMatrix(payload, design.errorCorrection)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable in this browser')

  const paint = guardedDesignPaint(ctx, design, size)

  if (design.mode === 'art') {
    await drawArt(ctx, payload, design, matrix, size, margin)
  } else {
    const transparent = design.transparentBg && design.frame === 'none'
    if (!transparent) {
      ctx.fillStyle = design.bgColor
      ctx.fillRect(0, 0, size, size)
    }
    drawMaze(ctx, design, matrix, size, margin, paint)
  }

  await drawLogo(ctx, design, size)
  return canvas
}
