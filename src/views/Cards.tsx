import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  Download,
  Globe,
  IdCard,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Maximize2,
  X,
  Play,
  RefreshCw,
} from 'lucide-react'
import type { CardProfile, HistoryEntry, QrDesign } from '../types'
import { starterCard } from '../types'
import { buildCardPayload, fullName, initials, type CardFormat } from '../lib/vcard'
import { downloadCardFile, exportDualPng, exportNestedPng, exportPng } from '../lib/export'
import { buildOnlineCardUrl, isLocalBase, readPublicBase } from '../lib/cardLink'
import { usePersistentState } from '../hooks/usePersistentState'
import { contentTypeLabel } from '../lib/payload'
import { fileToOptimizedDataUrl, uid } from '../lib/utils'
import { useI18n } from '../i18n'
import { useNotice } from '../hooks/useNotice'
import { NoticeBar } from '../components/NoticeBar'
import { QrPreview } from '../components/QrPreview'
import { DigitalProfileCard } from '../components/DigitalProfileCard'
import { AnimationCascade } from '../components/AnimationCascade'
import { DualQrModal } from '../components/DualQrModal'
import { cardAnimationClass as getCardAnimationClass } from '../lib/animations'
import { useScanSound } from '../scanSound'
import {
  Badge,
  Button,
  ColorField,
  Disclosure,
  EmptyState,
  Field,
  IconButton,
  Panel,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from '../components/ui'

export function Cards({
  profiles,
  setProfiles,
  design,
  onUseInStudio,
  onAddHistory,
}: {
  profiles: CardProfile[]
  setProfiles: (updater: (prev: CardProfile[]) => CardProfile[]) => void
  design: QrDesign
  onUseInStudio: (profile: CardProfile) => void
  onAddHistory: (entry: HistoryEntry) => void
}) {
  const { lang } = useI18n()
  const { notice, notify, dismiss } = useNotice()
  const [selectedId, setSelectedId] = useState<string | null>(profiles[0]?.id ?? null)
  const [exporting, setExporting] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null
  const [format, setFormat] = useState<CardFormat>('vcard3')
  const [cardFullscreen, setCardFullscreen] = useState(false)
  const [cardReplay, setCardReplay] = useState(0)
  const [dualOpen, setDualOpen] = useState(false)
  const [publicBase, setPublicBase] = usePersistentState('qrjoe:public-card-base', readPublicBase())
  const { cardAnimation, cardAnimationStyle, cardCascade } = useScanSound()
  const cardPayload = useMemo(() => (selected ? buildCardPayload(selected, format, false) : ''), [selected, format])
  const fullCardData = useMemo(() => (selected ? buildCardPayload(selected, format, true) : ''), [selected, format])
  const onlinePayload = useMemo(() => (selected ? buildOnlineCardUrl(publicBase, cardPayload) : ''), [selected, publicBase, cardPayload])
  const cardAnimClass = getCardAnimationClass(cardAnimation, cardAnimationStyle)
  const isCardCascade = cardAnimation && cardAnimationStyle === 'cascade'
  const renderProfileCard = (large = false) => {
    if (!selected) return null
    const key = `${selected.id}-${cardReplay}-${format}`

    const node = <DigitalProfileCard key={key} profile={selected} large={large} animationClass={isCardCascade ? '' : cardAnimClass} />
    return isCardCascade ? <AnimationCascade key={key} layers={cardCascade}>{node}</AnimationCascade> : node
  }

  useEffect(() => {
    if (!cardFullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCardFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cardFullscreen])

  const update = (patch: Partial<CardProfile>) => {
    if (!selected) return
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === selected.id ? { ...profile, ...patch, updatedAt: Date.now() } : profile,
      ),
    )
  }

  const createProfile = () => {
    const card = starterCard()
    setProfiles((prev) => [...prev, card])
    setSelectedId(card.id)
    notify('New card profile created.')
  }

  const deleteProfile = () => {
    if (!selected) return
    const prompt =
      lang === 'ru'
        ? `Удалить ${fullName(selected)}? Это нельзя отменить.`
        : `Delete ${fullName(selected)}? This cannot be undone.`
    if (!window.confirm(prompt)) return
    setProfiles((prev) => prev.filter((profile) => profile.id !== selected.id))
    notify('Card deleted.', 'info')
  }

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const dataUrl = await fileToOptimizedDataUrl(file, 512, 'image/webp')
    update({ avatar: dataUrl })
  }

  const addSocial = () => {
    if (!selected) return
    update({ socials: [...selected.socials, { id: uid(), label: '', url: '' }] })
  }

  const updateSocial = (id: string, patch: Partial<{ label: string; url: string }>) => {
    if (!selected) return
    update({
      socials: selected.socials.map((social) => (social.id === id ? { ...social, ...patch } : social)),
    })
  }

  const removeSocial = (id: string) => {
    if (!selected) return
    update({ socials: selected.socials.filter((social) => social.id !== id) })
  }

  const copyVcard = async () => {
    try {
      await navigator.clipboard.writeText(fullCardData)
      notify('Card data copied.')
    } catch {
      notify('Clipboard access was blocked.', 'error')
    }
  }

  const exportQr = async () => {
    if (!selected || !cardPayload.trim()) return
    setExporting(true)
    try {
      await exportPng(cardPayload, design, fullName(selected))
      onAddHistory({
        id: uid(),
        kind: 'generated',
        contentType: contentTypeLabel('vcard'),
        label: `Card → ${fullName(selected)}`,
        data: cardPayload,
        createdAt: Date.now(),
      })
      notify('Card QR exported as PNG.')
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Could not export this card.', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            <IdCard className="h-3.5 w-3.5" />
            Identity
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Digital Cards
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
            Build a rich vCard profile once, then share it as a scannable code or a .vcf contact file.
          </p>
        </div>
        <Button variant="primary" onClick={createProfile}>
          <Plus className="h-4 w-4" />
          New card
        </Button>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel className="p-3">
          <div className="mb-2 flex items-center justify-between px-1.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Profiles</h2>
            <span className="font-mono text-[10px] text-zinc-600">{profiles.length}</span>
          </div>
          <div className="space-y-1.5">
            {profiles.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-zinc-500">
                No profiles yet.
              </p>
            ) : (
              profiles.map((profile) => {
                const active = profile.id === selected?.id
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedId(profile.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                      active
                        ? 'border-brand-400/40 bg-brand-500/15'
                        : 'border-white/6 bg-black/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                      />
                    ) : (
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ring-1 ring-white/10"
                        style={{ background: `linear-gradient(135deg, ${profile.accent}, #1c1c2a)` }}
                      >
                        {initials(profile)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-zinc-100">
                        {fullName(profile)}
                      </span>
                      <span className="block truncate text-[10px] text-zinc-500">
                        {profile.title || profile.company || 'No details yet'}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </Panel>

        {selected ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Panel className="p-4 sm:p-5">
              <SectionHeading
                icon={UserRound}
                title="Profile details"
                description="Everything here is saved locally and encoded into your vCard."
              />

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-black/15 p-3">
                {selected.avatar ? (
                  <img
                    src={selected.avatar}
                    alt="Profile avatar"
                    className="h-14 w-14 rounded-full object-cover ring-1 ring-white/15"
                  />
                ) : (
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-base font-bold text-white ring-1 ring-white/10"
                    style={{ background: `linear-gradient(135deg, ${selected.accent}, #1c1c2a)` }}
                  >
                    {initials(selected)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Photo</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">
                    Used on the card and in the downloaded .vcf.
                  </p>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                <Button size="sm" variant="secondary" onClick={() => avatarRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
                {selected.avatar ? (
                  <IconButton
                    size="icon-sm"
                    variant="danger"
                    aria-label="Remove photo"
                    onClick={() => update({ avatar: null })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <TextInput
                    value={selected.firstName}
                    onChange={(event) => update({ firstName: event.target.value })}
                    placeholder="Ada"
                  />
                </Field>
                <Field label="Last name">
                  <TextInput
                    value={selected.lastName}
                    onChange={(event) => update({ lastName: event.target.value })}
                    placeholder="Lovelace"
                  />
                </Field>
                <Field label="Job title">
                  <TextInput
                    value={selected.title}
                    onChange={(event) => update({ title: event.target.value })}
                    placeholder="Head of Engineering"
                  />
                </Field>
                <Field label="Company">
                  <TextInput
                    value={selected.company}
                    onChange={(event) => update({ company: event.target.value })}
                    placeholder="Analytical Engines"
                  />
                </Field>
                <Field label="Phone">
                  <TextInput
                    value={selected.phone}
                    onChange={(event) => update({ phone: event.target.value })}
                    placeholder="+1 555 010 2030"
                    inputMode="tel"
                  />
                </Field>
                <Field label="Email">
                  <TextInput
                    type="email"
                    value={selected.email}
                    onChange={(event) => update({ email: event.target.value })}
                    placeholder="ada@example.com"
                  />
                </Field>
                <Field label="Website" className="sm:col-span-2">
                  <TextInput
                    value={selected.website}
                    onChange={(event) => update({ website: event.target.value })}
                    placeholder="https://example.com"
                    spellCheck={false}
                  />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <TextInput
                    value={selected.address}
                    onChange={(event) => update({ address: event.target.value })}
                    placeholder="Street, city, country"
                  />
                </Field>
                <Field label="Note" className="sm:col-span-2">
                  <TextArea
                    value={selected.note}
                    onChange={(event) => update({ note: event.target.value })}
                    placeholder="A short intro, availability, or anything worth sharing."
                    className="min-h-20"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <ColorField
                    label="Card accent"
                    value={selected.accent}
                    onChange={(value) => update({ accent: value })}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-white/6 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-brand-300" />
                    <h3 className="text-sm font-semibold text-zinc-100">Social links</h3>
                    <Badge>{selected.socials.length}</Badge>
                  </div>
                  <Button size="sm" variant="secondary" onClick={addSocial}>
                    <Plus className="h-3.5 w-3.5" />
                    Add link
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {selected.socials.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-white/10 bg-black/10 px-3 py-4 text-center text-[11px] text-zinc-500">
                      Add LinkedIn, X, GitHub, a portfolio — anything with a URL.
                    </p>
                  ) : (
                    selected.socials.map((social) => (
                      <div key={social.id} className="flex w-full min-w-0 items-center gap-2">
                        <TextInput
                          value={social.label}
                          onChange={(event) => updateSocial(social.id, { label: event.target.value })}
                          placeholder="Label"
                          className="w-20 shrink-0 px-2.5 py-2 text-xs sm:w-28"
                        />
                        <TextInput
                          value={social.url}
                          onChange={(event) => updateSocial(social.id, { url: event.target.value })}
                          placeholder="https://…"
                          spellCheck={false}
                          className="min-w-0 flex-1 px-2.5 py-2 text-xs"
                        />
                        <IconButton
                          size="icon-sm"
                          variant="danger"
                          aria-label="Remove social link"
                          onClick={() => removeSocial(social.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/6 pt-4">
                <Button variant="ghost" size="sm" onClick={deleteProfile} className="text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete card
                </Button>
                <p className="text-[10px] text-zinc-600">
                  Updated {new Date(selected.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </Panel>

            <div className="space-y-4">
              <Panel className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-sm font-semibold text-white">Card preview</h2>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setCardReplay((value) => value + 1)}>
                      <Play className="h-3.5 w-3.5" />
                      Play animation
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setCardFullscreen(true)}>
                      <Maximize2 className="h-3.5 w-3.5" />
                      Full screen
                    </Button>
                  </div>
                </div>

                <Field label="Card format" className="mt-3">
                  <Select value={format} onChange={(event) => setFormat(event.target.value as CardFormat)}>
                    <option value="vcard3">vCard 3.0 · .vcf</option>
                    <option value="vcard4">vCard 4.0 · .vcf</option>
                    <option value="mecard">MECARD · .txt</option>
                  </Select>
                </Field>

                <div
                  className="mt-3 cursor-zoom-in"
                  onClick={() => setCardFullscreen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setCardFullscreen(true)
                  }}
                >
                  {renderProfileCard()}
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Card QR
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600">Tap the QR to flip</span>
                      <Button variant="secondary" size="sm" onClick={() => setDualOpen(true)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Dual QR
                      </Button>
                    </div>
                  </div>
                  <QrPreview
                    payload={cardPayload}
                    design={design}
                    renderSize={560}
                    onActivate={() => setDualOpen(true)}
                  />
                  <Field label="Public card URL" hint="https://" className="mt-3">
                    <TextInput
                      value={publicBase}
                      onChange={(event) => setPublicBase(event.target.value)}
                      placeholder="https://your-domain.com/"
                      spellCheck={false}
                    />
                  </Field>
                  {isLocalBase(publicBase) ? (
                    <p className="mt-1 text-[10px] leading-relaxed text-amber-300">
                      Use a public HTTPS URL so other phones can open the online card.
                    </p>
                  ) : null}
                </div>

                <NoticeBar notice={notice} onDismiss={dismiss} />

                <div className="mt-3 grid gap-2">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!selected) return
                      try {
                        await downloadCardFile(selected, format)
                        notify('Contact file ready.')
                      } catch {
                        notify('Could not create the contact file.', 'error')
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {format === 'mecard' ? 'Download .txt' : 'Download .vcf'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={exportQr} disabled={exporting || !cardPayload.trim()}>
                      {exporting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Download className="h-4 w-4" />}
                      QR PNG
                    </Button>
                    <Button variant="secondary" onClick={() => onUseInStudio(selected)}>
                      <Sparkles className="h-4 w-4" />
                      Studio
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyVcard}>
                    Copy card data
                  </Button>
                </div>
                {cardPayload.length > 2600 ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-amber-300">
                    This profile is too detailed for a reliable QR code. Shorten the note or remove social links for
                    the scannable code — the .vcf download keeps everything.
                  </p>
                ) : null}
              </Panel>

              <Panel className="p-4">
                <Disclosure title={format === 'mecard' ? 'MECARD source' : 'vCard source'} icon={Globe} badge={format === 'mecard' ? '.txt' : '.vcf'}>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-white/6 bg-black/30 p-2.5 font-mono text-[10px] leading-relaxed text-zinc-400">
                    {fullCardData || 'Add some details to generate a card.'}
                  </pre>
                  <p className="text-[10px] leading-relaxed text-zinc-600">
                    {format === 'mecard'
                      ? 'MECARD is a compact text contact format.'
                      : 'Photo data is included in the .vcf download but excluded from the QR payload to keep it scannable.'}
                  </p>
                </Disclosure>
              </Panel>

              {cardFullscreen && selected
                ? createPortal(
                    <div
                      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
                      onClick={() => setCardFullscreen(false)}
                      role="dialog"
                      aria-modal="true"
                    >
                      <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
                        {renderProfileCard(true)}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              try {
                                await downloadCardFile(selected, format)
                                notify('Contact file ready.')
                              } catch {
                                notify('Could not create the contact file.', 'error')
                              }
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {format === 'mecard' ? 'Download .txt' : 'Download .vcf'}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setCardFullscreen(false)}>
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
          </div>
        ) : (
          <Panel className="p-6">
            <EmptyState
              icon={IdCard}
              title="Create your first digital card"
              description="Add a name, role and a few links — QR-JOE turns it into a scannable vCard and a shareable contact file."
              action={
                <Button variant="primary" onClick={createProfile}>
                  <Plus className="h-4 w-4" />
                  New card
                </Button>
              }
            />
          </Panel>
        )}

        {dualOpen && selected ? (
          <DualQrModal
            offlinePayload={cardPayload}
            onlinePayload={onlinePayload}
            design={design}
            publicBase={publicBase}
            onClose={() => setDualOpen(false)}
            onDownloadBoth={() => {
              void exportDualPng(cardPayload, onlinePayload, design, fullName(selected), lang)
                .then(() => notify('Both QR codes downloaded.'))
                .catch(() => notify('Could not export both codes.', 'error'))
            }}
            onDownloadNested={() => {
              void exportNestedPng(cardPayload, onlinePayload, design, fullName(selected))
                .then(() => notify('Duo nested QR downloaded.'))
                .catch(() => notify('Could not export the nested QR.', 'error'))
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
