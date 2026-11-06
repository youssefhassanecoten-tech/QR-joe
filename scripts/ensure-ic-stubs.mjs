#!/usr/bin/env node
// The QR-JOEic variant is private and lives only on the maintainer's machine (src/ic/ is
// gitignored). Public clones and CI therefore have no src/ic module, so this script writes
// minimal stubs that satisfy the TypeScript build. It never touches an existing src/ic.

import fs from 'node:fs'
import path from 'node:path'

const requireReal = process.argv.includes('--require-real')
const icDir = path.join('src', 'ic')

if (fs.existsSync(path.join(icDir, 'config.ts'))) {
  process.exit(0)
}

if (requireReal) {
  console.error('src/ic is missing - the QR-JOEic build needs the private backup module.')
  process.exit(1)
}

const stubs = {
  'config.ts': [
    'export const IS_IC = false',
    "export const BACKUP_FOLDER = 'QR-JOE'",
    "export const BACKUP_FOLDER_LABEL = 'QR-JOE'",
    '',
  ].join('\n'),
  'CameraBackup.ts': [
    '// Public stub - the real camera-backup plugin is private to local QR-JOEic builds.',
    "export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'unavailable'",
    '',
    'export interface CameraPhoto {',
    '  id: string',
    '  name: string',
    '  uri: string',
    '  size: number',
    '  dateTaken: number',
    '  mimeType: string',
    '  uploaded: boolean',
    '}',
    '',
    'export interface PermissionResult {',
    '  photos: PermissionStatus',
    '  camera: PermissionStatus',
    '  files: string',
    '}',
    '',
    'export interface UploadProgressEvent {',
    "  id: string",
    '  current: number',
    '  total: number',
    '  fileName: string',
    "  status: 'uploading' | 'uploaded' | 'failed'",
    '  message?: string',
    '}',
    '',
    'export interface UploadResult {',
    '  total: number',
    '  uploaded: number',
    '  failed: number',
    '}',
    '',
    'export interface ConnectionTest {',
    '  ok: boolean',
    '  user?: string',
    '  message?: string',
    '}',
    '',
    'export const CameraBackup = {',
    '  async openAppSettings(): Promise<void> {',
    '    return',
    '  },',
    '}',
    '',
  ].join('\n'),
  'AutoBackupContext.ts': [
    '// Public stub - the real auto-backup module is private to local QR-JOEic builds.',
    "import type { CameraPhoto, ConnectionTest, PermissionResult, UploadProgressEvent, UploadResult } from './CameraBackup'",
    '',
    "export type BackupPhase = 'idle' | 'prompt' | 'uploading' | 'done' | 'error'",
    '',
    'export interface LastRun {',
    '  status: string',
    '  uploaded?: number',
    '  failed?: number',
    '  at: number',
    '}',
    '',
    'export interface AutoBackupContextValue {',
    '  enabled: boolean',
    '  setEnabled: (enabled: boolean) => void',
    '  isNative: boolean',
    '  online: boolean',
    '  tokenSaved: boolean',
    '  permissions: PermissionResult | null',
    '  photos: CameraPhoto[]',
    '  warningOpen: boolean',
    '  phase: BackupPhase',
    '  progress: UploadProgressEvent[]',
    '  summary: UploadResult | null',
    '  error: string | null',
    '  lastRun: LastRun | null',
    '  requestPermissions: () => Promise<void>',
    '  refreshAll: () => Promise<void>',
    '  saveToken: (token: string) => Promise<void>',
    '  clearToken: () => Promise<void>',
    '  testConnection: () => Promise<ConnectionTest>',
    '  openWarning: () => Promise<void>',
    '  allow: () => Promise<void>',
    '  deny: () => void',
    '  closeDialog: () => void',
    '  retryPrompt: () => Promise<void>',
    '  openSettingsFromDialog: () => void',
    '}',
    '',
    'export function useAutoBackup(): AutoBackupContextValue {',
    "  throw new Error('Auto backup is not available in this build.')",
    '}',
    '',
  ].join('\n'),
  'AutoBackupProvider.tsx': [
    '// Public stub - the real auto-backup module is private to local QR-JOEic builds.',
    "import type { ReactNode } from 'react'",
    '',
    'export function AutoBackupProvider({',
    '  children,',
    '  onOpenSettings,',
    '}: {',
    '  children: ReactNode',
    '  onOpenSettings?: () => void',
    '}): ReactNode {',
    '  void onOpenSettings',
    '  return children',
    '}',
    '',
  ].join('\n'),
}

fs.mkdirSync(icDir, { recursive: true })
for (const [name, content] of Object.entries(stubs)) {
  fs.writeFileSync(path.join(icDir, name), content, 'utf8')
}
console.log(`Generated public stubs in ${icDir}/ (the private QR-JOEic module is not in this checkout).`)
