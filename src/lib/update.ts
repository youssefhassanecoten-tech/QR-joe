export const UPDATE_FEED_KEY = 'qrjoe:update-feed'
export const DEFAULT_UPDATE_FEED =
  'https://raw.githubusercontent.com/youssefhassanecoten-tech/QR-joe/main/qrjoe-update.json'
export const UPDATE_DISMISSED_KEY = 'qrjoe:update-dismissed'

export interface UpdateInfo {
  version: string
  url?: string
  notes?: { en: string; ru: string } | string
}

export function readUpdateFeed(): string {
  try {
    const stored = localStorage.getItem(UPDATE_FEED_KEY)
    if (stored) return stored
    return DEFAULT_UPDATE_FEED
  } catch {
    return ''
  }
}

export function saveUpdateFeed(value: string): void {
  try {
    localStorage.setItem(UPDATE_FEED_KEY, value.trim())
  } catch {
    // ignore
  }
}

export function readDismissed(): string {
  try {
    return localStorage.getItem(UPDATE_DISMISSED_KEY) ?? ''
  } catch {
    return ''
  }
}

export function dismissUpdate(version: string): void {
  try {
    localStorage.setItem(UPDATE_DISMISSED_KEY, version)
  } catch {
    // ignore
  }
}

export function compareVersions(a: string, b: string): number {
  const left = a.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0)
  const right = b.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0)
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0)
    if (diff !== 0) return diff > 0 ? 1 : -1
  }
  return 0
}

export async function checkForUpdate(
  feedUrl: string,
  currentVersion: string,
): Promise<{ info?: UpdateInfo; error?: string }> {
  const url = feedUrl.trim()
  if (!url) return { error: 'no-feed' }
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return { error: `HTTP ${response.status}` }
    const data = (await response.json()) as UpdateInfo
    if (!data?.version) return { error: 'invalid-feed' }
    if (compareVersions(data.version, currentVersion) <= 0) return {}
    if (readDismissed() === data.version) return {}
    return { info: data }
  } catch (reason) {
    return { error: reason instanceof Error ? reason.message : 'network-error' }
  }
}

