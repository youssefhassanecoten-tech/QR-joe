import { useEffect, useState } from 'react'
import { Download, Sparkles, X } from 'lucide-react'
import { VERSION } from '../version'
import { checkForUpdate, dismissUpdate, readUpdateFeed, type UpdateInfo } from '../lib/update'
import { localized, useI18n } from '../i18n'

export function UpdateBanner() {
  const { lang, t } = useI18n()
  const [info, setInfo] = useState<UpdateInfo | null>(null)

  useEffect(() => {
    const feed = readUpdateFeed()
    if (!feed) return
    let cancelled = false
    void checkForUpdate(feed, VERSION).then((result) => {
      if (!cancelled && result.info) setInfo(result.info)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!info) return null

  const notes = typeof info.notes === 'string' ? { en: info.notes, ru: info.notes } : info.notes
  const url = /^https?:\/\//i.test(info.url ?? '') ? info.url : null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 animate-fade-up">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/40">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brand-100">
          {t('Update available')} {info.version}
        </p>
        {notes ? <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">{localized(lang, notes)}</p> : null}
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-aqua-500 px-3 text-[11px] font-semibold text-white shadow transition hover:brightness-110"
        >
          <Download className="h-3.5 w-3.5" />
          {t('Download')}
        </a>
      ) : null}
      <button
        type="button"
        aria-label={t('Dismiss update')}
        onClick={() => {
          dismissUpdate(info.version)
          setInfo(null)
        }}
        className="rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}


