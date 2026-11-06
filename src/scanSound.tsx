import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { buildTonePayload, parseTonePayload, playMelody, stopMelody, tonePresets } from './lib/audio'

export type CardAnimationStyle = 'rise' | 'fade' | 'glow' | 'shine' | 'pulse' | 'flip' | 'bounce' | 'cascade' | 'none'

export type QrAnimationStyle = 'reveal' | 'fade' | 'scale' | 'scanline' | 'glow' | 'shine' | 'pulse' | 'cascade' | 'none'

export type CascadeEffect = 'fade' | 'rise' | 'scale' | 'flip' | 'bounce' | 'glow' | 'pulse' | 'shine'

export interface CascadeLayer {
  id: string
  effect: CascadeEffect
  delay: number
  duration: number
  repeat: boolean
}

export interface ScanSoundSettings {
  enabled: boolean
  presetId: string
  cardAnimation: boolean
  cardAnimationStyle: CardAnimationStyle
  qrAnimationStyle: QrAnimationStyle
  cardCascade: CascadeLayer[]
  qrCascade: CascadeLayer[]
}

const STORAGE_KEY = 'qrjoe:scan-sound'

const defaults: ScanSoundSettings = {
  enabled: false,
  presetId: tonePresets[0].id,
  cardAnimation: true,
  cardAnimationStyle: 'rise',
  qrAnimationStyle: 'reveal',
  cardCascade: [
    { id: 'card-fade', effect: 'fade', delay: 0, duration: 500, repeat: false },
    { id: 'card-glow', effect: 'glow', delay: 250, duration: 1800, repeat: true },
  ],
  qrCascade: [
    { id: 'qr-scale', effect: 'scale', delay: 0, duration: 500, repeat: false },
    { id: 'qr-shine', effect: 'shine', delay: 250, duration: 1200, repeat: false },
    { id: 'qr-glow', effect: 'glow', delay: 500, duration: 1800, repeat: true },
  ],
}

const CARD_EFFECTS: CascadeEffect[] = ['fade', 'rise', 'scale', 'flip', 'bounce', 'glow', 'pulse', 'shine']

function readCascade(value: unknown, fallback: CascadeLayer[]): CascadeLayer[] {
  if (!Array.isArray(value)) return fallback
  const layers: CascadeLayer[] = []
  for (const item of value.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue
    const layer = item as Partial<CascadeLayer>
    if (!layer.effect || !CARD_EFFECTS.includes(layer.effect)) continue
    layers.push({
      id: typeof layer.id === 'string' ? layer.id : `layer-${layers.length}-${Date.now()}`,
      effect: layer.effect,
      delay: Number.isFinite(layer.delay) ? Math.max(0, Math.min(5000, Number(layer.delay))) : 0,
      duration: Number.isFinite(layer.duration) ? Math.max(200, Math.min(6000, Number(layer.duration))) : 600,
      repeat: Boolean(layer.repeat),
    })
  }
  return layers.length > 0 ? layers : fallback
}

function readSettings(): ScanSoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<ScanSoundSettings>
    return {
      enabled: Boolean(parsed.enabled),
      presetId:
        typeof parsed.presetId === 'string' && tonePresets.some((preset) => preset.id === parsed.presetId)
          ? parsed.presetId
          : defaults.presetId,
      cardAnimation: parsed.cardAnimation !== false,
      cardAnimationStyle: (['rise','fade','glow','shine','pulse','flip','bounce','cascade','none'] as const).includes(parsed.cardAnimationStyle as never)
        ? (parsed.cardAnimationStyle as CardAnimationStyle)
        : 'rise',
      qrAnimationStyle: (['reveal','fade','scale','scanline','glow','shine','pulse','cascade','none'] as const).includes(parsed.qrAnimationStyle as never)
        ? (parsed.qrAnimationStyle as QrAnimationStyle)
        : 'reveal',
      cardCascade: readCascade(parsed.cardCascade, defaults.cardCascade),
      qrCascade: readCascade(parsed.qrCascade, defaults.qrCascade),
    }
  } catch {
    return defaults
  }
}

function melodyForPreset(presetId: string) {
  const preset = tonePresets.find((item) => item.id === presetId) ?? tonePresets[0]
  return parseTonePayload(buildTonePayload(preset.bpm, preset.notes))
}

interface ScanSoundContextValue extends ScanSoundSettings {
  setEnabled: (enabled: boolean) => void
  setPresetId: (presetId: string) => void
  setCardAnimation: (enabled: boolean) => void
  setCardAnimationStyle: (style: CardAnimationStyle) => void
  setQrAnimationStyle: (style: QrAnimationStyle) => void
  setCardCascade: (layers: CascadeLayer[]) => void
  setQrCascade: (layers: CascadeLayer[]) => void
  play: () => Promise<void>
  preview: () => Promise<number>
  stop: () => void
}

const ScanSoundContext = createContext<ScanSoundContextValue | null>(null)

export function ScanSoundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ScanSoundSettings>(readSettings)

  const persist = (next: ScanSoundSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage may be unavailable
    }
  }

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings((previous) => {
      const next = { ...previous, enabled }
      persist(next)
      return next
    })
  }, [])

  const setPresetId = useCallback((presetId: string) => {
    setSettings((previous) => {
      const next = { ...previous, presetId }
      persist(next)
      return next
    })
  }, [])

  const setCardAnimation = useCallback((cardAnimation: boolean) => {
    setSettings((previous) => {
      const next = { ...previous, cardAnimation }
      persist(next)
      return next
    })
  }, [])

  const setCardAnimationStyle = useCallback((cardAnimationStyle: CardAnimationStyle) => {
    setSettings((previous) => {
      const next = { ...previous, cardAnimationStyle }
      persist(next)
      return next
    })
  }, [])

  const setQrAnimationStyle = useCallback((qrAnimationStyle: QrAnimationStyle) => {
    setSettings((previous) => {
      const next = { ...previous, qrAnimationStyle }
      persist(next)
      return next
    })
  }, [])

  const setCardCascade = useCallback((cardCascade: CascadeLayer[]) => {
    setSettings((previous) => {
      const next = { ...previous, cardCascade }
      persist(next)
      return next
    })
  }, [])

  const setQrCascade = useCallback((qrCascade: CascadeLayer[]) => {
    setSettings((previous) => {
      const next = { ...previous, qrCascade }
      persist(next)
      return next
    })
  }, [])

  const play = useCallback(async () => {
    if (!settings.enabled) return
    const melody = melodyForPreset(settings.presetId)
    if (!melody) return
    try {
      await playMelody(melody)
    } catch {
      // autoplay/audio may be blocked; ignore
    }
  }, [settings.enabled, settings.presetId])

  const preview = useCallback(async () => {
    const melody = melodyForPreset(settings.presetId)
    if (!melody) return 0
    try {
      return await playMelody(melody)
    } catch {
      return 0
    }
  }, [settings.presetId])

  const stop = useCallback(() => stopMelody(), [])

  return (
    <ScanSoundContext.Provider
      value={{ ...settings, setEnabled, setPresetId, setCardAnimation, setCardAnimationStyle, setQrAnimationStyle, setCardCascade, setQrCascade, play, preview, stop }}
    >
      {children}
    </ScanSoundContext.Provider>
  )
}

export function useScanSound(): ScanSoundContextValue {
  const value = useContext(ScanSoundContext)
  if (!value) throw new Error('useScanSound must be used inside ScanSoundProvider')
  return value
}


