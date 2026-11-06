export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function relativeTime(timestamp: number, lang: 'en' | 'ru' = 'en'): string {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  const ru = lang === 'ru'

  if (diff < minute) return ru ? 'только что' : 'just now'
  if (diff < hour) return ru ? `${Math.floor(diff / minute)} мин назад` : `${Math.floor(diff / minute)}m ago`
  if (diff < day) return ru ? `${Math.floor(diff / hour)} ч назад` : `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return ru ? `${Math.floor(diff / day)} дн назад` : `${Math.floor(diff / day)}d ago`
  return new Date(timestamp).toLocaleDateString(ru ? 'ru-RU' : undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function truncate(value: string, length = 90): string {
  if (value.length <= length) return value
  return `${value.slice(0, length - 1)}…`
}

export function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:') {
      return url.href
    }
    return null
  } catch {
    return null
  }
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not read that image'))
      img.src = url
    })
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }
}

export async function fileToOptimizedDataUrl(
  file: File,
  max = 512,
  mime: 'image/webp' | 'image/png' = 'image/webp',
): Promise<string> {
  if (!file.type.startsWith('image/')) return fileToDataUrl(file)
  try {
    const img = await loadImageElement(file)
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return fileToDataUrl(file)
    ctx.drawImage(img, 0, 0, width, height)
    const output = canvas.toDataURL(mime, 0.92)
    return output.startsWith('data:image') ? output : fileToDataUrl(file)
  } catch {
    return fileToDataUrl(file)
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadDataUrl(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function fileSafeName(value: string, fallback = 'qr-joe'): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return cleaned || fallback
}
