import { WebPlugin } from '@capacitor/core'
import type {
  CameraBackupPlugin,
  CameraPhoto,
  ConnectionResult,
  ConnectionTest,
  PermissionResult,
  TokenStatus,
  UploadResult,
} from './CameraBackup'

const unavailable: PermissionResult = {
  photos: 'unavailable',
  camera: 'unavailable',
  files: 'system-picker',
}

export class CameraBackupWeb extends WebPlugin implements CameraBackupPlugin {
  async requestPermissions(): Promise<PermissionResult> {
    return unavailable
  }

  async checkPermissions(): Promise<PermissionResult> {
    return unavailable
  }

  async openAppSettings(): Promise<void> {
    return
  }

  async listCameraPhotos(): Promise<{ photos: CameraPhoto[] }> {
    return { photos: [] }
  }

  async uploadCameraPhotos(): Promise<UploadResult> {
    throw this.unavailable('Camera photo backup is only available in the Android build.')
  }

  async isOnline(): Promise<ConnectionResult> {
    return { online: typeof navigator === 'undefined' ? true : navigator.onLine }
  }

  async saveToken(): Promise<void> {
    throw this.unavailable('Token storage is only available in the Android build.')
  }

  async hasToken(): Promise<TokenStatus> {
    return { saved: false }
  }

  async testConnection(): Promise<ConnectionTest> {
    return { ok: false, message: 'Yandex Disk connection is only available in the Android build.' }
  }

  async clearToken(): Promise<void> {
    return
  }
}
