import { WebPlugin } from '@capacitor/core'
import type { NfcForgePlugin, NfcReadResult, NfcStatus, NfcWriteResult } from './NfcForge'

const unavailable = (): never => {
  throw new Error('NFC is only available in the QR-JOE Forge Android app.')
}

export class NfcForgeWeb extends WebPlugin implements NfcForgePlugin {
  async status(): Promise<NfcStatus> {
    return { available: false, enabled: false }
  }

  async openSettings(): Promise<void> {
    return
  }

  async writeTag(): Promise<NfcWriteResult> {
    return unavailable()
  }

  async readTag(): Promise<NfcReadResult> {
    return unavailable()
  }

  async cancel(): Promise<void> {
    return
  }
}
