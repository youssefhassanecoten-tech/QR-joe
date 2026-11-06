import { Database, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n'
import { VERSION } from '../version'

export function SiteFooter({
  onOpenLegal,
  onOpenVersion,
  onReplayTutorial,
  onOpenData,
}: {
  onOpenLegal: () => void
  onOpenVersion: () => void
  onReplayTutorial: () => void
  onOpenData: () => void
}) {
  const { t } = useI18n()

  return (
    <footer className="mt-10 border-t border-white/6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-zinc-500">{t('footer.rights')}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-600">{t('footer.agreement')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            data-tour="legal-link"
            onClick={onOpenLegal}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-300 underline-offset-2 transition hover:text-brand-200 hover:underline"
          >
            <ShieldCheck className="h-3 w-3" />
            {t('footer.legal')}
          </button>

          <button
            type="button"
            onClick={onOpenData}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-200 hover:underline"
          >
            <Database className="h-3 w-3" />
            Encrypted backup
          </button>

          <button
            type="button"
            data-tour="version-badge"
            onClick={onOpenVersion}
            className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[10px] font-medium text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
          >
            v{VERSION}
          </button>

          <button
            type="button"
            onClick={onReplayTutorial}
            className="text-[10px] font-medium text-zinc-600 transition hover:text-zinc-300"
          >
            {t('footer.replay')}
          </button>
        </div>
      </div>
    </footer>
  )
}
