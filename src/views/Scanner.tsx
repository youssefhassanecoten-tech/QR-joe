import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  ExternalLink,
  History,
  ImagePlus,
  Play,
  ScanLine,
  Sparkles,
  Square,
  SwitchCamera,
  Trash2,
  Upload,
  Layers,
  X,
} from 'lucide-react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import type { HistoryEntry } from '../types'
import { parseTonePayload, playMelody, stopMelody } from '../lib/audio'
import { detectPayloadType } from '../lib/payload'
import { classifyDuoResults, decodeDoubleQr, decodeDoubleQrFromVideo, preferredDuoResult, type DoubleQrResult } from '../lib/doubleQr'
import { relativeTime, safeExternalUrl, truncate, uid } from '../lib/utils'
import { useNotice } from '../hooks/useNotice'
import { useScanSound } from '../scanSound'
import { NoticeBar } from '../components/NoticeBar'
import { ScanSoundPanel } from '../components/ScanSoundPanel'
import { ScannedResultCard } from '../components/ScannedResultCard'
import { Badge, Button, EmptyState, IconButton, Panel, SectionHeading, Spinner } from '../components/ui'

interface ScanResult {
  data: string
  type: string
  at: number
}

function cameraErrorMessage(reason: unknown): string {
  if (reason instanceof DOMException) {
    if (reason.name === 'NotAllowedError' || reason.name === 'SecurityError') {
      return 'Camera permission was denied. Allow access in your browser settings, or upload an image instead.'
    }
    if (reason.name === 'NotFoundError' || reason.name === 'OverconstrainedError') {
      return 'No camera was found on this device. You can still scan from an uploaded image.'
    }
    if (reason.name === 'NotReadableError') {
      return 'The camera is busy in another app. Close it and try again.'
    }
    return reason.message || 'The camera could not be started.'
  }
  return reason instanceof Error ? reason.message : 'The camera could not be started.'
}

