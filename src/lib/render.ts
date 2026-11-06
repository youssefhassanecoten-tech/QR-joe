import QRCodeStyling, { type Options } from 'qr-code-styling'
import type { QrDesign } from '../types'
import { ensureContrast, roundedRectPath, withAlpha } from './canvas'
import { renderMatrixCanvas } from './matrix'

const BASE = 1024

interface Layout {
  pad: number
  capH: number
  qrSize: number
  qrX: number
  qrY: number
  captionY: number
  radius: number
  fontSize: number
  hasCaption: boolean
}

function computeLayout(design: QrDesign, size: number): Layout {
  const scale = size / BASE
  if (design.frame === 'none') {
    return {
      pad: 0,
      capH: 0,
      qrSize: size,
      qrX: 0,
      qrY: 0,
      captionY: 0,
      radius: 0,
      fontSize: 0,
      hasCaption: false,
    }
  }
  const pad = Math.round(design.framePadding * scale)
  const hasCaption = design.caption.trim().length > 0
  const capH = hasCaption ? Math.round(size * 0.095) : 0
  const qrSize = Math.max(48, size - pad * 2 - capH)
  const qrY = pad + (hasCaption && design.captionPosition === 'top' && design.frame !== 'banner' ? capH : 0)
  let captionY = 0
  if (hasCaption) {
    if (design.frame === 'banner') captionY = size - capH / 2
    else if (design.captionPosition === 'top') captionY = pad + capH / 2
    else captionY = size - pad - capH / 2
  }
  return {
    pad,
    capH,
    qrSize,
    qrX: Math.round((size - qrSize) / 2),
    qrY,
    captionY,
    radius: design.frameRadius * scale,
    fontSize: Math.round(capH * 0.3),
    hasCaption,
  }
}

function gradientFor(design: QrDesign, start: string, end: string) {
  return {
    type: design.gradientType,
    rotation: (design.gradientRotation * Math.PI) / 180,
    colorStops: [
      { offset: 0, color: start },
      { offset: 1, color: end },
    ],
  }
}

export function buildQrOptions(payload: string, design: QrDesign, size: number, type: 'canvas' | 'svg'): Options {
  const scale = size / BASE
  const margin = Math.round(design.margin * scale)
  const guard = design.contrastGuard
  const fgColor = guard ? ensureContrast(design.fgColor, design.bgColor) : design.fgColor
  const fgColor2 = guard ? ensureContrast(design.fgColor2, design.bgColor) : design.fgColor2
  const cornerColor = guard ? ensureContrast(design.cornerColor, design.bgColor) : design.cornerColor
  const cornerDotColor = guard ? ensureContrast(design.cornerDotColor, design.bgColor) : design.cornerDotColor
  const gradient = gradientFor(design, fgColor, fgColor2)
  const useGradient = design.fgType === 'gradient'
  const cornersUseGradient = useGradient && design.matchCorners
  const transparent = design.transparentBg && design.frame === 'none'

  return {
    width: size,
    height: size,
    type,
    data: payload,
    margin,
    qrOptions: {
      errorCorrectionLevel: design.errorCorrection,
    },
    image: design.logo ?? undefined,
    imageOptions: {
      hideBackgroundDots: design.hideLogoDots,
      imageSize: design.logoSize,
      margin: Math.round(design.logoMargin * scale),
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: design.dotsType,
      color: fgColor,
      ...(useGradient ? { gradient } : {}),
    },
    backgroundOptions: {
      color: transparent ? 'transparent' : design.bgColor,
    },
    cornersSquareOptions: {
      type: design.cornerSquareType,
      color: cornerColor,
      ...(cornersUseGradient ? { gradient } : {}),
    },
    cornersDotOptions: {
      type: design.cornerDotType,
      color: cornerDotColor,
      ...(cornersUseGradient ? { gradient } : {}),
    },
  }
}

