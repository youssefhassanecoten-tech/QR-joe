import { useMemo, useState } from 'react'
import {
  Copy,
  Download,
  ExternalLink,
  History as HistoryIcon,
  ScanLine,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { HistoryEntry } from '../types'
import { relativeTime, safeExternalUrl, truncate } from '../lib/utils'
import { useI18n } from '../i18n'
import { useNotice } from '../hooks/useNotice'
import { NoticeBar } from '../components/NoticeBar'
import { Badge, Button, EmptyState, IconButton, Panel, Segmented, TextInput } from '../components/ui'

type Filter = 'all' | 'scanned' | 'generated'

export function History({
  entries,
  onDelete,
  onClear,
  onReuse,
}: {
  entries: HistoryEntry[]
  onDelete: (id: string) => void
  onClear: () => void
  onReuse: (data: string) => void
}) {
  const { t } = useI18n()
  const { notice, notify, dismiss } = useNotice()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const kindFiltered = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter)
    const needle = query.trim().toLowerCase()
    if (!needle) return kindFiltered
    return kindFiltered.filter((entry) =>
      [entry.label, entry.data, entry.contentType, entry.kind].some((part) =>
        part.toLowerCase().includes(needle),
      ),
    )
  }, [entries, filter, query])

  const copyEntry = async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.data)
      notify('Entry copied to clipboard.')
    } catch {
      notify('Clipboard access was blocked.', 'error')
    }
  }

  const openEntry = (entry: HistoryEntry) => {
    const url = safeExternalUrl(entry.data)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            <HistoryIcon className="h-3.5 w-3.5" />
            Activity
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">History</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            Every scan and export lives here, on this device. Reuse a payload in the Studio or clear the log any time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{entries.length} entries</Badge>
          <Button
            variant="danger"
            size="sm"
            disabled={entries.length === 0}
            onClick={() => {
              if (!window.confirm(t('Clear the entire history? This cannot be undone.'))) return
              onClear()
              notify('History cleared.', 'info')
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All (${entries.length})` },
            { value: 'scanned', label: 'Scanned' },
            { value: 'generated', label: 'Generated' },
          ]}
          columns={3}
          className="w-full max-w-md"
        />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search history..."
            className="pl-9"
            aria-label="Search history"
          />
        </div>
        <div className="w-full sm:w-auto">
          <NoticeBar notice={notice} onDismiss={dismiss} />
        </div>
      </div>

      <Panel className="p-3 sm:p-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title={query.trim() ? 'No matches' : 'Nothing here yet'}
            description={
              query.trim()
                ? `No entries match "${query.trim()}".`
                : 'Scan a code or export one from the Studio and it will show up in this log.'
            }
          />
        ) : (
          <div className="space-y-1.5">
            {filtered.map((entry) => {
              const openable = Boolean(safeExternalUrl(entry.data))
              return (
                <div
                  key={entry.id}
                  className="group flex flex-wrap items-center gap-3 rounded-xl border border-white/6 bg-black/15 px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.035]"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${
                      entry.kind === 'scanned'
                        ? 'bg-aqua-500/15 text-aqua-300 ring-aqua-400/20'
                        : 'bg-brand-500/15 text-brand-300 ring-brand-400/20'
                    }`}
                  >
                    {entry.kind === 'scanned' ? <ScanLine className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={entry.kind === 'scanned' ? 'brand' : 'success'}>{entry.contentType}</Badge>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                        {entry.kind} · {relativeTime(entry.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-zinc-300">
                      {truncate(entry.label || entry.data, 180)}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-70 transition group-hover:opacity-100">
                    {openable ? (
                      <IconButton size="icon-sm" aria-label="Open link" onClick={() => openEntry(entry)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </IconButton>
                    ) : null}
                    <IconButton size="icon-sm" aria-label="Copy data" onClick={() => copyEntry(entry)}>
                      <Copy className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton size="icon-sm" aria-label="Reuse in Studio" onClick={() => onReuse(entry.data)}>
                      <Download className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton size="icon-sm" variant="danger" aria-label="Delete entry" onClick={() => onDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
