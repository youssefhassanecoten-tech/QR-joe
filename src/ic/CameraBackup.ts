import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'unavailable'

export interface CameraPhoto {
  id: string
  name: string
  uri: string
  size: number
  dateTaken: number
  mimeType: string
  uploaded: boolean
}

export interface PermissionResult {
  photos: PermissionStatus
  camera: PermissionStatus
  files: string
}

export interface UploadProgressEvent {
  id: string
  current: number
  total: number
  fileName: string
  status: 'uploading' | 'uploaded' | 'failed'
  message?: string
}

export interface UploadResult {
  total: number
  uploaded: number
  failed: number
}

export interface ConnectionResult {
  online: boolean
}

export interface TokenStatus {
  saved: boolean
}

export interface ConnectionTest {
  ok: boolean
  user?: string
  message?: string
}

export interface CameraBackupPlugin {
  requestPermissions(): Promise<PermissionResult>
  checkPermissions(): Promise<PermissionResult>
  openAppSettings(): Promise<void>
  listCameraPhotos(options?: { limit?: number }): Promise<{ photos: CameraPhoto[] }>
  uploadCameraPhotos(options: { folder?: string }): Promise<UploadResult>
  isOnline(): Promise<ConnectionResult>
  saveToken(options: { token: string }): Promise<void>
  hasToken(): Promise<TokenStatus>
  testConnection(): Promise<ConnectionTest>
  clearToken(): Promise<void>
}

interface UploadEvents {
  addListener(
    eventName: 'uploadProgress',
    listener: (event: UploadProgressEvent) => void,
  ): Promise<PluginListenerHandle>
}

export const CameraBackup = registerPlugin<CameraBackupPlugin>('CameraBackup', {
  web: () => import('./CameraBackupWeb').then((module) => new module.CameraBackupWeb()),
})

export function onUploadProgress(listener: (event: UploadProgressEvent) => void): Promise<PluginListenerHandle> {
  return (CameraBackup as unknown as UploadEvents).addListener('uploadProgress', listener)
}
