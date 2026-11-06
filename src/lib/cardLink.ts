function bytesToBinary(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return binary
}

export function encodeCardData(value: string): string {
  const bytes = new TextEncoder().encode(value)
  return btoa(bytesToBinary(bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeCardData(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '==='.slice((normalized.length + 3) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

export function defaultPublicBase(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}`.replace(/#.*$/, '')
}

export function isLocalBase(value: string): boolean {
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url.protocol === 'http:'
  } catch {
    return true
  }
}

export function buildOnlineCardUrl(base: string, cardData: string): string {
  const clean = base.trim().replace(/#.*$/, '')
  return `${clean}#card=${encodeCardData(cardData)}`
}

export function readCardHash(): string | null {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#card=(.+)$/)
  if (!match) return null
  return decodeCardData(match[1])
}

export function publicBaseKey(): string {
  return 'qrjoe:public-card-base'
}

export function readPublicBase(): string {
  try {
    const stored = localStorage.getItem(publicBaseKey())
    if (stored) return stored
  } catch {
    // ignore
  }
  return defaultPublicBase()
}

export function decodeCardFromUrl(value: string): string | null {
  try {
    const url = new URL(value)
    const match = url.hash.match(/^#card=(.+)$/)
    if (!match) return null
    return decodeCardData(match[1])
  } catch {
    return null
  }
}
