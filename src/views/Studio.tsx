import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Image,
  Save,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import type { CardProfile, ContentState, HistoryEntry, QrDesign } from '../types'
import { defaultDesign } from '../types'
import { buildPayload, contentTypeLabel, payloadLabel } from '../lib/payload'
import { copyPngToClipboard, exportBatchPng, exportPdf, exportPng, exportSvg } from '../lib/export'
import { useNotice } from '../hooks/useNotice'
import { uid } from '../lib/utils'
import { ContentFields } from '../components/ContentFields'
import { DesignControls } from '../components/DesignControls'
import { MotionSettingsPanel } from '../components/MotionSettingsPanel'
import { NoticeBar } from '../components/NoticeBar'
import { QrPreview } from '../components/QrPreview'
import { Badge, Button, Panel, SectionHeading, Spinner } from '../components/ui'

type ExportKind = 'png' | 'svg' | 'pdf' | 'image' | null

export function Studio({
  content,
  setContent,
  design,
  setDesign,
  profiles,
  onGoToCards,
  onAddHistory,
}: {
  content: ContentState
  setContent: Dispatch<SetStateAction<ContentState>>
  design: QrDesign
  setDesign: Dispatch<SetStateAction<QrDesign>>
  profiles: CardProfile[]
  onGoToCards: () => void
  onAddHistory: (entry: HistoryEntry) => void
}) {
  const { notice, notify, dismiss } = useNotice()
  const [busy, setBusy] = useState<ExportKind>(null)

  const payload = useMemo(() => buildPayload(content, profiles), [content, profiles])
  const label = useMemo(() => payloadLabel(content, profiles), [content, profiles])
  const patchDesign = (patch: Partial<QrDesign>) => setDesign((prev) => ({ ...prev, ...patch }))

  const record = () => {
    if (!payload.trim()) return
    onAddHistory({
      id: uid(),
      kind: 'generated',
      contentType: contentTypeLabel(content.type),
      label,
      data: payload,
      createdAt: Date.now(),
    })
  }

  const runExport = async (kind: Exclude<ExportKind, null>, task: () => Promise<void>, success: string) => {
    if (!payload.trim()) {
      notify('Add some content before exporting.', 'error')
      return
    }
    setBusy(kind)
    try {
      await task()
      record()
      notify(success)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Export failed. Try again.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const copyData = async () => {
    if (!payload.trim()) return
    try {
      await navigator.clipboard.writeText(payload)
      notify('Payload copied to clipboard.')
    } catch {
      notify('Clipboard access was blocked.', 'error')
    }
  }

  const saveToHistory = () => {
    if (!payload.trim()) {
      notify('Nothing to save yet.', 'error')
      return
    }
    record()
    notify('Saved to history.')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Create
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            QR Studio
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            One canvas for every code. Encode links, contact cards, Wi-Fi and more — then style every module and
            export print-ready assets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">
            <CheckCircle2 className="h-3 w-3" />
            Offline-first
          </Badge>
          <Badge tone="brand">{design.size}px export</Badge>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <aside className="order-first space-y-4 xl:sticky xl:top-6 xl:order-last xl:self-start" data-tour="preview-export">
          <Panel className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-white">Live preview</h2>
                <p className="text-[11px] text-zinc-500">Updates as you type — export matches exactly.</p>
              </div>
              <Badge tone="brand">{contentTypeLabel(content.type)}</Badge>
            </div>

            <QrPreview payload={payload} design={design} />

            <div className="mt-4 space-y-2.5">
              <NoticeBar notice={notice} onDismiss={dismiss} />

              <Button
                variant="primary"
                className="w-full"
                disabled={busy !== null || !payload.trim()}
                onClick={() =>
                  runExport(
                    'png',
                    () =>
                      content.type === 'batch'
                        ? exportBatchPng(
                            content.batch.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                            design,
                            label,
                          )
                        : exportPng(payload, design, label),
                    content.type === 'batch' ? 'Batch PNG exported.' : 'PNG exported - ready to share.',
                  )
                }
              >
                {busy === 'png' ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                Download PNG
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  disabled={busy !== null || !payload.trim()}
                  onClick={() =>
                    runExport('svg', () => exportSvg(payload, design, label), 'SVG exported — scalable vector.')
                  }
                >
                  {busy === 'svg' ? <Spinner className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                  SVG
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy !== null || !payload.trim()}
                  onClick={() =>
                    runExport('pdf', () => exportPdf(payload, design, label), 'PDF exported — print ready.')
                  }
                >
                  {busy === 'pdf' ? <Spinner className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  PDF
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  disabled={busy !== null || !payload.trim()}
                  onClick={() =>
                    runExport(
                      'image',
                      () => copyPngToClipboard(payload, design),
                      'QR image copied to clipboard.',
                    )
                  }
                >
                  {busy === 'image' ? <Spinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy image
                </Button>
                <Button variant="ghost" disabled={!payload.trim()} onClick={copyData}>
                  <Copy className="h-4 w-4" />
                  Copy data
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="w-full" disabled={!payload.trim()} onClick={saveToHistory}>
                <Save className="h-3.5 w-3.5" />
                Save to history
              </Button>
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Payload</h3>
              <span className="font-mono text-[10px] text-zinc-500">{payload.length} chars</span>
            </div>
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-white/6 bg-black/30 p-2.5 font-mono text-[10px] leading-relaxed text-zinc-400">
              {payload.trim() || '— waiting for content —'}
            </pre>
            {payload.length > 2600 ? (
              <p className="mt-2 text-[11px] leading-relaxed text-amber-300">
                Large payload. Raise error correction or simplify the content if scanning is unreliable.
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/6 bg-white/[0.02] px-2.5 py-2 text-[10px] text-zinc-500">
              <ScanLine className="h-3.5 w-3.5 text-brand-300" />
              Scans are processed on-device. Nothing is uploaded.
            </div>
          </Panel>
        </aside>

        <div className="order-last space-y-5 xl:order-first">
          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={ScanLine}
              title="Content"
              description="Choose what the code should say. Every field maps to a standards-compliant payload."
            />
            <div className="mt-4">
              <ContentFields
                content={content}
                setContent={setContent}
                profiles={profiles}
                onGoToCards={onGoToCards}
              />
            </div>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={Sparkles}
              title="Customization"
              description="Shape, colors, frames, logos and print settings — dial everything in."
            />
            <div className="mt-4">
              <DesignControls
                design={design}
                setDesign={patchDesign}
                onReset={() => {
                  setDesign({ ...defaultDesign })
                  notify('Design reset to defaults.', 'info')
                }}
              />
            </div>
          </Panel>

          <MotionSettingsPanel />
        </div>
      </div>
    </div>
  )
}
