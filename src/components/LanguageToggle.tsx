import { Languages } from 'lucide-react'
import { useI18n } from '../i18n'
import { cn } from '../lib/utils'

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-0.5',
        !compact && 'pl-1.5',
      )}
      aria-label="Language"
    >
      {!compact ? <Languages className="h-3 w-3 text-zinc-500" /> : null}
      {(['en', 'ru'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={cn(
            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition',
            lang === code ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          {code}
        </button>
      ))}
    </span>
  )
}
