import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme'
import { cn } from '../lib/utils'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-400 transition hover:text-zinc-200',
        compact && 'px-1.5',
      )}
    >
      {dark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
      {compact ? null : dark ? 'Light' : 'Dark'}
    </button>
  )
}
