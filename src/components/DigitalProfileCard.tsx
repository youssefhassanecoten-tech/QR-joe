import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import type { CardProfile } from '../types'
import { fullName, initials } from '../lib/vcard'
import { truncate } from '../lib/utils'
import { cn } from '../lib/utils'

export function DigitalProfileCard({
  profile,
  large = false,
  animationClass,
}: {
  profile: CardProfile
  large?: boolean
  animationClass?: string
}) {
  const rows = [
    { icon: Phone, value: profile.phone },
    { icon: Mail, value: profile.email },
    { icon: Globe, value: profile.website },
    { icon: MapPin, value: profile.address },
  ].filter((row) => row.value.trim().length > 0)
  const socials = profile.socials.filter((social) => social.url.trim().length > 0)

  return (
    <div
      className={cn(
        'digital-card relative overflow-hidden rounded-2xl text-white shadow-xl ring-1 ring-white/10',
        large ? 'flex min-h-[55vh] flex-col justify-center p-8' : 'p-5',
        animationClass,
      )}
      style={{
        background: `linear-gradient(150deg, ${profile.accent} 0%, #15151f 62%, #0b0b12 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt=""
            className={cn(
              'rounded-2xl object-cover ring-2 ring-white/25',
              large ? 'h-20 w-20' : 'h-14 w-14',
            )}
          />
        ) : (
          <span
            className={cn(
              'grid place-items-center rounded-2xl bg-white/15 font-bold ring-1 ring-white/25 backdrop-blur',
              large ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-lg',
            )}
          >
            {initials(profile)}
          </span>
        )}
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/60">
          Digital card
        </span>
      </div>

      <p className={cn('mt-4 font-display font-bold leading-tight', large ? 'text-3xl' : 'text-xl')}>
        {fullName(profile)}
      </p>
      <p className={cn('text-white/70', large ? 'text-sm' : 'text-xs')}>
        {[profile.title, profile.company].filter(Boolean).join(' · ') || 'Add a title and company'}
      </p>

      {rows.length > 0 ? (
        <div className="mt-4 space-y-1.5 border-t border-white/15 pt-3">
          {rows.map((row, index) => {
            const Icon = row.icon
            return (
              <div
                key={`${row.value}-${index}`}
                className={cn('flex items-center gap-2 text-white/80', large ? 'text-xs' : 'text-[11px]')}
              >
                <Icon className="h-3 w-3 shrink-0 text-white/50" />
                <span className="truncate">{row.value}</span>
              </div>
            )
          })}
        </div>
      ) : null}

      {socials.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/15 pt-3">
          {socials.map((social) => (
            <span
              key={social.id}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/85 ring-1 ring-white/15"
            >
              {social.label || 'link'}
            </span>
          ))}
        </div>
      ) : null}

      {profile.note.trim() ? (
        <p
          className={cn(
            'mt-3 border-t border-white/15 pt-3 leading-relaxed text-white/60',
            large ? 'text-xs' : 'text-[10px]',
          )}
        >
          {truncate(profile.note, large ? 260 : 140)}
        </p>
      ) : null}
    </div>
  )
}
