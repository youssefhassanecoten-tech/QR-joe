import { BACKUP_HOUR, BACKUP_MINUTE, BACKUP_WINDOW_MINUTES } from './config'

export type BackupDecision = 'completed' | 'failed' | 'skipped'

const DAY_KEY_PREFIX = 'qrjoeic:auto-backup:day:'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function dayKey(now: Date = new Date()): string {
  return `${DAY_KEY_PREFIX}${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function isInBackupWindow(now: Date = new Date()): boolean {
  if (now.getHours() !== BACKUP_HOUR) return false
  return now.getMinutes() >= BACKUP_MINUTE && now.getMinutes() < BACKUP_MINUTE + BACKUP_WINDOW_MINUTES
}

export function getDecision(now: Date = new Date()): BackupDecision | null {
  try {
    const value = localStorage.getItem(dayKey(now))
    if (value === 'completed' || value === 'failed' || value === 'skipped') return value
    return null
  } catch {
    return null
  }
}

export function setDecision(decision: BackupDecision, now: Date = new Date()): void {
  try {
    localStorage.setItem(dayKey(now), decision)
  } catch {
    // storage may be unavailable — the in-memory prompt still works
  }
}

export function shouldPrompt(now: Date = new Date()): boolean {
  return isInBackupWindow(now) && getDecision(now) === null
}

export function formatBackupTime(): string {
  const suffix = BACKUP_HOUR >= 12 ? 'PM' : 'AM'
  const hour = BACKUP_HOUR % 12 || 12
  return `${hour}:${String(BACKUP_MINUTE).padStart(2, '0')} ${suffix}`
}

export const WARNING_TITLE = `Auto backup at ${formatBackupTime()}`
export const WARNING_QUESTION = 'Allow?'
