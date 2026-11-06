import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AudioLines,
  ContactRound,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Music,
  Phone,
  Type,
  UserPlus,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { CardProfile, SocialLink } from '../types'
import { fullName, initials, parseVCard, parseMeCard } from '../lib/vcard'
import { downloadVCard } from '../lib/export'
import { parseTonePayload } from '../lib/audio'
import { safeExternalUrl, truncate } from '../lib/utils'
import { decodeCardFromUrl } from '../lib/cardLink'
import { typeLabel } from '../lib/labels'
import { useI18n } from '../i18n'
import { useScanSound } from '../scanSound'
import { AnimationCascade } from './AnimationCascade'
import { cardAnimationClass } from '../lib/animations'
import { Badge, Button } from './ui'
import { cn } from '../lib/utils'

export interface ScannedResult {
  data: string
  type: string
  at: number
}

interface CardRow {
  icon: LucideIcon
  value: string
}

interface CardData {
  icon: LucideIcon
  accent: string
  eyebrow: string
  title: string
  subtitle?: string
  rows: CardRow[]
  note?: string
  socials?: SocialLink[]
  profile?: CardProfile
  openUrl?: string
}

function parseWifi(data: string) {
  const read = (key: string) => {
    const match = data.match(new RegExp(`${key}:((?:\\\\.|[^;])*)`, 'i'))
    return match ? match[1].replace(/\\(.)/g, '$1') : ''
  }
  return {
    ssid: read('S'),
    security: read('T') || 'nopass',
    password: read('P'),
    hidden: /H:true/i.test(data),
  }
}

function safeUrl(value: string): string | undefined {
  return safeExternalUrl(value) ?? undefined
}

