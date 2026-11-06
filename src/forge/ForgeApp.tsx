import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Nfc,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react'
import { NfcForge, type NdefRecordInfo, type NfcStatus } from './NfcForge'
import { parseVCard } from '../lib/vcard'
import { DigitalProfileCard } from '../components/DigitalProfileCard'
import { Badge, Button, Field, Panel, SectionHeading, Select, TextArea, TextInput } from '../components/ui'
import { cn } from '../lib/utils'

const sampleVCard = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Elshimy;Youssef;;;',
  'FN:Youssef Elshimy',
  'TITLE:R&D engineer',
  'ORG:Ecoten',
  'TEL;TYPE=CELL:+7-922-521-61-59',
  'EMAIL;TYPE=INTERNET:youssefhassanecoten@gmail.com',
  'URL:https://github.com/youssefhassanecoten-tech/Vkus-Mira',
  'END:VCARD',
].join('\r\n')

export function ForgeApp() {
  const [status, setStatus] = useState<NfcStatus | null>(null)
  const [url, setUrl] = useState('https://your-domain.com/#card=')
  const [vcard, setVcard] = useState(sampleVCard)
  const [primary, setPrimary] = useState<'online' | 'offline'>('online')
  const [busy, setBusy] = useState<'write' | 'read' | null>(null)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [records, setRecords] = useState<NdefRecordInfo[]>([])
  const [readInfo, setReadInfo] = useState<{ maxSize: number; writable: boolean } | null>(null)

  const profile = useMemo(() => parseVCard(vcard), [vcard])
  const bytes = useMemo(() => new TextEncoder().encode(`${vcard}\n${url}`).length, [vcard, url])

  const refresh = async () => {
    try {
      setStatus(await NfcForge.status())
    } catch {
      setStatus({ available: false, enabled: false })
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const write = async () => {
    setBusy('write')
    setNotice(null)
    try {
      const result = await NfcForge.writeTag({ url: url.trim(), vcard, primary })
      setNotice({
        tone: 'ok',
        text: `Tag written: ${result.bytes} bytes across ${result.records} record(s). Capacity ${result.maxSize} bytes.`,
      })
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'NFC write failed.' })
    } finally {
      setBusy(null)
      void refresh()
    }
  }

  const read = async () => {
    setBusy('read')
    setNotice(null)
    try {
      const result = await NfcForge.readTag()
      setRecords(result.records)
      setReadInfo({ maxSize: result.maxSize, writable: result.writable })
      setNotice({ tone: 'ok', text: `Read ${result.records.length} NDEF record(s).` })
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'NFC read failed.' })
    } finally {
      setBusy(null)
      void refresh()
    }
  }

  const cancel = async () => {
    await NfcForge.cancel()
    setBusy(null)
    setNotice({ tone: 'error', text: 'NFC operation cancelled.' })
  }

  const waiting = busy === 'write' || busy === 'read'

  return (
    <div className="relative min-h-svh overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-52 -top-52 h-[42rem] w-[42rem] rounded-full bg-brand-600/20 blur-[130px]" />
        <div className="absolute -right-52 top-1/4 h-[36rem] w-[36rem] rounded-full bg-aqua-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/10 blur-[130px]" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
              <Nfc className="h-3.5 w-3.5" />
              NFC Forge · Developer
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              QR-JOE Forge
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-400">
              Write an online card URL and an offline vCard to an NFC tag, or read existing NDEF tags.
              Android-focused; use NTAG215 or NTAG216 for both records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={status?.available ? 'success' : 'warning'}>
              <Smartphone className="h-3 w-3" />
              {status?.available ? (status.enabled ? 'NFC ready' : 'NFC disabled') : 'Android only'}
            </Badge>
            <Badge tone="brand">DEV BUILD</Badge>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-5">
            <Panel className="p-4 sm:p-5">
              <SectionHeading
                icon={Nfc}
                title="Tag payload"
                description="Both records are written to one NDEF message. The primary record controls what other phones show first."
              />

              <div className="mt-4 space-y-3">
                <Field label="Online card URL" hint="hosted viewer link">
                  <TextInput
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://your-domain.com/#card=…"
                    spellCheck={false}
                  />
                </Field>
                <Field label="Offline vCard" hint={`${bytes} bytes total`}>
                  <TextArea
                    value={vcard}
                    onChange={(event) => setVcard(event.target.value)}
                    className="min-h-52 font-mono text-[11px]"
                    spellCheck={false}
                  />
                </Field>
                <Field label="Primary record">
                  <Select value={primary} onChange={(event) => setPrimary(event.target.value as 'online' | 'offline')}>
                    <option value="online">Online URL first</option>
                    <option value="offline">Offline vCard first</option>
                  </Select>
                </Field>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => void write()}
                    disabled={waiting || !status?.available || !status.enabled}
                  >
                    <Nfc className="h-4 w-4" />
                    Write tag
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => void read()}
                    disabled={waiting || !status?.available || !status.enabled}
                  >
                    <Radio className="h-4 w-4" />
                    Read tag
                  </Button>
                  {waiting ? (
                    <Button variant="danger" onClick={() => void cancel()}>
                      Cancel
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => void refresh()} className="ml-auto">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>

                {!status?.available ? (
                  <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100">
                    NFC is not available in this browser. Install the QR-JOE Forge APK on an NFC-capable Android phone.
                  </p>
                ) : !status.enabled ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                    NFC is turned off.
                    <Button variant="secondary" size="sm" onClick={() => void NfcForge.openSettings()}>
                      Open NFC settings
                    </Button>
                  </div>
                ) : null}

                {notice ? (
                  <div
                    className={cn(
                      'flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] leading-relaxed',
                      notice.tone === 'ok'
                        ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
                        : 'border-rose-400/20 bg-rose-500/10 text-rose-100',
                    )}
                  >
                    {notice.tone === 'ok' ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    )}
                    {notice.text}
                  </div>
                ) : null}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <SectionHeading icon={Radio} title="Read result" description="NDEF records found on the last tag." />
              {records.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-6 text-center text-[11px] text-zinc-500">
                  Read a tag to inspect its records here.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {readInfo ? (
                    <p className="text-[10px] text-zinc-500">
                      Capacity {readInfo.maxSize} bytes · {readInfo.writable ? 'writable' : 'read-only'}
                    </p>
                  ) : null}
                  {records.map((record, index) => (
                    <div key={`${record.type}-${index}`} className="rounded-xl border border-white/8 bg-black/15 p-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="brand">{record.mime ?? record.type}</Badge>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-600">TNF {record.tnf}</span>
                      </div>
                      <p className="mt-1.5 break-all font-mono text-[10px] leading-relaxed text-zinc-400">
                        {record.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-semibold text-white">Card preview</h2>
                <Badge tone="brand">vCard</Badge>
              </div>
              <div className="mt-3">
                {profile ? (
                  <DigitalProfileCard profile={profile} animationClass="animate-card-in animate-card-shimmer" />
                ) : (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-zinc-500">
                    Enter a valid vCard to preview it.
                  </p>
                )}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <SectionHeading icon={Zap} title="How to test" description="NFC developer workflow." />
              <ol className="mt-4 space-y-2.5">
                {[
                  'Use an NTAG215 or NTAG216 tag for both records.',
                  'Tap Write tag, then hold the tag to the back of the phone.',
                  'Read tag to inspect what was written.',
                  'Tap with any phone: the primary record decides what opens.',
                ].map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-[11px] leading-relaxed text-zinc-400">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] font-semibold text-zinc-300 ring-1 ring-white/10">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-[10px] text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Writes happen only when you tap Write and hold a tag.
              </div>
            </Panel>
          </div>
        </div>

        {waiting ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
            <div className="relative flex max-w-sm flex-col items-center text-center">
              <span className="absolute h-40 w-40 animate-ping rounded-full border border-brand-400/40" />
              <span className="absolute h-56 w-56 animate-ping rounded-full border border-aqua-400/20 [animation-delay:0.4s]" />
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/40">
                <Nfc className="h-9 w-9" />
              </span>
              <h2 className="mt-6 font-display text-xl font-bold text-white">
                {busy === 'write' ? 'Hold the tag to write' : 'Hold the tag to read'}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">Keep the tag against the back of the phone.</p>
              <Button variant="danger" size="sm" className="mt-4" onClick={() => void cancel()}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
