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

export interface NfcWriteResult {
  bytes: number
  maxSize: number
  records: number
}

export interface NfcReadResult {
  records: NdefRecordInfo[]
  maxSize: number
  writable: boolean
}

export interface NfcForgePlugin {
  status(): Promise<NfcStatus>
  openSettings(): Promise<void>
  writeTag(options: { url?: string; vcard?: string; primary?: 'online' | 'offline' }): Promise<NfcWriteResult>
  readTag(): Promise<NfcReadResult>
  cancel(): Promise<void>
}

export const NfcForge = registerPlugin<NfcForgePlugin>('NfcForge', {
  web: () => import('./NfcForgeWeb').then((module) => new module.NfcForgeWeb()),
})
