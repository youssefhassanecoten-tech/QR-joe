import { BrowserQRCodeReader } from '@zxing/browser'

export interface DoubleQrResult {
  text: string
  region: string
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the image'))
    }
    image.src = url
  })
}

function decodeCanvas(canvas: HTMLCanvasElement, region: string): DoubleQrResult | null {
  try {
    const result = new BrowserQRCodeReader().decodeFromCanvas(canvas)
    const text = result.getText()?.trim()
    return text ? { text, region } : null
  } catch {
    return null
  }
}

function crop(
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth))
  canvas.height = Math.max(1, Math.round(sourceHeight))
  const context = canvas.getContext('2d')
  if (!context) return canvas
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return canvas
}

export async function decodeDoubleQr(file: File): Promise<DoubleQrResult[]> {
  const image = await loadImage(file)
  const width = image.naturalWidth
  const height = image.naturalHeight
  const full = crop(image, 0, 0, width, height)
  const regions: Array<{ name: string; canvas: HTMLCanvasElement }> = [
    { name: 'full', canvas: full },
    { name: 'left', canvas: crop(image, 0, 0, width / 2, height) },
    { name: 'right', canvas: crop(image, width / 2, 0, width / 2, height) },
    { name: 'top', canvas: crop(image, 0, 0, width, height / 2) },
    { name: 'bottom', canvas: crop(image, 0, height / 2, width, height / 2) },
    { name: 'center', canvas: crop(image, width * 0.25, height * 0.25, width * 0.5, height * 0.5) },
    { name: 'center-small', canvas: crop(image, width * 0.32, height * 0.32, width * 0.36, height * 0.36) },
    { name: 'center-wide', canvas: crop(image, width * 0.15, height * 0.15, width * 0.7, height * 0.7) },
    { name: 'center-tight', canvas: crop(image, width * 0.38, height * 0.38, width * 0.24, height * 0.24) },
    { name: 'top-left', canvas: crop(image, 0, 0, width / 3, height / 3) },
    { name: 'top-center', canvas: crop(image, width / 3, 0, width / 3, height / 3) },
    { name: 'top-right', canvas: crop(image, (width * 2) / 3, 0, width / 3, height / 3) },
    { name: 'mid-left', canvas: crop(image, 0, height / 3, width / 3, height / 3) },
    { name: 'mid-right', canvas: crop(image, (width * 2) / 3, height / 3, width / 3, height / 3) },
    { name: 'bottom-left', canvas: crop(image, 0, (height * 2) / 3, width / 3, height / 3) },
    { name: 'bottom-center', canvas: crop(image, width / 3, (height * 2) / 3, width / 3, height / 3) },
    { name: 'bottom-right', canvas: crop(image, (width * 2) / 3, (height * 2) / 3, width / 3, height / 3) },
  ]

  const results: DoubleQrResult[] = []
  const seen = new Set<string>()
  for (const region of regions) {
    const result = decodeCanvas(region.canvas, region.name)
    if (result && !seen.has(result.text)) {
      seen.add(result.text)
      results.push(result)
    }
  }
  return results
}

export async function decodeDoubleQrFromVideo(video: HTMLVideoElement): Promise<DoubleQrResult[]> {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 1280
  const context = canvas.getContext('2d')
  if (!context) return []
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return []
  return decodeDoubleQr(new File([blob], 'janus-scan.png', { type: 'image/png' }))
}


export interface DuoClassification {
  online: DoubleQrResult | null
  offline: DoubleQrResult | null
  others: DoubleQrResult[]
}

export function classifyDuoResults(results: DoubleQrResult[]): DuoClassification {
  const online =
    results.find((result) => /^https?:\/\/\S+#card=/i.test(result.text)) ??
    results.find((result) => /^https?:\/\//i.test(result.text)) ??
    null
  const offline =
    results.find((result) => /^(BEGIN:VCARD|MECARD:|WIFI:|mailto:|tel:|SMSTO:)/i.test(result.text)) ??
    null
  const others = results.filter((result) => result !== online && result !== offline)
  return { online, offline, others }
}

export function preferredDuoResult(results: DoubleQrResult[], connected: boolean): string {
  const { online, offline, others } = classifyDuoResults(results)
  if (connected) return online?.text ?? offline?.text ?? others[0]?.text ?? results[0].text
  return offline?.text ?? online?.text ?? others[0]?.text ?? results[0].text
}