async function renderRawPng(payload: string, design: QrDesign, size: number): Promise<Blob> {
  const qr = new QRCodeStyling(buildQrOptions(payload, design, size, 'canvas'))
  const raw = await qr.getRawData('png')
  if (!raw) throw new Error('QR renderer returned no data')
  return raw as Blob
}

async function blobToImage(blob: Blob): Promise<CanvasImageSource> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob)
    } catch {
      // fall through to <img>
    }
  }
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not decode QR image'))
      img.src = url
    })
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
}

function fitCaption(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number): number {
  let size = startSize
  while (size > 8) {
    ctx.font = `700 ${size}px "Space Grotesk", "Inter", system-ui, sans-serif`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 1
  }
  return size
}

export async function renderCompositeDataUrl(payload: string, design: QrDesign, size: number): Promise<string> {
  const layout = computeLayout(design, size)
  const qrImage =
    design.mode === 'classic'
      ? await blobToImage(await renderRawPng(payload, design, layout.qrSize))
      : await renderMatrixCanvas(payload, design, layout.qrSize)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable in this browser')

  if (design.frame !== 'none') {
    const radius = layout.radius
    ctx.save()

    // base card
    roundedRectPath(ctx, 0, 0, size, size, radius, radius, radius, radius)
    ctx.fillStyle = design.frameColor
    ctx.fill()

    // accent gradient wash across the frame
    const wash = ctx.createLinearGradient(0, 0, size, size)
    wash.addColorStop(0, withAlpha(design.accentColor, 0.22))
    wash.addColorStop(0.55, withAlpha(design.accentColor, 0.02))
    wash.addColorStop(1, withAlpha(design.accentColor, 0.14))
    roundedRectPath(ctx, 0, 0, size, size, radius, radius, radius, radius)
    ctx.fillStyle = wash
    ctx.fill()

    // inner hairline accent border
    const inset = Math.max(4, Math.round(size * 0.014))
    const innerRadius = Math.max(0, radius - inset)
    roundedRectPath(
      ctx,
      inset,
      inset,
      size - inset * 2,
      size - inset * 2,
      innerRadius,
      innerRadius,
      innerRadius,
      innerRadius,
    )
    ctx.strokeStyle = withAlpha(design.accentColor, 0.5)
    ctx.lineWidth = Math.max(2, Math.round(size * 0.0045))
    ctx.stroke()
    ctx.restore()

    if (design.frame === 'ticket') {
      const barH = Math.max(6, Math.round(size * 0.012))
      const barY = Math.max(6, Math.round(size * 0.018))
      ctx.save()
      const barGradient = ctx.createLinearGradient(layout.pad, barY, size - layout.pad, barY)
      barGradient.addColorStop(0, withAlpha(design.accentColor, 0.55))
      barGradient.addColorStop(0.5, design.accentColor)
      barGradient.addColorStop(1, withAlpha(design.accentColor, 0.55))
      roundedRectPath(ctx, layout.pad, barY, size - layout.pad * 2, barH, barH / 2, barH / 2, barH / 2, barH / 2)
      ctx.fillStyle = barGradient
      ctx.fill()
      ctx.restore()
    }

    if (design.frame === 'ticket' && layout.hasCaption) {
      ctx.save()
      ctx.strokeStyle = withAlpha(design.captionColor, 0.35)
      ctx.lineWidth = Math.max(1, Math.round(size * 0.0018))
      ctx.setLineDash([Math.round(size * 0.02), Math.round(size * 0.014)])
      const lineY = size - layout.pad - layout.capH + layout.capH * 0.14
      ctx.beginPath()
      ctx.moveTo(layout.pad, lineY)
      ctx.lineTo(size - layout.pad, lineY)
      ctx.stroke()
      ctx.restore()
    }
  }

  ctx.drawImage(qrImage, layout.qrX, layout.qrY, layout.qrSize, layout.qrSize)

  if (layout.hasCaption) {
    if (design.frame === 'banner') {
      ctx.save()
      roundedRectPath(
        ctx,
        0,
        size - layout.capH,
        size,
        layout.capH,
        0,
        0,
        layout.radius,
        layout.radius,
      )
      const barGradient = ctx.createLinearGradient(0, size - layout.capH, size, size)
      barGradient.addColorStop(0, design.accentColor)
      barGradient.addColorStop(1, withAlpha(design.accentColor, 0.72))
      ctx.fillStyle = barGradient
      ctx.fill()
      ctx.restore()
    }
    const text = design.caption.trim()
    const maxWidth = size - layout.pad * 2
    const fontSize = fitCaption(ctx, text, maxWidth, layout.fontSize)
    ctx.fillStyle = design.captionColor
    ctx.font = `700 ${fontSize}px "Space Grotesk", "Inter", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, size / 2, layout.captionY)
  }

  if (typeof qrImage === 'object' && 'close' in qrImage && typeof qrImage.close === 'function') {
    qrImage.close()
  }

  return canvas.toDataURL('image/png')
}

export async function renderRawSvgText(payload: string, design: QrDesign, size: number): Promise<string> {
  const layout = computeLayout(design, size)
  if (design.mode !== 'classic') {
    const canvas = await renderMatrixCanvas(payload, design, layout.qrSize)
    const dataUrl = canvas.toDataURL('image/png')
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.qrSize}" height="${layout.qrSize}" viewBox="0 0 ${layout.qrSize} ${layout.qrSize}"><image href="${dataUrl}" width="${layout.qrSize}" height="${layout.qrSize}"/></svg>`
  }
  const qr = new QRCodeStyling(buildQrOptions(payload, design, layout.qrSize, 'svg'))
  const raw = await qr.getRawData('svg')
  if (!raw) throw new Error('QR renderer returned no SVG data')
  return await (raw as Blob).text()
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

export async function renderFramedSvg(payload: string, design: QrDesign, size: number): Promise<string> {
  const layout = computeLayout(design, size)
  const inner = await renderRawSvgText(payload, design, layout.qrSize)
  const qrHref = svgToDataUrl(inner)

  if (design.frame === 'none') {
    return inner
  }

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
  )
  parts.push(
    `<rect x="0" y="0" width="${size}" height="${size}" rx="${layout.radius}" ry="${layout.radius}" fill="${design.frameColor}"/>`,
  )

  if (design.frame === 'ticket') {
    const barH = Math.max(4, Math.round(size * 0.009))
    parts.push(
      `<rect x="${layout.pad}" y="${layout.pad * 0.55}" width="${size - layout.pad * 2}" height="${barH}" rx="${barH}" fill="${design.accentColor}"/>`,
    )
    if (layout.hasCaption) {
      const lineY = size - layout.pad - layout.capH + layout.capH * 0.12
      parts.push(
        `<line x1="${layout.pad}" y1="${lineY}" x2="${size - layout.pad}" y2="${lineY}" stroke="${design.captionColor}" stroke-opacity="0.2" stroke-width="${Math.max(1, Math.round(size * 0.0015))}"/>`,
      )
    }
  }

  if (design.frame === 'banner' && layout.hasCaption) {
    parts.push(
      `<path d="M0 ${size - layout.capH} H${size} V${size - layout.radius} Q${size} ${size} ${size - layout.radius} ${size} H${layout.radius} Q0 ${size} 0 ${size - layout.radius} Z" fill="${design.accentColor}"/>`,
    )
  }

  parts.push(
    `<image href="${qrHref}" x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}"/>`,
  )

  if (layout.hasCaption) {
    const fontSize = Math.round(layout.fontSize * Math.min(1, (size - layout.pad * 2) / Math.max(1, design.caption.length * layout.fontSize * 0.62)))
    parts.push(
      `<text x="${size / 2}" y="${layout.captionY}" fill="${design.captionColor}" font-family="'Space Grotesk','Inter',system-ui,sans-serif" font-size="${Math.max(8, fontSize)}" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(design.caption.trim())}</text>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

export { computeLayout }

