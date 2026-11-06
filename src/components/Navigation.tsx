import { CloudUpload, History, IdCard, QrCode, ScanLine, ShieldCheck, Sparkles } from 'lucide-react'
import type { View } from '../types'
import { IS_IC } from '../ic/config'
import { useI18n } from '../i18n'
import { VERSION } from '../version'
import { cn } from '../lib/utils'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

const navigation: Array<{ id: View; labelKey: string; hintKey: string; icon: typeof Sparkles }> = [
  { id: 'studio', labelKey: 'nav.studio', hintKey: 'nav.studio.hint', icon: Sparkles },
  { id: 'scan', labelKey: 'nav.scan', hintKey: 'nav.scan.hint', icon: ScanLine },
  { id: 'cards', labelKey: 'nav.cards', hintKey: 'nav.cards.hint', icon: IdCard },
  { id: 'history', labelKey: 'nav.history', hintKey: 'nav.history.hint', icon: History },
]

if (IS_IC) {
  navigation.splice(3, 0, { id: 'backup', labelKey: 'nav.backup', hintKey: 'nav.backup.hint', icon: CloudUpload })
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3">
      <span className="logo-mark relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-aqua-400 shadow-lg shadow-brand-500/30">
        <QrCode className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-white">
            {IS_IC ? 'QR-JOEic' : 'QR-JOE'}
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
            {IS_IC ? t('brand.autoBackup') : t('brand.studio')}
          </span>
        </span>
      )}
    </div>
  )
}

export function Sidebar({
  view,
  onChange,
  onOpenVersion,
}: {
  view: View
  onChange: (view: View) => void
  onOpenVersion: () => void
}) {
  const { t } = useI18n()
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-white/6 bg-black/25 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="px-2">
        <BrandMark />
      </div>

      <div className="mt-4 flex items-center gap-2 px-2">
        <LanguageToggle />
        <ThemeToggle compact />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1.5">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
          {t('sidebar.workspace')}
        </p>
        {navigation.map((item) => {
          const active = item.id === view
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              data-tour={`nav-${item.id}`}
              onClick={() => onChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                active
                  ? 'bg-gradient-to-r from-brand-500/20 via-white/5 to-transparent text-white ring-1 ring-white/10'
                  : 'text-zinc-400 hover:bg-white/4 hover:text-zinc-100',
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 to-aqua-400" />
              ) : null}
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-lg ring-1 transition',
                  active
                    ? 'bg-brand-500/20 text-brand-200 ring-brand-400/30'
                    : 'bg-white/4 text-zinc-400 ring-white/8 group-hover:text-zinc-200',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{t(item.labelKey)}</span>
                <span className="block text-[11px] leading-tight text-zinc-500">{t(item.hintKey)}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/5 to-transparent p-3.5">
        <div className="flex items-center gap-2 text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">{t('footer.local')}</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          {IS_IC ? t('sidebar.icBody') : t('sidebar.localBody')}
        </p>
      </div>
      <button
        type="button"
        data-tour="version-badge"
        onClick={onOpenVersion}
        className="mt-4 px-1 text-left font-mono text-[10px] text-zinc-600 transition hover:text-zinc-300"
      >
        QR-JOE · v{VERSION}
      </button>
    </aside>
  )
}

export function MobileNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const { t } = useI18n()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
      >
        {navigation.map((item) => {
          const active = item.id === view
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              data-tour={`nav-${item.id}`}
              onClick={() => onChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-1 px-1 py-2.5 text-[9px] font-semibold transition',
                active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-lg transition',
                  active ? 'bg-brand-500/20 text-brand-200' : '',
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
              {active ? <span className="absolute top-0 h-0.5 w-6 rounded-full bg-brand-400" /> : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
