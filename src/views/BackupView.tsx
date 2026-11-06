import { useState } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cloud,
  CloudUpload,
  Clock,
  ExternalLink,
  FolderOpen,
  FolderUp,
  Image,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { useAutoBackup } from '../ic/AutoBackupContext'
import { BACKUP_FOLDER, BACKUP_FOLDER_LABEL } from '../ic/config'
import { CameraBackup, type PermissionStatus } from '../ic/CameraBackup'
import { Badge, Button, EmptyState, Field, Panel, SectionHeading, TextInput, Toggle } from '../components/ui'
import { cn, relativeTime } from '../lib/utils'

function permissionBadge(status: PermissionStatus | undefined) {
  if (status === 'granted') return { tone: 'success' as const, label: 'Granted' }
  if (status === 'denied') return { tone: 'warning' as const, label: 'Denied' }
  if (status === 'prompt' || status === 'prompt-with-rationale') {
    return { tone: 'warning' as const, label: 'Needs permission' }
  }
  return { tone: 'neutral' as const, label: 'Android only' }
}

function sizeLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function dateLabel(timestamp: number): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function BackupView() {
  const {
    enabled,
    setEnabled,
    isNative,
    online,
    tokenSaved,
    permissions,
    photos,
    lastRun,
    error,
    requestPermissions,
    refreshAll,
    saveToken,
    clearToken,
    testConnection,
    openWarning,
  } = useAutoBackup()

  const [tokenDraft, setTokenDraft] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [tokenMessage, setTokenMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const photoBadge = permissionBadge(permissions?.photos)
  const cameraBadge = permissionBadge(permissions?.camera)
  const newPhotos = photos.filter((photo) => !photo.uploaded)
  const visiblePhotos = photos.slice(0, 60)

  const handleSave = async () => {
    setSaving(true)
    setTokenMessage(null)
    try {
      await saveToken(tokenDraft)
      setTokenDraft('')
      setTokenMessage({ tone: 'ok', text: 'Token saved in encrypted device storage.' })
    } catch (reason) {
      setTokenMessage({ tone: 'error', text: reason instanceof Error ? reason.message : 'Could not save token.' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTokenMessage(null)
    const result = await testConnection()
    setTokenMessage({
      tone: result.ok ? 'ok' : 'error',
      text: result.ok ? `Connected as ${result.user ?? 'Yandex user'}.` : result.message ?? 'Connection failed.',
    })
    setTesting(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            <CloudUpload className="h-3.5 w-3.5" />
            Automation
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Auto backup
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">
            At 3:00 AM, while QR-JOEic is open, a warning asks for permission before uploading new camera photos to{' '}
            {BACKUP_FOLDER_LABEL}. Nothing runs in the background.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">QR-JOEic</Badge>
          <Badge tone={online ? 'success' : 'warning'}>
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </header>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-2.5 text-[11px] leading-relaxed text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={Clock}
              title="Schedule"
              description="Consent-gated check at 3:00 AM local time."
            />
            <div className="mt-4 space-y-3">
              <Toggle
                checked={enabled}
                onChange={setEnabled}
                label="Enable the 3:00 AM warning"
                description="The check only happens while QR-JOEic is open. No notification or background service."
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Time</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-100">03:00 AM</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Destination</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-100">{BACKUP_FOLDER_LABEL}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
                <span className="text-[11px] text-zinc-400">Last run</span>
                {lastRun ? (
                  <Badge tone={lastRun.status === 'completed' ? 'success' : lastRun.status === 'failed' ? 'warning' : 'neutral'}>
                    {lastRun.status}
                  </Badge>
                ) : (
                  <Badge>never</Badge>
                )}
                <span className="text-[11px] text-zinc-500">
                  {lastRun ? relativeTime(lastRun.at) : 'No backup yet'}
                  {lastRun?.uploaded !== undefined ? ` · ${lastRun.uploaded} uploaded` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => void openWarning()}>
                  <CloudUpload className="h-4 w-4" />
                  Backup now
                </Button>
                <Button variant="secondary" onClick={() => void openWarning()}>
                  <Clock className="h-4 w-4" />
                  Preview 3 AM warning
                </Button>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                The warning asks <span className="text-zinc-300">“Auto backup at 03:00 · Allow?”</span> before any
                upload. Nothing is sent if you tap Not now.
              </p>
            </div>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={ShieldCheck}
              title="Permissions"
              description="Photos are read locally. Files use Android's system picker."
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-black/15 px-3 py-2.5">
                <Camera className="h-4 w-4 text-brand-300" />
                <span className="flex-1 text-xs text-zinc-300">Camera</span>
                <Badge tone={cameraBadge.tone}>{cameraBadge.label}</Badge>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-black/15 px-3 py-2.5">
                <Image className="h-4 w-4 text-brand-300" />
                <span className="flex-1 text-xs text-zinc-300">Photos &amp; gallery</span>
                <Badge tone={photoBadge.tone}>{photoBadge.label}</Badge>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-black/15 px-3 py-2.5">
                <FolderOpen className="h-4 w-4 text-brand-300" />
                <span className="flex-1 text-xs text-zinc-300">Files</span>
                <Badge tone="neutral">System picker</Badge>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Android 13+ uses <span className="font-mono text-zinc-400">READ_MEDIA_IMAGES</span> for photos and
                the system file picker for everything else. Older Android uses legacy storage permission.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={() => void requestPermissions()} disabled={!isNative}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Request permissions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!isNative}
                  onClick={() => void CameraBackup.openAppSettings()}
                >
                  Open app settings
                </Button>
              </div>
            </div>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={KeyRound}
              title="Yandex Disk"
              description="Folder: disk:/IT. The token is stored on-device."
            />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge tone={tokenSaved ? 'success' : 'warning'}>
                  {tokenSaved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {tokenSaved ? 'Token saved' : 'Not connected'}
                </Badge>
                <a
                  href="https://oauth.yandex.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-300 hover:text-brand-200"
                >
                  Get an OAuth token
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Field label="OAuth token" hint="cloud_api:disk.write">
                <div className="flex gap-2">
                  <TextInput
                    type={showToken ? 'text' : 'password'}
                    value={tokenDraft}
                    onChange={(event) => setTokenDraft(event.target.value)}
                    placeholder="y0_Ag…"
                    spellCheck={false}
                    autoComplete="off"
                    disabled={!isNative}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setShowToken((value) => !value)} disabled={!isNative}>
                    {showToken ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={!isNative || saving}>
                  {saving ? 'Saving…' : 'Save token'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleTest()}
                  disabled={!isNative || testing || !tokenSaved}
                >
                  {testing ? 'Testing…' : 'Test connection'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearToken()}
                  disabled={!isNative || !tokenSaved}
                >
                  Clear
                </Button>
              </div>
              {tokenMessage ? (
                <p
                  className={cn(
                    'text-[11px] leading-relaxed',
                    tokenMessage.tone === 'ok' ? 'text-emerald-300' : 'text-rose-300',
                  )}
                >
                  {tokenMessage.text}
                </p>
              ) : null}
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Tokens are used only for Yandex Disk requests and are not included in the web bundle. Uploads go to{' '}
                <span className="font-mono text-zinc-400">{BACKUP_FOLDER}</span>.
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <SectionHeading
                icon={Image}
                title="Camera photo queue"
                description="Only images captured in DCIM/Camera are listed."
              />
              <Button variant="ghost" size="sm" onClick={() => void handleRefresh()} disabled={refreshing}>
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{newPhotos.length} new</Badge>
              <Badge>{photos.length} camera photos</Badge>
              {!online ? <Badge tone="warning">Paused offline</Badge> : null}
            </div>

            {!isNative ? (
              <div className="mt-3 rounded-xl border border-brand-400/20 bg-brand-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-brand-100">
                Photo access and Yandex Disk upload run in the Android build. Use “Preview 3 AM warning” to inspect
                the flow here.
              </div>
            ) : null}

            {!online ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
                <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Offline. Photo listing and uploads are paused until the connection returns.
              </div>
            ) : permissions?.photos !== 'granted' ? (
              <div className="mt-3">
                <EmptyState
                  icon={Image}
                  title="Photo access needed"
                  description="Grant access to let QR-JOEic find camera photos. It will still ask before every upload."
                  action={
                    <Button variant="primary" size="sm" onClick={() => void requestPermissions()} disabled={!isNative}>
                      Grant photo access
                    </Button>
                  }
                />
              </div>
            ) : newPhotos.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={CheckCircle2}
                  title="No new camera photos"
                  description="Everything captured so far has already been backed up, or the camera folder is empty."
                />
              </div>
            ) : (
              <div className="mt-3 space-y-1.5">
                {visiblePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-black/15 px-2.5 py-2"
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1',
                        photo.uploaded
                          ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20'
                          : 'bg-brand-500/10 text-brand-300 ring-brand-400/20',
                      )}
                    >
                      {photo.uploaded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-zinc-200">{photo.name}</p>
                      <p className="text-[10px] text-zinc-600">
                        {dateLabel(photo.dateTaken)} · {sizeLabel(photo.size)}
                      </p>
                    </div>
                    <Badge tone={photo.uploaded ? 'success' : 'brand'}>{photo.uploaded ? 'Uploaded' : 'New'}</Badge>
                  </div>
                ))}
                {photos.length > visiblePhotos.length ? (
                  <p className="pt-1 text-center text-[10px] text-zinc-600">
                    Showing first {visiblePhotos.length} of {photos.length}
                  </p>
                ) : null}
              </div>
            )}
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading
              icon={Cloud}
              title="How it works"
              description="Automatic only after you allow it."
            />
            <ol className="mt-4 space-y-2.5">
              {[
                'At 03:00, while the app is open, a warning appears and asks Allow?',
                'After you tap Allow, new camera photos are uploaded to Yandex Disk › IT with visible progress.',
                'Tokens and upload state stay on the device. No notification or hidden background service is used.',
                'If you tap Not now, that day is marked skipped and nothing is uploaded.',
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5 text-[11px] leading-relaxed text-zinc-400">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] font-semibold text-zinc-300 ring-1 ring-white/10">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/6 bg-black/15 px-3 py-2.5 text-[10px] text-zinc-500">
              <FolderUp className="h-3.5 w-3.5 text-brand-300" />
              Camera photos only · destination {BACKUP_FOLDER_LABEL}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
