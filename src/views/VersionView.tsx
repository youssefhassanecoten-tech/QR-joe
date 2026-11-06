import { useState } from 'react'
import { ArrowLeft, BookOpen, Lock, RefreshCw, Sparkles } from 'lucide-react'
import { currentRelease, historyWithinMajorLimit, MAX_MAJOR_HISTORY, VERSION } from '../version'
import { localized, useI18n } from '../i18n'
import { checkForUpdate, readUpdateFeed, saveUpdateFeed } from '../lib/update'
import { Badge, Button, Panel, SectionHeading, TextInput } from '../components/ui'

function formatDate(value: string, lang: 'en' | 'ru'): string {
  return new Date(value).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function VersionView({ onBack, onReplayTutorial }: { onBack: () => void; onReplayTutorial: () => void }) {
  const { lang, t } = useI18n()
  const history = historyWithinMajorLimit()
  const [feed, setFeed] = useState(readUpdateFeed())
  const [checkState, setCheckState] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-1">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('common.back')}
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            QR-JOE
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('version.title')}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">{t('version.subtitle')}</p>
        </div>
        <Badge tone="brand">
          v{VERSION}
        </Badge>
      </header>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {t('version.current')}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-white">v{VERSION}</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              {t('version.released')}: {formatDate(currentRelease.date, lang)}
            </p>
          </div>
          <Badge tone="success">{t('version.latest')}</Badge>
        </div>

        <h2 className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          <BookOpen className="h-3.5 w-3.5 text-brand-300" />
          {t('version.currentChanges')}
        </h2>
        <ul className="mt-3 space-y-2">
          {currentRelease.changes.map((change) => (
            <li key={change.en} className="flex gap-2.5 text-[12px] leading-relaxed text-zinc-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {localized(lang, change)}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">{t('version.previousChanges')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onReplayTutorial}>
              <Sparkles className="h-3.5 w-3.5" />
              {t('version.replay')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="cursor-not-allowed opacity-40 grayscale"
              title={`${t('version.pdf')} — ${t('version.pdfNote')}`}
            >
              <Lock className="h-3.5 w-3.5" />
              {t('version.pdf')}
            </Button>
          </div>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
          {t('version.pdfNote')} · {t('version.majorLimit')}
        </p>

        <div className="mt-4 space-y-2">
          {history.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-5 text-center text-[11px] text-zinc-500">
              {t('version.emptyHistory')}
            </p>
          ) : (
            history.map((release) => (
              <details
                key={release.version}
                className="group overflow-hidden rounded-xl border border-white/8 bg-black/15"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 transition hover:bg-white/[0.03]">
                  <span className="font-mono text-xs font-semibold text-zinc-200">v{release.version}</span>
                  <span className="text-[10px] text-zinc-600">{formatDate(release.date, lang)}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600">
                    {release.changes.length} {t('version.changeCount')}
                  </span>
                </summary>
                <ul className="space-y-2 border-t border-white/6 px-4 py-3">
                  {release.changes.map((change) => (
                    <li key={change.en} className="flex gap-2 text-[11px] leading-relaxed text-zinc-400">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      {localized(lang, change)}
                    </li>
                  ))}
                </ul>
              </details>
            ))
          )}
        </div>
        <p className="mt-3 text-[10px] text-zinc-600">
          {t('version.majorLimit').replace('7', String(MAX_MAJOR_HISTORY))}
        </p>
      </Panel>

      <Panel className="p-5">
        <SectionHeading
          icon={RefreshCw}
          title="Automatic updates"
          description="Point the app at a version feed to get update prompts."
        />
        <div className="mt-4 space-y-3">
          <TextInput
            value={feed}
            onChange={(event) => setFeed(event.target.value)}
            placeholder="https://your-host/qrjoe-update.json"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                saveUpdateFeed(feed)
                setCheckState('Update feed saved.')
              }}
            >
              {t('Save')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!feed}
              onClick={async () => {
                setCheckState('Checking…')
                const result = await checkForUpdate(feed, VERSION)
                if (result.info) setCheckState(`${t('Update available')} ${result.info.version}`)
                else if (result.error && result.error !== 'no-feed') setCheckState(`${t('Error:')} ${result.error}`)
                else setCheckState(t('No updates.'))
              }}
            >
              {t('Check')}
            </Button>
          </div>
          {checkState ? <p className="text-[11px] text-zinc-400">{checkState}</p> : null}
          <p className="text-[10px] leading-relaxed text-zinc-600">{t('Update feed format:')}</p>
          <pre className="overflow-auto rounded-lg border border-white/6 bg-black/30 p-2.5 font-mono text-[9px] leading-relaxed text-zinc-500">
            {`{"version":"4.2.0","url":"https://host/QR-JOE.apk","notes":{"en":"…","ru":"…"}}`}
          </pre>
        </div>
      </Panel>
    </div>
  )
}
