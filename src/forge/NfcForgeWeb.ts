import { WebPlugin } from '@capacitor/core'
import type {
  NfcForgePlugin,
  NfcFormatResult,
  NfcInfoResult,
  NfcLockResult,
  NfcReadResult,
  NfcStatus,
  NfcWriteResult,
} from './NfcForge'

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

  async formatTag(): Promise<NfcFormatResult> {
    return unavailable()
  }

  async lockTag(): Promise<NfcLockResult> {
    return unavailable()
  }

  async infoTag(): Promise<NfcInfoResult> {
    return unavailable()
  }

  async cancel(): Promise<void> {
    return
  }
}
