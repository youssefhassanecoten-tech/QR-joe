import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { legalSections, legalUpdated } from '../legal'
import { localized, useI18n } from '../i18n'
import { VERSION } from '../version'
import { Badge, Button, Panel } from '../components/ui'

export function LegalView({ onBack }: { onBack: () => void }) {
  const { lang, t } = useI18n()

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-1">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('legal.back')}
      </Button>

      <header>
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          QR-JOE
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('legal.title')}
        </h1>
        <p className="mt-2 text-[11px] text-zinc-500">
          {t('legal.updated')}: {new Date(legalUpdated).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
        </p>
      </header>

      <Panel className="p-5 sm:p-7">
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3.5 py-3 text-[12px] leading-relaxed text-amber-100">
          {t('legal.acceptance')}
        </div>

        <div className="mt-6 space-y-6">
          {legalSections.map((section) => (
            <section key={section.heading.en}>
              <h2 className="font-display text-base font-semibold text-zinc-100">
                {localized(lang, section.heading)}
              </h2>
              <div className="mt-2 space-y-2.5">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.en} className="text-[12px] leading-relaxed text-zinc-400">
                    {localized(lang, paragraph)}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-4">
          <p className="max-w-md text-[10px] leading-relaxed text-zinc-600">{t('legal.disclaimer')}</p>
          <Badge>v{VERSION}</Badge>
        </div>
      </Panel>
    </div>
  )
}
