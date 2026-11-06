import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, RefreshCw, X } from 'lucide-react'
import type { QrDesign } from '../types'
import { isLocalBase } from '../lib/cardLink'
import { QrPreview } from './QrPreview'
import { Button, IconButton } from './ui'
import { cn } from '../lib/utils'

export function DualQrModal({
  offlinePayload,
  onlinePayload,
  design,
  publicBase,
  onClose,
  onDownloadBoth,
  onDownloadNested,
}: {
  offlinePayload: string
  onlinePayload: string
  design: QrDesign
  publicBase: string
  onClose: () => void
  onDownloadBoth: () => void
  onDownloadNested: () => void
}) {
  const [side, setSide] = useState<'offline' | 'online'>('offline')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const flip = () => setSide((value) => (value === 'offline' ? 'online' : 'offline'))

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-ink-900 p-4 shadow-2xl shadow-black/60 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-white">Dual QR</h2>
            <p className="text-[11px] text-zinc-500">
              Tap the QR to flip between the offline contact and the online card.
            </p>
          </div>
          <IconButton size="icon-sm" aria-label="Close dual QR" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="mt-4" style={{ perspective: '1200px' }}>
          <div
            className={cn(
              'relative aspect-square w-full transition-transform duration-700 [transform-style:preserve-3d]',
              side === 'online' && '[transform:rotateY(180deg)]',
            )}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <QrPreview
                payload={offlinePayload}
                design={design}
                renderSize={720}
                onActivate={flip}
                hideZoomIcon
              />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 ring-1 ring-white/10">
                Offline
              </span>
            </div>
            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <QrPreview
                payload={onlinePayload}
                design={design}
                renderSize={720}
                onActivate={flip}
                hideZoomIcon
              />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-aqua-200 ring-1 ring-white/10">
                Online
              </span>
            </div>
          </div>
        </div>

        {isLocalBase(publicBase) ? (
          <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-100">
            Set a public HTTPS URL under “Public card URL” so other phones can open the online animated card.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={flip}>
            <RefreshCw className="h-3.5 w-3.5" />
            Flip QR
          </Button>
          <Button variant="primary" size="sm" onClick={onDownloadBoth}>
            <Download className="h-3.5 w-3.5" />
            Download both codes
          </Button>
          <Button variant="secondary" size="sm" onClick={onDownloadNested}>
            Nested QR (experimental)
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