export function Scanner({
  onDetected,
  history,
  onDeleteHistory,
  onReuseData,
  onGoToHistory,
}: {
  onDetected: (entry: HistoryEntry) => void
  history: HistoryEntry[]
  onDeleteHistory: (id: string) => void
  onReuseData: (data: string) => void
  onGoToHistory: () => void
}) {
  const { notice, notify, dismiss } = useNotice()
  const { play: playScanSound } = useScanSound()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastRef = useRef<string | null>(null)

  const [scanning, setScanning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [readingFile, setReadingFile] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [playingTone, setPlayingTone] = useState(false)
  const [multiResults, setMultiResults] = useState<DoubleQrResult[]>([])


  useEffect(() => {
    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
      stopMelody()
    }
  }, [])

  const handleDetected = (raw: string) => {
    const data = raw.trim()
    if (!data) return
    stopMelody()
    setPlayingTone(false)
    if (lastRef.current === data) return
    lastRef.current = data
    window.setTimeout(() => {
      if (lastRef.current === data) lastRef.current = null
    }, 2500)
    const type = detectPayloadType(data)
    setResult({ data, type, at: Date.now() })
    setScanning(false)
    setError(null)
    void playScanSound()
    try {
      navigator.vibrate?.(45)
    } catch {
      // vibration unsupported
    }
    notify('QR code scanned.', 'success')
    onDetected({
      id: uid(),
      kind: 'scanned',
      contentType: type,
      label: truncate(data, 70),
      data,
      createdAt: Date.now(),
    })
  }

  const start = async (nextFacing: 'environment' | 'user' = facing) => {
    if (!videoRef.current) return
    setError(null)
    setResult(null)
    setMultiResults([])
    setStarting(true)
    setScanning(false)
    let detected = false
    try {
      controlsRef.current?.stop()
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 160 })
      controlsRef.current = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        },
        videoRef.current,
        (decoded, _decodeError, controls) => {
          if (!decoded) return
          detected = true
          handleDetected(decoded.getText())
          controls.stop()
        },
      )
      if (!detected) setScanning(true)
    } catch (reason) {
      setError(cameraErrorMessage(reason))
      setScanning(false)
    } finally {
      setStarting(false)
    }
  }

  const stop = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setScanning(false)
  }

  const flip = async () => {
    const next = facing === 'environment' ? 'user' : 'environment'
    setFacing(next)
    stop()
    await start(next)
  }

  const chooseDuoResult = (results: DoubleQrResult[]): string =>
    preferredDuoResult(results, typeof navigator === 'undefined' ? false : navigator.onLine)

  const applyDuoResults = (results: DoubleQrResult[]) => {
    setMultiResults(results)
    handleDetected(chooseDuoResult(results))
  }

  const processFile = async (file: File) => {
    setReadingFile(true)
    setError(null)
    try {
      const results = await decodeDoubleQr(file)
      if (results.length === 0) {
        notify('No QR code was found in that image.', 'error')
        return
      }
      applyDuoResults(results)
    } catch {
      notify('No QR code was found in that image.', 'error')
    } finally {
      setReadingFile(false)
    }
  }

  const processFileRef = useRef(processFile)
  useEffect(() => {
    processFileRef.current = processFile
  })

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items ?? [])
      const file = items.find((entry) => entry.type.startsWith('image/'))?.getAsFile()
      if (!file) return
      event.preventDefault()
      void processFileRef.current(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  const pasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) throw new Error('unsupported')
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const type = item.types.find((entry) => entry.startsWith('image/'))
        if (!type) continue
        const blob = await item.getType(type)
        await processFile(new File([blob], 'pasted.png', { type }))
        return
      }
      notify('No image found in the clipboard.', 'error')
    } catch {
      notify('Press Ctrl+V (Cmd+V) to paste an image.', 'error')
    }
  }

  const DuoScan = async () => {
    if (!videoRef.current) return
    setReadingFile(true)
    setError(null)
    try {
      const results = await decodeDoubleQrFromVideo(videoRef.current)
      if (results.length === 0) {
        notify('No QR codes were found in this frame.', 'error')
        return
      }
      stop()
      applyDuoResults(results)
    } catch {
      notify('Duo scan failed. Try a sharper frame.', 'error')
    } finally {
      setReadingFile(false)
    }
  }

  const showDuoResult = (data: string) => {
    setResult({ data, type: detectPayloadType(data), at: Date.now() })
  }

  const duoClassification = multiResults.length > 0 ? classifyDuoResults(multiResults) : null
  const connected = typeof navigator !== 'undefined' ? navigator.onLine : false

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await processFile(file)
  }

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  const openLink = () => {
    if (!result) return
    const url = safeExternalUrl(result.data)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const copyResult = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.data)
      notify('Decoded data copied.')
    } catch {
      notify('Clipboard access was blocked.', 'error')
    }
  }

  const recent = history.filter((entry) => entry.kind === 'scanned').slice(0, 6)
  const openable = result ? Boolean(safeExternalUrl(result.data)) : false
  const tone = result ? parseTonePayload(result.data) : null
  const toggleTone = async () => {
    if (playingTone) {
      stopMelody()
      setPlayingTone(false)
      return
    }
    if (!tone) return
    setPlayingTone(true)
    try {
      await playMelody(tone, () => setPlayingTone(false))
    } catch {
      setPlayingTone(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-aqua-300">
            <ScanLine className="h-3.5 w-3.5" />
            Capture
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            QR Scanner
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            Point your camera at a code or drop in a screenshot. Decoding happens locally on this device.
          </p>
        </div>
        <Badge tone="success">
          <CheckCircle2 className="h-3 w-3" />
          On-device decoding
        </Badge>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
        <Panel className="p-4 sm:p-5">
          <SectionHeading
            icon={Camera}
            title="Camera"
            description="Grant camera access, then align the code inside the frame."
          />

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`camera-stage relative mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-black ring-1 transition ${
              dragging ? 'ring-2 ring-brand-400' : 'ring-white/10'
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover transition-opacity ${scanning ? 'opacity-100' : 'opacity-20'}`}
            />

            {scanning ? (
              <>
                <span className="pointer-events-none absolute left-6 top-6 h-10 w-10 rounded-tl-xl border-l-2 border-t-2 border-brand-400/80" />
                <span className="pointer-events-none absolute right-6 top-6 h-10 w-10 rounded-tr-xl border-r-2 border-t-2 border-brand-400/80" />
                <span className="pointer-events-none absolute bottom-6 left-6 h-10 w-10 rounded-bl-xl border-b-2 border-l-2 border-brand-400/80" />
                <span className="pointer-events-none absolute bottom-6 right-6 h-10 w-10 rounded-br-xl border-b-2 border-r-2 border-brand-400/80" />
                <span className="pointer-events-none absolute inset-x-10 top-1/2 h-px animate-scanline bg-gradient-to-r from-transparent via-aqua-300 to-transparent shadow-[0_0_24px_2px] shadow-aqua-400/50" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                {result ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-200">Code captured</p>
                    <p className="max-w-[240px] text-[11px] text-zinc-500">
                      Review the decoded content, or scan again.
                    </p>
                  </>
                ) : (
                  <>
                    <CameraOff className="h-8 w-8 text-zinc-600" />
                    <p className="text-xs font-semibold text-zinc-300">Camera is off</p>
                    <p className="max-w-[240px] text-[11px] leading-relaxed text-zinc-500">
                      Start the camera or drop a QR image anywhere in this panel.
                    </p>
                  </>
                )}
              </div>
            )}

            {dragging ? (
              <div className="absolute inset-2 grid place-items-center rounded-xl border-2 border-dashed border-brand-400/70 bg-brand-500/15 text-xs font-semibold text-brand-100 backdrop-blur-sm">
                Drop image to scan
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-3">
              {scanning ? (
                <Button variant="danger" size="sm" onClick={stop}>
                  <CameraOff className="h-3.5 w-3.5" />
                  Stop camera
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => start()} disabled={starting}>
                  {starting ? <Spinner className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                  {result ? 'Scan again' : 'Start camera'}
                </Button>
              )}
              {scanning ? (
                <Button variant="secondary" size="sm" onClick={flip}>
                  <SwitchCamera className="h-3.5 w-3.5" />
                  Flip
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={readingFile}
            >
              {readingFile ? <Spinner className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
              Upload image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void pasteFromClipboard()}
              disabled={readingFile}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void DuoScan()}
              disabled={!scanning || readingFile}
            >
              {readingFile ? <Spinner className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
              Duo scan
            </Button>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <ImagePlus className="h-3.5 w-3.5" />
              PNG, JPG, WebP or a screenshot
            </span>
          </div>

          {error ? (
            <div className="mt-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-2.5 text-[11px] leading-relaxed text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-3">
            <NoticeBar notice={notice} onDismiss={dismiss} />
          </div>
        </Panel>

        <div data-tour="scan-sound">
          <ScanSoundPanel />
        </div>
        </div>

        <div className="space-y-4">
          {multiResults.length > 1 ? (
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-semibold text-white">Duo scan</h2>
                <div className="flex items-center gap-1.5">
                  <Badge tone="brand">{multiResults.length} codes</Badge>
                  <Badge tone={connected ? 'success' : 'warning'}>
                    {connected ? 'Online priority' : 'Offline priority'}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Both codes were detected. The online code takes priority when connected.
              </p>
              <div className="mt-3 space-y-1.5">
                {multiResults.map((item) => (
                  <button
                    key={`${item.region}-${item.text}`}
                    type="button"
                    onClick={() => showDuoResult(item.text)}
                    className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-2.5 py-2 text-left transition hover:bg-white/[0.04]"
                  >
                    <Badge
                      tone={
                        item === duoClassification?.online
                          ? 'success'
                          : item === duoClassification?.offline
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {item === duoClassification?.online
                        ? 'Online'
                        : item === duoClassification?.offline
                          ? 'Offline'
                          : 'Code'}
                    </Badge>
                    <Badge>{detectPayloadType(item.text)}</Badge>
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-300">
                      {truncate(item.text, 90)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-600">{item.region}</span>
                  </button>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-white">Scan result</h2>
              {result ? (
                <Badge tone="brand">{result.type}</Badge>
              ) : (
                <Badge>waiting</Badge>
              )}
            </div>

            {result ? (
              <div className="mt-3 space-y-3 animate-fade-in">
                <ScannedResultCard result={result} />
                <details className="rounded-xl border border-white/8 bg-black/15 px-3 py-2">
                  <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {result.type === 'vCard' ? 'Raw vCard' : 'Raw payload'}
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-zinc-400">
                    {result.data}
                  </pre>
                </details>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={copyResult}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  {openable ? (
                    <Button size="sm" variant="primary" onClick={openLink}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Button>
                  ) : null}
                  {tone ? (
                    <Button size="sm" variant="secondary" onClick={toggleTone}>
                      {playingTone ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {playingTone ? 'Stop tone' : 'Play tone'}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="secondary" onClick={() => onReuseData(result.data)}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Use in Studio
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      stopMelody()
                      setPlayingTone(false)
                      setResult(null)
                      setMultiResults([])
                      stop()
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Scanned at {new Date(result.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={ScanLine}
                title="Nothing scanned yet"
                description="A decoded result will appear here with copy, open and reuse actions."
              />
            )}
          </Panel>

          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading title="Recent scans" icon={History} />
              <Button variant="ghost" size="sm" onClick={onGoToHistory}>
                View all
              </Button>
            </div>
            <div className="mt-3 space-y-1.5">
              {recent.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-6 text-center text-[11px] text-zinc-500">
                  Your scanned codes will be listed here.
                </p>
              ) : (
                recent.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-2 rounded-xl border border-white/6 bg-black/15 px-2.5 py-2 transition hover:bg-white/[0.04]"
                  >
                    <button
                      type="button"
                      onClick={() => setResult({ data: entry.data, type: entry.contentType, at: entry.createdAt })}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-mono text-[11px] text-zinc-300">{entry.data}</p>
                      <p className="text-[10px] text-zinc-600">
                        {entry.contentType} · {relativeTime(entry.createdAt)}
                      </p>
                    </button>
                    <IconButton
                      size="icon-sm"
                      aria-label="Delete scan"
                      onClick={() => onDeleteHistory(entry.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
