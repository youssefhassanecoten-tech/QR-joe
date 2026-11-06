import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { Notice } from '../hooks/useNotice'
import { cn } from '../lib/utils'
import { IconButton } from './ui'

const tones = {
  success: {
    wrap: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100',
    icon: CheckCircle2,
  },
  error: {
    wrap: 'border-rose-400/25 bg-rose-500/10 text-rose-100',
    icon: AlertCircle,
  },
  info: {
    wrap: 'border-brand-400/25 bg-brand-500/10 text-brand-100',
    icon: Info,
  },
}

export function NoticeBar({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) {
  if (!notice) return null
  const tone = tones[notice.tone]
  const Icon = tone.icon
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium animate-fade-up',
        tone.wrap,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 leading-snug">{notice.text}</span>
      <IconButton size="icon-sm" onClick={onDismiss} aria-label="Dismiss notification" className="-mr-1">
        <X className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  )
}
