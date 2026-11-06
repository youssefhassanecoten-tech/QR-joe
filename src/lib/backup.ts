import { VERSION } from '../version'

const APP_TAG = 'QR-JOE'
const FORMAT = 1
const PREFIX = 'qrjoe:'
const ITERATIONS = 150_000

export interface BackupEnvelope {
  app: string
  format: number
  createdAt: string
  salt: string
  iv: string
  data: string
}

export interface BackupPayload {
  app: string
  format: number
  version: string
  createdAt: string
  values: Record<string, string>
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export function collectBackupValues(): Record<string, string> {
  const values: Record<string, string> = {}
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key || !key.startsWith(PREFIX)) continue
    const value = localStorage.getItem(key)
    if (value !== null) values[key] = value
  }
  return values
}

export function backupCounts(values: Record<string, string>): { profiles: number; history: number } {
  let profiles = 0
  let history = 0
  try {
    const profilesValue = values[`${PREFIX}v1:profiles`]
    if (profilesValue) {
      const parsed = JSON.parse(profilesValue) as unknown
      if (Array.isArray(parsed)) profiles = parsed.length
    }
  } catch {
    profiles = 0
  }
  try {
    const historyValue = values[`${PREFIX}v1:history`]
    if (historyValue) {
      const parsed = JSON.parse(historyValue) as unknown
      if (Array.isArray(parsed)) history = parsed.length
    }
  } catch {
    history = 0
  }
  return { profiles, history }
}

export async function createEncryptedBackup(passphrase: string): Promise<string> {
  if (passphrase.trim().length < 8) {
    throw new Error('Use a passphrase of at least 8 characters.')
  }
  if (!('subtle' in crypto)) {
    throw new Error('Encryption is unavailable in this browser.')
  }
  const values = collectBackupValues()
  const payload: BackupPayload = {
    app: APP_TAG,
    format: FORMAT,
    version: VERSION,
    createdAt: new Date().toISOString(),
    values,
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  const envelope: BackupEnvelope = {
    app: APP_TAG,
    format: FORMAT,
    createdAt: payload.createdAt,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(cipher)),
  }
  return JSON.stringify(envelope)
}

export async function restoreEncryptedBackup(
  text: string,
  passphrase: string,
): Promise<{ count: number; createdAt: string; version: string }> {
  let envelope: BackupEnvelope
  try {
    envelope = JSON.parse(text) as BackupEnvelope
  } catch {
    throw new Error('This is not a valid QR-JOE backup file.')
  }
  if (envelope.app !== APP_TAG || !envelope.salt || !envelope.iv || !envelope.data) {
    throw new Error('This is not a valid QR-JOE backup file.')
  }
  let payload: BackupPayload
  try {
    const key = await deriveKey(passphrase, base64ToBytes(envelope.salt))
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(envelope.iv) },
      key,
      base64ToBytes(envelope.data),
    )
    payload = JSON.parse(new TextDecoder().decode(plain)) as BackupPayload
  } catch {
    throw new Error('Wrong passphrase or damaged backup file.')
  }
  if (payload.app !== APP_TAG || !payload.values || typeof payload.values !== 'object') {
    throw new Error('The backup content is invalid.')
  }

  const existing: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key && key.startsWith(PREFIX)) existing.push(key)
  }
  for (const key of existing) localStorage.removeItem(key)
  let count = 0
  for (const [key, value] of Object.entries(payload.values)) {
    if (!key.startsWith(PREFIX) || typeof value !== 'string') continue
    localStorage.setItem(key, value)
    count += 1
  }
  return { count, createdAt: payload.createdAt, version: payload.version }
}

