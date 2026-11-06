import { useState } from 'react'
import { Download, IdCard, ShieldCheck } from 'lucide-react'
import type { CardProfile } from '../types'
import { parseVCard, parseMeCard } from '../lib/vcard'
import { downloadVCard } from '../lib/export'
import { useI18n } from '../i18n'
import { DigitalProfileCard } from '../components/DigitalProfileCard'
import { Button } from '../components/ui'

function parseCard(value: string): CardProfile | null {
  if (/^MECARD:/i.test(value.trim())) return parseMeCard(value)
  return parseVCard(value)
}

export function PublicCardViewer({ data }: { data: string }) {
  const { t } = useI18n()
  const [profile] = useState(() => parseCard(data))
  const [saved, setSaved] = useState(false)

  if (!profile) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center">
        <div>
          <IdCard className="mx-auto h-10 w-10 text-zinc-600" />
          <h1 className="mt-3 font-display text-xl font-semibold text-white">Card not found</h1>
          <p className="mt-1 text-sm text-zinc-500">This link does not contain a valid contact card.</p>
        </div>
      </div>
    )
  }

  const save = async () => {
    await downloadVCard(profile)
    setSaved(true)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-ink-950 text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-52 -top-52 h-[40rem] w-[40rem] rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute -right-52 top-1/4 h-[34rem] w-[34rem] rounded-full bg-aqua-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-10">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          QR-JOE · Digital card
        </div>

        <div className="animate-card-in animate-card-shimmer w-full">
          <DigitalProfileCard profile={profile} large />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="primary" className="flex-1" onClick={() => void save()}>
            <Download className="h-4 w-4" />
            {saved ? 'Contact file ready' : t('scannedCard.save')}
          </Button>
        </div>

        <p className="text-center text-[10px] leading-relaxed text-zinc-600">
          Animated card · Save to contacts to keep this person in your address book.
        </p>
      </div>
    </div>
  )
}
