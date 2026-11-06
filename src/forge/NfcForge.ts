import { registerPlugin } from '@capacitor/core'

export interface NfcStatus {
  available: boolean
  enabled: boolean
}

export interface NdefRecordInfo {
  tnf: number
  type: string
  mime?: string
  value: string
}

export interface NfcTagDescriptor {
  uid: string
  uidBytes: number
  techs: string[]
}

export interface NfcWriteResult extends NfcTagDescriptor {
  bytes: number
  maxSize: number
  records: number
}

export interface NfcReadResult extends NfcTagDescriptor {
  records: NdefRecordInfo[]
  maxSize: number
  writable: boolean
}

export interface NfcFormatResult extends NfcTagDescriptor {
  formatted: boolean
  path: 'ndef' | 'formatable'
  maxSize: number
}

export interface NfcLockResult extends NfcTagDescriptor {
  locked: boolean
  writable: boolean
  maxSize: number
}

export interface NfcInfoResult extends NfcTagDescriptor {
  formatted: boolean
  writable: boolean
  maxSize: number
  records: number
}

export interface NfcForgePlugin {
  status(): Promise<NfcStatus>
  openSettings(): Promise<void>
  writeTag(options: { url?: string; vcard?: string; primary?: 'online' | 'offline' }): Promise<NfcWriteResult>
  readTag(): Promise<NfcReadResult>
  formatTag(): Promise<NfcFormatResult>
  lockTag(): Promise<NfcLockResult>
  infoTag(): Promise<NfcInfoResult>
  cancel(): Promise<void>
}

export const NfcForge = registerPlugin<NfcForgePlugin>('NfcForge', {
  web: () => import('./NfcForgeWeb').then((module) => new module.NfcForgeWeb()),
})