function buildCardData(result: ScannedResult, lang: 'en' | 'ru'): CardData {
  const data = result.data
  const eyebrow = typeLabel(result.type, lang)

  if (result.type === 'vCard') {
    const profile = parseVCard(data)
    if (profile) {
      return {
        icon: ContactRound,
        accent: '#8b5cf6',
        eyebrow,
        title: fullName(profile),
        subtitle: [profile.title, profile.company].filter(Boolean).join(' · ') || undefined,
        rows: [
          { icon: Phone, value: profile.phone },
          { icon: Mail, value: profile.email },
          { icon: Globe, value: profile.website },
          { icon: MapPin, value: profile.address },
        ].filter((row) => row.value.trim().length > 0),
        note: profile.note,
        socials: profile.socials.filter((social) => social.url.trim().length > 0),
        profile,
      }
    }
  }

  const embedded = decodeCardFromUrl(data)
  if (embedded) {
    const profile = /^MECARD:/i.test(embedded) ? parseMeCard(embedded) : parseVCard(embedded)
    if (profile) {
      return {
        icon: ContactRound,
        accent: '#8b5cf6',
        eyebrow: typeLabel('Card', lang),
        title: fullName(profile),
        subtitle: [profile.title, profile.company].filter(Boolean).join(' · ') || undefined,
        rows: [
          { icon: Phone, value: profile.phone },
          { icon: Mail, value: profile.email },
          { icon: Globe, value: profile.website },
          { icon: MapPin, value: profile.address },
        ].filter((row) => row.value.trim().length > 0),
        note: profile.note,
        socials: profile.socials.filter((social) => social.url.trim().length > 0),
        profile,
      }
    }
  }

  if (result.type === 'Wi-Fi') {
    const wifi = parseWifi(data)
    return {
      icon: Wifi,
      accent: '#14b8a6',
      eyebrow,
      title: wifi.ssid || 'Wi-Fi',
      subtitle: wifi.security.toUpperCase(),
      rows: [
        { icon: Wifi, value: wifi.ssid || '—' },
        { icon: Globe, value: wifi.security.toUpperCase() },
        ...(wifi.password ? [{ icon: Type, value: wifi.password }] : []),
        ...(wifi.hidden ? [{ icon: MapPin, value: 'Hidden network' }] : []),
      ],
    }
  }

  if (result.type === 'Email') {
    try {
      const url = new URL(data)
      const recipient = url.pathname
      const subject = url.searchParams.get('subject') ?? ''
      const body = url.searchParams.get('body') ?? ''
      return {
        icon: Mail,
        accent: '#f59e0b',
        eyebrow,
        title: recipient || 'Email',
        subtitle: subject || undefined,
        rows: body ? [{ icon: Type, value: body }] : [],
        note: body || undefined,
        openUrl: safeUrl(data),
      }
    } catch {
      // fall through
    }
  }

  if (result.type === 'Phone') {
    return {
      icon: Phone,
      accent: '#22c55e',
      eyebrow,
      title: data.replace(/^tel:/i, ''),
      subtitle: 'Phone',
      rows: [],
      openUrl: safeUrl(data),
    }
  }

  if (result.type === 'SMS') {
    const match = data.match(/^SMSTO:([^:]*):?([\s\S]*)$/i)
    return {
      icon: MessageSquare,
      accent: '#06b6d4',
      eyebrow,
      title: match?.[1] ?? 'SMS',
      subtitle: 'SMS',
      rows: [],
      note: match?.[2] || undefined,
    }
  }

  if (result.type === 'Location') {
    const coords = data.replace(/^geo:/i, '')
    const [lat, lng] = coords.split(',')
    return {
      icon: MapPin,
      accent: '#ef4444',
      eyebrow,
      title: coords || 'Location',
      subtitle: 'Coordinates',
      rows: [
        { icon: MapPin, value: lat ?? '—' },
        { icon: MapPin, value: lng ?? '—' },
      ],
      openUrl: `https://yandex.ru/maps/?text=${encodeURIComponent(coords)}`,
    }
  }

  if (result.type === 'Music') {
    const tone = parseTonePayload(data)
    const notes = data.split(':').slice(4).join(':')
    return {
      icon: Music,
      accent: '#ec4899',
      eyebrow,
      title: 'Ringtone',
      subtitle: tone ? `${tone.bpm} BPM` : 'Tone',
      rows: [],
      note: notes || undefined,
    }
  }

  if (result.type === 'Audio') {
    try {
      const url = new URL(data)
      return {
        icon: AudioLines,
        accent: '#a855f7',
        eyebrow,
        title: url.hostname,
        subtitle: 'Audio link',
        rows: [{ icon: Link2, value: decodeURIComponent(url.pathname) }],
        openUrl: safeUrl(data),
      }
    } catch {
      // fall through
    }
  }

  if (result.type === 'Link') {
    try {
      const url = new URL(data)
      return {
        icon: Link2,
        accent: '#0ea5e9',
        eyebrow,
        title: url.hostname,
        subtitle: truncate(data, 90),
        rows: [],
        openUrl: safeUrl(data),
      }
    } catch {
      // fall through
    }
  }

  if (result.type === 'Text') {
    return {
      icon: Type,
      accent: '#64748b',
      eyebrow,
      title: truncate(data.replace(/\s+/g, ' ').trim(), 60) || 'Text',
      subtitle: `${data.length} chars`,
      rows: [],
      note: truncate(data, 320),
    }
  }

  return {
    icon: ContactRound,
    accent: '#8b5cf6',
    eyebrow,
    title: eyebrow,
    rows: [],
    note: truncate(data, 240),
  }
}

