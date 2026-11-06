import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import type { View } from '../types'
import { localized, useI18n } from '../i18n'
import { IS_IC } from '../ic/config'
import { fullTutorial, updateTutorial } from '../tutorial'
import { Button } from './ui'
import { clamp } from '../lib/utils'

export function Tutorial({
  mode,
  onClose,
  onNavigate,
}: {
  mode: 'full' | 'update' | null
  onClose: () => void
  onNavigate: (view: View) => void
}) {
  const { lang, t } = useI18n()
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const steps = useMemo(() => {
    const source = mode === 'update' ? updateTutorial : fullTutorial
    return source.filter((step) => !step.requiresIC || IS_IC)
  }, [mode])

  const safeIndex = Math.min(index, Math.max(0, steps.length - 1))
  const current = steps[safeIndex]

  useEffect(() => {
    setIndex(0)
  }, [mode])

  useEffect(() => {
    if (!mode || !current) {
      setRect(null)
      return
    }
    if (current.view) onNavigate(current.view)

    let cancelled = false
    let revealTimer = 0
    const findTarget = () => {
      if (!current.target) return null
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-tour="${current.target}"]`),
      )
      return (
        candidates.find((element) => {
          const box = element.getBoundingClientRect()
          return box.width > 0 && box.height > 0
        }) ?? null
      )
    }
    const measure = () => {
      if (cancelled) return
      const target = findTarget()
      setRect(target ? target.getBoundingClientRect() : null)
    }
    const reveal = () => {
      const target = findTarget()
      if (!target) {
        setRect(null)
        return
      }
      target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
      revealTimer = window.setTimeout(measure, 320)
    }

    const initial = window.setTimeout(reveal, 380)
    const retry = window.setTimeout(reveal, 1200)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelled = true
      window.clearTimeout(initial)
      window.clearTimeout(retry)
      window.clearTimeout(revealTimer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [mode, current, onNavigate])

  const next = useCallback(() => {
    if (safeIndex >= steps.length - 1) onClose()
    else setIndex(safeIndex + 1)
  }, [safeIndex, steps.length, onClose])

  const previous = useCallback(() => {
    setIndex(Math.max(0, safeIndex - 1))
  }, [safeIndex])

  useEffect(() => {
    if (!mode) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, next, previous, onClose])

  if (!mode || !current) return null

  const width = Math.min(360, window.innerWidth - 32)
  const heightEstimate = 230
  const placement = current.placement ?? 'bottom'
  let tooltipStyle: CSSProperties = {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width,
  }
  if (rect) {
    const left = clamp(rect.left, 16, Math.max(16, window.innerWidth - width - 16))
    const top = clamp(rect.top, 16, Math.max(16, window.innerHeight - heightEstimate))
    if (placement === 'right' && rect.right + width + 24 < window.innerWidth) {
      tooltipStyle = { left: rect.right + 16, top, width }
    } else if (placement === 'left' && rect.left - width - 24 > 0) {
      tooltipStyle = { left: rect.left - width - 16, top, width }
    } else if (placement === 'top' && rect.top > heightEstimate + 24) {
      tooltipStyle = {
        left,
        top: rect.top - heightEstimate - 16,
        width,
      }
    } else {
      tooltipStyle = {
        left,
        top: Math.min(rect.bottom + 16, window.innerHeight - heightEstimate - 16),
        width,
      }
    }
  }

  const arrowClass =
    placement === 'right' && rect
      ? 'left-[-6px] top-6'
      : placement === 'left' && rect
        ? 'right-[-6px] top-6'
        : placement === 'top' && rect
          ? 'bottom-[-6px] left-6'
          : 'top-[-6px] left-6'

  return createPortal(
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={t('tutorial.step')}>
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-xl border-2 border-brand-300/90 shadow-[0_0_0_9999px_rgba(4,4,10,0.78)] ring-4 ring-brand-400/20 transition-all duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(4,4,10,0.78)]" />
      )}

      <div
        className="fixed rounded-2xl border border-white/12 bg-ink-900 p-4 shadow-2xl shadow-black/60 transition-all duration-200"
        style={tooltipStyle}
      >
        {rect ? (
          <span
            className={`absolute h-3 w-3 rotate-45 border-l border-t border-white/12 bg-ink-900 ${arrowClass}`}
            aria-hidden="true"
          />
        ) : null}
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">
          <Sparkles className="h-3.5 w-3.5" />
          {t('tutorial.step')} {safeIndex + 1} {t('tutorial.of')} {steps.length}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('tutorial.skip')}
            className="ml-auto rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold leading-tight text-white">
          {localized(lang, current.title)}
        </h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400">
          {localized(lang, current.body)}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('tutorial.skip')}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {safeIndex > 0 ? (
              <Button variant="secondary" size="sm" onClick={previous}>
                <ChevronLeft className="h-3.5 w-3.5" />
                {t('tutorial.previous')}
              </Button>
            ) : null}
            <Button variant="primary" size="sm" onClick={next}>
              {safeIndex >= steps.length - 1 ? t('tutorial.done') : t('tutorial.next')}
              {safeIndex < steps.length - 1 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
