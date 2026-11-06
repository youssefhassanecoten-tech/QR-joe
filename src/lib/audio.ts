export const TONE_PREFIX = 'QRJOE:TONE:1'

const SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

export interface ToneNote {
  midi: number | null
  beats: number
}

export interface Melody {
  bpm: number
  notes: ToneNote[]
}

export interface TonePreset {
  id: string
  name: string
  bpm: number
  notes: string
}

export const tonePresets: TonePreset[] = [
  { id: 'chime', name: 'Chime', bpm: 120, notes: 'C5/2;E5/2;G5/2;C6/4' },
  { id: 'ping', name: 'Ping', bpm: 140, notes: 'A5/1;E5/1;A5/3' },
  { id: 'doorbell', name: 'Doorbell', bpm: 110, notes: 'E5/1;C5/1;G5/1;R/1;E5/3' },
  { id: 'startup', name: 'Startup', bpm: 130, notes: 'C5/1;E5/1;G5/1;C6/1;G5/1;E5/3' },
  { id: 'alert', name: 'Alert', bpm: 160, notes: 'A5/1;R/1;A5/1;R/1;A5/1;R/1;A5/3' },
  { id: 'soft', name: 'Soft', bpm: 96, notes: 'C5/2;D5/2;E5/2;G5/2;E5/2;D5/4' },
]

function midiFromToken(token: string): number | null {
  const rest = token.match(/^R(?:\/(\d*\.?\d+))?$/i)
  if (rest) return null
  const match = token.match(/^([A-G])(#|b)?(-?\d)(?:\/(\d*\.?\d+))?$/i)
  if (!match) return null
  const letter = match[1].toUpperCase()
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0
  const octave = Number(match[3])
  return (octave + 1) * 12 + (SEMITONES[letter] ?? 0) + accidental
}

function beatsFromToken(token: string): number {
  const match = token.match(/\/(\d*\.?\d+)$/)
  const value = match ? Number(match[1]) : 1
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function buildTonePayload(bpm: number, notation: string): string {
  const notes = notation.trim()
  if (!notes) return ''
  const safeBpm = Math.round(Math.min(240, Math.max(40, bpm || 120)))
  return `${TONE_PREFIX}:${safeBpm}:${notes}`
}

export function parseTonePayload(data: string): Melody | null {
  const value = data.trim()
  if (!value.startsWith(`${TONE_PREFIX}:`)) return null
  const rest = value.slice(TONE_PREFIX.length + 1)
  const separator = rest.indexOf(':')
  if (separator === -1) return null
  const bpm = Number(rest.slice(0, separator))
  const notation = rest.slice(separator + 1)
  if (!Number.isFinite(bpm) || bpm < 20 || bpm > 300) return null
  const tokens = notation
    .split(';')
    .map((token) => token.trim())
    .filter(Boolean)
  if (tokens.length === 0) return null
  const notes: ToneNote[] = []
  for (const token of tokens) {
    const midi = midiFromToken(token)
    if (midi === null && !/^R(?:\/|$)/i.test(token)) return null
    notes.push({ midi, beats: beatsFromToken(token) })
  }
  return { bpm, notes }
}

export function isTonePayload(data: string): boolean {
  return parseTonePayload(data) !== null
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

let activeContext: AudioContext | null = null
let endTimer: number | null = null

export function stopMelody(): void {
  if (endTimer !== null) {
    window.clearTimeout(endTimer)
    endTimer = null
  }
  if (activeContext) {
    const ctx = activeContext
    activeContext = null
    void ctx.close().catch(() => undefined)
  }
}

export async function playMelody(melody: Melody, onEnd?: () => void): Promise<number> {
  stopMelody()
  const ctx = new AudioContext()
  activeContext = ctx
  if (ctx.state === 'suspended') await ctx.resume()

  const master = ctx.createGain()
  master.gain.value = 0.16
  master.connect(ctx.destination)

  const beat = 60 / melody.bpm
  let time = ctx.currentTime + 0.06

  for (const note of melody.notes) {
    const duration = Math.max(0.08, note.beats * beat)
    if (note.midi !== null) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = midiToFrequency(note.midi)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.9, time + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.94)
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(time)
      oscillator.stop(time + duration)
    }
    time += duration
  }

  const totalMs = Math.max(300, Math.round((time - ctx.currentTime) * 1000) + 120)
  endTimer = window.setTimeout(() => {
    stopMelody()
    onEnd?.()
  }, totalMs)
  return totalMs
}

export async function playTonePayload(data: string, onEnd?: () => void): Promise<boolean> {
  const melody = parseTonePayload(data)
  if (!melody) return false
  await playMelody(melody, onEnd)
  return true
}