function CardVisual({
  data,
  large = false,
  animationClass,
  rowAnimation,
}: {
  data: CardData
  large?: boolean
  animationClass: string
  rowAnimation: boolean
}) {
  const Icon = data.icon
  return (
    <div
      className={cn(
        'digital-card relative overflow-hidden rounded-2xl text-white shadow-2xl ring-1 ring-white/15',
        large ? 'flex min-h-[55vh] flex-col justify-center p-8' : 'p-5',
        animationClass,
        animationClass.includes('shimmer') && 'animate-card-shimmer',
      )}
      style={{
        background: `linear-gradient(155deg, ${data.accent} 0%, #171724 58%, #0b0b12 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {data.profile ? (
          <span
            className={cn(
              'grid shrink-0 place-items-center rounded-2xl bg-white/15 font-bold text-white ring-1 ring-white/25 backdrop-blur',
              large ? 'h-20 w-20 text-2xl' : 'h-16 w-16 text-xl',
              animationClass.includes('animate-card-in') && 'animate-card-float',
            )}
          >
            {initials(data.profile)}
          </span>
        ) : (
          <span
            className={cn(
              'grid shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur',
              large ? 'h-20 w-20' : 'h-16 w-16',
            )}
          >
            <Icon className={large ? 'h-8 w-8' : 'h-7 w-7'} />
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/15">
          {data.eyebrow}
        </span>
      </div>

      <p className={cn('mt-4 font-display font-bold leading-tight', large ? 'text-3xl' : 'text-2xl')}>
        {data.title}
      </p>
      {data.subtitle ? (
        <p className={cn('text-white/70', large ? 'text-sm' : 'text-xs')}>{data.subtitle}</p>
      ) : null}

      {data.rows.length > 0 ? (
        <div className={cn('mt-4 space-y-1.5 border-t border-white/15 pt-3')}>
          {data.rows.map((row, index) => {
            const RowIcon = row.icon
            return (
              <div
                key={`${row.value}-${index}`}
                className={cn(
                  'flex items-center gap-2 text-white/85',
                  large ? 'text-xs' : 'text-[11px]',
                  rowAnimation && 'animate-card-row',
                )}
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <RowIcon className="h-3 w-3 shrink-0 text-white/50" />
                <span className="truncate">{row.value}</span>
              </div>
            )
          })}
        </div>
      ) : null}

      {data.socials && data.socials.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/15 pt-3">
          {data.socials.map((social) => (
            <span
              key={social.id}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/85 ring-1 ring-white/15"
            >
              {social.label || 'link'}
            </span>
          ))}
        </div>
      ) : null}

      {data.note?.trim() ? (
        <p
          className={cn(
            'mt-3 border-t border-white/15 pt-3 leading-relaxed text-white/60',
            large ? 'text-xs' : 'text-[10px]',
          )}
        >
          {data.note}
        </p>
      ) : null}
    </div>
  )
}

export function ScannedResultCard({ result }: { result: ScannedResult }) {
  const { lang, t } = useI18n()
  const { cardAnimation, cardAnimationStyle, cardCascade } = useScanSound()
  const [fullscreen, setFullscreen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const data = buildCardData(result, lang)

  const isCascade = cardAnimation && cardAnimationStyle === 'cascade'
  const animationClass = cardAnimationClass(cardAnimation, cardAnimationStyle)
  const rowAnimation = cardAnimation && cardAnimationStyle === 'rise'

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreen])

  const saveContact = async () => {
    if (!data.profile) return
    setSaving(true)
    try {
      await downloadVCard(data.profile)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const primaryAction = data.profile ? (
    <Button variant="primary" size="sm" onClick={() => void saveContact()} disabled={saving}>
      <UserPlus className="h-3.5 w-3.5" />
      {saving ? t('scannedCard.saving') : t('scannedCard.save')}
    </Button>
  ) : data.openUrl ? (
    <Button
      variant="primary"
      size="sm"
      onClick={() => window.open(data.openUrl, '_blank', 'noopener,noreferrer')}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Open
    </Button>
  ) : null

  const renderVisual = (large = false) => {
    const visual = (
      <CardVisual
        data={data}
        large={large}
        animationClass={isCascade ? '' : animationClass}
        rowAnimation={rowAnimation && !isCascade}
      />
    )
    return isCascade ? <AnimationCascade layers={cardCascade}>{visual}</AnimationCascade> : visual
  }

  return (
    <div className="space-y-3">
      {renderVisual()}

      <div className="flex flex-wrap items-center gap-2">
        {data.profile ? primaryAction : null}
        <Button variant="secondary" size="sm" onClick={() => setFullscreen(true)}>
          <Maximize2 className="h-3.5 w-3.5" />
          Full screen
        </Button>
        <Badge tone="success">Visual card</Badge>
      </div>

      {data.profile ? (
        <p className="text-[10px] leading-relaxed text-zinc-500">{t('scannedCard.saveNote')}</p>
      ) : null}
      {saved ? <p className="text-[11px] text-emerald-300">Contact file ready.</p> : null}

      {fullscreen
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setFullscreen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
                {renderVisual(true)}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {primaryAction}
                  <Button variant="secondary" size="sm" onClick={() => setFullscreen(false)}>
                    <X className="h-3.5 w-3.5" />
                    Close
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
