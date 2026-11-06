import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Maximize2, QrCode, X } from 'lucide-react'
import type { QrDesign } from '../types'
import { renderCompositeDataUrl } from '../lib/render'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useScanSound } from '../scanSound'
import { AnimationCascade } from './AnimationCascade'
import { qrAnimationClass } from '../lib/animations'
import { cn } from '../lib/utils'
import { Spinner } from './ui'

export function QrPreview({
  payload,
  design,
  renderSize = 720,
  className,
  onActivate,
  hideZoomIcon = false,
}: {
  payload: string
  design: QrDesign
  renderSize?: number
  className?: string
  onActivate?: () => void
  hideZoomIcon?: boolean
}) {
  const { qrAnimationStyle, qrCascade } = useScanSound()
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const designKey = JSON.stringify(design)
  const debouncedPayload = useDebouncedValue(payload, 160)
  const debouncedDesignKey = useDebouncedValue(designKey, 160)

  useEffect(() => {
    if (!debouncedPayload.trim()) return
    let cancelled = false
    setBusy(true)
    const snapshot = JSON.parse(debouncedDesignKey) as QrDesign
    renderCompositeDataUrl(debouncedPayload, snapshot, renderSize)
      .then((url) => {
        if (cancelled) return
        setSrc(url)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setSrc(null)
        setError(reason instanceof Error ? reason.message : 'Could not render this QR code')
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedPayload, debouncedDesignKey, renderSize])

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreen])

  const empty = !payload.trim()
  const animationClass = qrAnimationClass(qrAnimationStyle)
  const qrImage = src ? (
    <img
      key={`${src}-${qrAnimationStyle}`}
      src={src}
      alt="Generated QR code preview"
      draggable={false}
      className={cn(
        'h-full w-full object-contain p-3 drop-shadow-[0_18px_45px_rgba(0,0,0,0.55)]',
        qrAnimationStyle === 'cascade' ? '' : animationClass,
      )}
    />
  ) : null

  return (
    <>
      <div
        className={cn(
          'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl',
          'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.055)_1px,transparent_0)] [background-size:16px_16px]',
          src && !empty && 'cursor-zoom-in',
          className,
        )}
        onClick={() => {
          if (!src || empty) return
          if (onActivate) onActivate()
          else setFullscreen(true)
        }}
        role={src && !empty ? 'button' : undefined}
        tabIndex={src && !empty ? 0 : undefined}
        onKeyDown={(event) => {
          if (src && !empty && (event.key === 'Enter' || event.key === ' ')) {
            if (onActivate) onActivate()
            else setFullscreen(true)
          }
        }}
      >
        {empty ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <QrCode className="h-8 w-8 text-zinc-600" />
            <p className="max-w-[220px] text-[11px] leading-relaxed text-zinc-500">
              Fill in the content panel to see your code come to life.
            </p>
          </div>
        ) : src ? (
          <>
            {qrAnimationStyle === 'cascade' ? (
              <AnimationCascade layers={qrCascade} className="h-full w-full">
                {qrImage}
              </AnimationCascade>
            ) : (
              qrImage
            )}
            {qrAnimationStyle === 'shine' ? (
              <span className="cascade-shine" style={{ animationDuration: '1200ms' }} />
            ) : null}
            {qrAnimationStyle === 'scanline' ? (
              <span className="pointer-events-none absolute inset-x-8 top-1/2 h-px animate-qr-sweep bg-gradient-to-r from-transparent via-aqua-300 to-transparent shadow-[0_0_20px_2px] shadow-aqua-400/50" />
            ) : null}
            {hideZoomIcon ? null : (
              <span className="pointer-events-none absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-zinc-300 ring-1 ring-white/10">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            )}
          </>
        ) : error ? (
          <div className="flex max-w-[85%] flex-col items-center gap-2 text-center">
            <AlertTriangle className="h-7 w-7 text-amber-300" />
            <p className="text-xs font-semibold text-amber-200">Unable to render</p>
            <p className="text-[11px] leading-relaxed text-zinc-400">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <QrCode className="h-8 w-8 text-zinc-600" />
            <p className="max-w-[220px] text-[11px] leading-relaxed text-zinc-500">
              Fill in the content panel to see your code come to life.
            </p>
          </div>
        )}

        {busy && src && !empty ? (
          <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-brand-300 ring-1 ring-white/10">
            <Spinner className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      {fullscreen && src
        ? createPortal(
            <div
              className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setFullscreen(false)}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Close full screen"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={src}
                alt="Enlarged QR code"
                draggable={false}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[86vh] max-w-[92vw] animate-qr-reveal rounded-2xl object-contain shadow-2xl shadow-black/60"
              />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}


