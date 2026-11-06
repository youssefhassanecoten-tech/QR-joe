import { createContext, useContext } from 'react'
import type { BackupDecision } from './autoBackupSchedule'
import type {
  CameraPhoto,
  ConnectionTest,
  PermissionResult,
  UploadProgressEvent,
  UploadResult,
} from './CameraBackup'

export type BackupPhase = 'idle' | 'prompt' | 'uploading' | 'done' | 'error'

export interface LastRun {
  status: BackupDecision | 'offline'
  uploaded?: number
  failed?: number
  at: number
}

export interface AutoBackupContextValue {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  isNative: boolean
  online: boolean
  tokenSaved: boolean
  permissions: PermissionResult | null
  photos: CameraPhoto[]
  warningOpen: boolean
  phase: BackupPhase
  progress: UploadProgressEvent[]
  summary: UploadResult | null
  error: string | null
  lastRun: LastRun | null
  requestPermissions: () => Promise<void>
  refreshAll: () => Promise<void>
  saveToken: (token: string) => Promise<void>
  clearToken: () => Promise<void>
  testConnection: () => Promise<ConnectionTest>
  openWarning: () => Promise<void>
  allow: () => Promise<void>
  deny: () => void
  closeDialog: () => void
  retryPrompt: () => Promise<void>
  openSettingsFromDialog: () => void
}

export const AutoBackupContext = createContext<AutoBackupContextValue | null>(null)

export function useAutoBackup(): AutoBackupContextValue {
  const value = useContext(AutoBackupContext)
  if (!value) throw new Error('useAutoBackup must be used inside AutoBackupProvider')
  return value
}
