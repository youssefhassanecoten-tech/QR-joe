import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  ContactRound,
  Eye,
  EyeOff,
  Link2,
  LocateFixed,
  Mail,
  MapPin,
  Layers,
  MessageSquare,
  Music,
  Phone,
  Play,
  Plus,
  Square,
  Type,
  UserRound,
  Wifi,
} from 'lucide-react'
import type { CardProfile, ContentState, ContentType } from '../types'
import { buildTonePayload, parseTonePayload, playMelody, stopMelody, tonePresets } from '../lib/audio'
import { fullName, initials } from '../lib/vcard'
import { cn } from '../lib/utils'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Segmented,
  Select,
  Slider,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
} from './ui'

const contentTypes: Array<{ value: ContentType; label: string; icon: typeof Link2 }> = [
  { value: 'url', label: 'Link', icon: Link2 },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'geo', label: 'Location', icon: MapPin },
  { value: 'vcard', label: 'Card', icon: ContactRound },
  { value: 'batch', label: 'Batch', icon: Layers },
  { value: 'music', label: 'Music', icon: Music },
]

export function ContentFields({
  content,
  setContent,
  profiles,
  onGoToCards,
}: {
  content: ContentState
  setContent: Dispatch<SetStateAction<ContentState>>
  profiles: CardProfile[]
  onGoToCards: () => void
}) {
  const [showWifiPassword, setShowWifiPassword] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoMessage, setGeoMessage] = useState<string | null>(null)
  const [playingPreview, setPlayingPreview] = useState(false)
  const [toneError, setToneError] = useState<string | null>(null)

  useEffect(() => {
    return () => stopMelody()
  }, [])

  const update = (patch: Partial<ContentState>) => setContent((prev) => ({ ...prev, ...patch }))

  const changeType = (type: ContentType) => {
    if (type !== 'music') {
      stopMelody()
      setPlayingPreview(false)
    }
    update({
      type,
      cardId:
        type === 'vcard' && !content.cardId
          ? (profiles[0]?.id ?? null)
          : content.cardId,
    })
  }

  const toggleTonePreview = async () => {
    if (playingPreview) {
      stopMelody()
      setPlayingPreview(false)
      return
    }
    const melody = parseTonePayload(buildTonePayload(content.musicBpm, content.musicNotes))
    if (!melody) {
      setToneError('Add at least one valid note, for example C5/2; E5/2; G5/4.')
      return
    }
    setToneError(null)
    setPlayingPreview(true)
    try {
      await playMelody(melody, () => setPlayingPreview(false))
    } catch {
      setPlayingPreview(false)
      setToneError('Audio playback is not available in this browser.')
    }
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not available in this browser.')
      return
    }
    setLocating(true)
    setGeoMessage(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        })
        setLocating(false)
      },
      (error) => {
        setGeoMessage(error.message || 'Could not read your location.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
    )
  }

  const selectedCard = profiles.find((profile) => profile.id === content.cardId) ?? profiles[0] ?? null

  return (
    <div className="space-y-5">
      <div data-tour="content-types">
        <Segmented
          value={content.type}
          onChange={changeType}
          options={contentTypes}
          columns={3}
        />
      </div>

      <div key={content.type} className="animate-fade-in space-y-4">
        {content.type === 'url' ? (
          <Field label="Destination URL" hint="https://">
            <TextInput
              value={content.url}
              onChange={(event) => update({ url: event.target.value })}
              placeholder="https://your-link.com"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
            />
          </Field>
        ) : null}

        {content.type === 'text' ? (
          <Field label="Plain text" hint={`${content.text.length} chars`}>
            <TextArea
              value={content.text}
              onChange={(event) => update({ text: event.target.value })}
              placeholder="Any text — notes, codes, a secret message…"
            />
          </Field>
        ) : null}

        {content.type === 'email' ? (
          <div className="space-y-3">
            <Field label="Recipient">
              <TextInput
                type="email"
                value={content.emailTo}
                onChange={(event) => update({ emailTo: event.target.value })}
                placeholder="hello@example.com"
                spellCheck={false}
              />
            </Field>
            <Field label="Subject">
              <TextInput
                value={content.emailSubject}
                onChange={(event) => update({ emailSubject: event.target.value })}
                placeholder="Pre-filled subject"
              />
            </Field>
            <Field label="Body">
              <TextArea
                value={content.emailBody}
                onChange={(event) => update({ emailBody: event.target.value })}
                placeholder="Pre-filled message"
              />
            </Field>
          </div>
        ) : null}

        {content.type === 'phone' ? (
          <Field label="Phone number" hint="tel: link">
            <TextInput
              type="tel"
              value={content.phone}
              onChange={(event) => update({ phone: event.target.value })}
              placeholder="+1 555 123 4567"
              inputMode="tel"
            />
          </Field>
        ) : null}

        {content.type === 'sms' ? (
          <div className="space-y-3">
            <Field label="Recipient number">
              <TextInput
                type="tel"
                value={content.smsPhone}
                onChange={(event) => update({ smsPhone: event.target.value })}
                placeholder="+1 555 123 4567"
                inputMode="tel"
              />
            </Field>
            <Field label="Message">
              <TextArea
                value={content.smsMessage}
                onChange={(event) => update({ smsMessage: event.target.value })}
                placeholder="Pre-filled text message"
              />
            </Field>
          </div>
        ) : null}

        {content.type === 'wifi' ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Network name">
                <TextInput
                  value={content.wifiSsid}
                  onChange={(event) => update({ wifiSsid: event.target.value })}
                  placeholder="MyNetwork"
                  spellCheck={false}
                />
              </Field>
              {content.wifiEncryption !== 'nopass' ? (
                <Field label="Password">
                  <div className="relative">
                    <TextInput
                      type={showWifiPassword ? 'text' : 'password'}
                      value={content.wifiPassword}
                      onChange={(event) => update({ wifiPassword: event.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowWifiPassword((value) => !value)}
                      className="absolute inset-y-0 right-0 grid w-10 place-items-center text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showWifiPassword ? 'Hide password' : 'Show password'}
                    >
                      {showWifiPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              ) : null}
            </div>
            <Field label="Security">
              <Select
                value={content.wifiEncryption}
                onChange={(event) =>
                  update({ wifiEncryption: event.target.value as ContentState['wifiEncryption'] })
                }
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open network</option>
              </Select>
            </Field>
            <Toggle
              checked={content.wifiHidden}
              onChange={(checked) => update({ wifiHidden: checked })}
              label="Hidden network"
              description="Include the hidden-network flag in the payload."
            />
          </div>
        ) : null}

        {content.type === 'geo' ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Latitude">
                <TextInput
                  value={content.lat}
                  onChange={(event) => update({ lat: event.target.value })}
                  placeholder="24.7136"
                  inputMode="decimal"
                  spellCheck={false}
                />
              </Field>
              <Field label="Longitude">
                <TextInput
                  value={content.lng}
                  onChange={(event) => update({ lng: event.target.value })}
                  placeholder="46.6753"
                  inputMode="decimal"
                  spellCheck={false}
                />
              </Field>
            </div>
            <Button variant="secondary" size="sm" onClick={locate} disabled={locating}>
              {locating ? <Spinner className="h-3.5 w-3.5" /> : <LocateFixed className="h-3.5 w-3.5" />}
              Use my current location
            </Button>
            {geoMessage ? <p className="text-[11px] text-rose-300">{geoMessage}</p> : null}
          </div>
        ) : null}

        {content.type === 'vcard' ? (
          profiles.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="No card profiles yet"
              description="Create a digital business card and its contact details will be encoded straight into your QR code."
              action={
                <Button variant="primary" size="sm" onClick={onGoToCards}>
                  <Plus className="h-3.5 w-3.5" />
                  Create a card
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              <Field label="Profile">
                <Select
                  value={content.cardId ?? profiles[0]?.id ?? ''}
                  onChange={(event) => update({ cardId: event.target.value || null })}
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {fullName(profile)}
                      {profile.company ? ` · ${profile.company}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              {selectedCard ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3">
                  {selectedCard.avatar ? (
                    <img
                      src={selectedCard.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15"
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500/30 to-aqua-500/30 text-xs font-bold text-brand-100 ring-1 ring-white/10">
                      {initials(selectedCard)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">{fullName(selectedCard)}</p>
                    <p className="truncate text-[11px] text-zinc-500">
                      {[selectedCard.title, selectedCard.company].filter(Boolean).join(' · ') || 'No title yet'}
                    </p>
                  </div>
                  <Badge tone="brand">vCard</Badge>
                </div>
              ) : null}
            </div>
          )
        ) : null}

        {content.type === 'music' ? (
          <div className="space-y-3">
            <Field label="Music mode">
              <Segmented
                value={content.musicMode}
                onChange={(value) => update({ musicMode: value })}
                options={[
                  { value: 'tone', label: 'Ringtone' },
                  { value: 'link', label: 'Audio link' },
                ]}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <TextInput
                  value={content.musicTitle}
                  onChange={(event) => update({ musicTitle: event.target.value })}
                  placeholder="Track or tone name"
                />
              </Field>
              <Field label="Artist" hint="optional">
                <TextInput
                  value={content.musicArtist}
                  onChange={(event) => update({ musicArtist: event.target.value })}
                  placeholder="Who made it"
                />
              </Field>
            </div>

            {content.musicMode === 'link' ? (
              <>
                <Field label="Audio URL" hint="mp3 · wav · ogg">
                  <TextInput
                    type="url"
                    value={content.musicUrl}
                    onChange={(event) => update({ musicUrl: event.target.value })}
                    placeholder="https://example.com/snippet.mp3"
                    spellCheck={false}
                  />
                </Field>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Opens the audio in any scanner. Point it at a hosted snippet or ringtone file — nothing is uploaded
                  by QR-JOE.
                </p>
              </>
            ) : (
              <>
                <Slider
                  label="Tempo"
                  value={content.musicBpm}
                  min={60}
                  max={200}
                  step={2}
                  unit=" BPM"
                  onChange={(value) => update({ musicBpm: value })}
                />
                <Field label="Note sequence" hint="note/beats · R = rest">
                  <TextInput
                    value={content.musicNotes}
                    onChange={(event) => update({ musicNotes: event.target.value })}
                    placeholder="C5/2; E5/2; G5/2; C6/4"
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  {tonePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => update({ musicNotes: preset.notes, musicBpm: preset.bpm })}
                      className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-100"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={toggleTonePreview}>
                    {playingPreview ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {playingPreview ? 'Stop' : 'Preview tone'}
                  </Button>
                  <span className="text-[11px] text-zinc-500">Tone melodies play inside QR-JOE scans.</span>
                </div>
                {toneError ? <p className="text-[11px] text-rose-300">{toneError}</p> : null}
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Tone codes are compact and work offline. For audio that plays in any scanner, switch to Audio link
                  and host a snippet.
                </p>
              </>
            )}
          </div>
        ) : null}

        {content.type === 'batch' ? (
          <div className="space-y-3">
            <Field
              label="Payloads"
              hint={`${content.batch.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length} codes`}
            >
              <TextArea
                value={content.batch}
                onChange={(event) => update({ batch: event.target.value })}
                className="min-h-40 font-mono text-[12px]"
                placeholder={'https://example.com/1\nhttps://example.com/2\nhttps://example.com/3'}
                spellCheck={false}
              />
            </Field>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              One payload per line. The live preview shows the first code; Download PNG exports every code as a
              labeled print sheet.
            </p>
          </div>
        ) : null}
      </div>

      <div className={cn('flex items-center justify-between gap-2 border-t border-white/6 pt-3 text-[11px] text-zinc-500')}>
        <span>Payload</span>
        <span className="font-mono text-zinc-400">
          {content.type === 'vcard' ? 'vCard 3.0' : 'UTF-8'} · max ~2,900 chars
        </span>
      </div>
    </div>
  )
}
