import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon' | 'icon-sm'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 via-brand-400 to-aqua-400 text-white shadow-lg shadow-brand-500/25 hover:brightness-110 active:brightness-95',
  secondary:
    'glass text-zinc-100 hover:bg-white/10 hover:border-white/15 active:bg-white/5',
  ghost: 'text-zinc-300 hover:bg-white/5 hover:text-white',
  danger:
    'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs font-semibold',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm font-semibold',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:pointer-events-none disabled:opacity-40',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function IconButton({ className, variant = 'ghost', size = 'icon', ...props }: ButtonProps) {
  return <Button variant={variant} size={size} className={cn('shrink-0', className)} {...props} />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn('glass rounded-3xl shadow-2xl shadow-black/20', className)}
      {...props}
    />
  )
}

export function SectionHeading({ title, description, icon: Icon }: { title: string; description?: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/20">
          <Icon className="h-4.5 w-4.5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="font-display text-base font-semibold tracking-tight text-white">{title}</h2>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{description}</p> : null}
      </div>
    </div>
  )
}

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      {label ? (
        <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {label}
          {hint ? <span className="font-normal normal-case tracking-normal text-zinc-500">{hint}</span> : null}
        </span>
      ) : null}
      {children}
    </label>
  )
}

const controlClass =
  'w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner shadow-black/10 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-500/20'

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function TextArea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(controlClass, 'min-h-24 resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(controlClass, 'cursor-pointer appearance-none pr-9', className)} {...props}>
      {children}
    </select>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; icon?: LucideIcon }>
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-1.5 rounded-2xl border border-white/8 bg-black/20 p-1.5', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition',
              active
                ? 'bg-gradient-to-br from-brand-500/90 to-aqua-500/80 text-white shadow-md shadow-brand-500/20'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
        <label htmlFor={id}>{label}</label>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] tracking-normal text-zinc-300">
          {value}
          {unit ?? ''}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
  )
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])

  const commit = (next: string) => {
    setDraft(next)
    if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next.toLowerCase())
    else if (/^#[0-9a-f]{3}$/i.test(next)) {
      const [, r, g, b] = next
      onChange(`#${r}${r}${g}${g}${b}${b}`.toLowerCase())
    }
  }

  return (
    <div>
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-1.5 pr-3 transition focus-within:border-brand-400/60 focus-within:ring-2 focus-within:ring-brand-500/20">
        <label
          htmlFor={id}
          className="relative h-8 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15"
          style={{ backgroundColor: value }}
        >
          <input
            id={id}
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
            onChange={(event) => commit(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          value={draft}
          onChange={(event) => commit(event.target.value)}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[11px] uppercase tracking-wide text-zinc-200 outline-none"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/8 bg-black/15 px-3.5 py-2.5 text-left transition hover:bg-black/25"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-zinc-200">{label}</span>
        {description ? <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">{description}</span> : null}
      </span>
      <span
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition',
          checked ? 'bg-brand-500' : 'bg-zinc-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[1.125rem]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function Disclosure({
  title,
  icon: Icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string
  icon?: LucideIcon
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
      >
        {Icon ? <Icon className="h-4 w-4 text-brand-300" /> : null}
        <span className="flex-1 text-sm font-semibold text-zinc-100">{title}</span>
        {badge ? (
          <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-200">
            {badge}
          </span>
        ) : null}
        <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? <div className="space-y-4 border-t border-white/8 px-4 py-4">{children}</div> : null}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'success' | 'warning'
  className?: string
}) {
  const tones = {
    neutral: 'bg-white/8 text-zinc-300 ring-white/10',
    brand: 'bg-brand-500/15 text-brand-200 ring-brand-400/25',
    success: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25',
    warning: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/10 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-zinc-500 ring-1 ring-white/10">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
      {children}
    </kbd>
  )
}
