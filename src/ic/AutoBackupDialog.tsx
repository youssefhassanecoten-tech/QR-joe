import { useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudUpload,
  FolderUp,
  Image,
  KeyRound,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react'
import { useAutoBackup } from './AutoBackupContext'
import { BACKUP_FOLDER_LABEL } from './config'
import { WARNING_QUESTION, WARNING_TITLE } from './autoBackupSchedule'
import { Badge, Button, IconButton, Spinner } from '../components/ui'
import { cn } from '../lib/utils'

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wifi
  label: string
  value: string
  tone: 'ok' | 'warn' | 'bad'
}) {
  const tones = {
    ok: 'text-emerald-300',
    warn: 'text-amber-300',
    bad: 'text-rose-300',
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/6 bg-black/20 px-3 py-2">
      <Icon className={cn('h-3.5 w-3.5 shrink-0', tones[tone])} />
      <span className="flex-1 text-[11px] text-zinc-400">{label}</span>
      <span className={cn('text-[11px] font-semibold', tones[tone])}>{value}</span>
    </div>
  )
}

export function AutoBackupDialog() {
  const {
    warningOpen,
    phase,
    online,
    tokenSaved,
    permissions,
    photos,
    progress,
    summary,
    error,
    allow,
    deny,
    closeDialog,
    retryPrompt,
    openSettingsFromDialog,
  } = useAutoBackup()

  const uploading = phase === 'uploading'
  const canClose = !uploading
  const photoPermission = permissions?.photos ?? 'unavailable'
  const newPhotos = photos.filter((photo) => !photo.uploaded)
  const ready = online && tokenSaved && photoPermission === 'granted'
  const total = summary?.total ?? progress[0]?.total ?? newPhotos.length
  const finished = progress.filter((item) => item.status === 'uploaded' || item.status === 'failed').length
  const percent = total > 0 ? Math.min(100, Math.round((finished / total) * 100)) : 0

  useEffect(() => {
    if (!warningOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || uploading) return
      if (phase === 'prompt') deny()
      else closeDialog()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [warningOpen, uploading, phase, deny, closeDialog])

  if (!warningOpen) return null

  const dismiss = () => {
    if (phase === 'prompt') deny()
    else closeDialog()
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-backup-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/60">
        <div className="relative border-b border-white/8 bg-gradient-to-br from-brand-500/25 via-brand-500/10 to-aqua-500/10 p-5 pr-14">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-200">
            <Clock className="h-3.5 w-3.5" />
            Scheduled warning
          </div>
          <h2 id="auto-backup-title" className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
            {WARNING_TITLE}
          </h2>
          <p className="mt-1 text-sm font-semibold text-brand-100">
            {WARNING_QUESTION}{' '}
            <span className="font-normal text-zinc-300">Upload camera photos to {BACKUP_FOLDER_LABEL}.</span>
          </p>
          {canClose ? (
            <IconButton
              size="icon-sm"
              aria-label="Close backup warning"
              onClick={dismiss}
              className="absolute right-3 top-3"
            >
              <X className="h-4 w-4" />
            </IconButton>
          ) : null}
        </div>

        <div className="max-h-[70svh] space-y-4 overflow-y-auto p-5">
          {phase === 'uploading' ? (
            <>
              <div className="flex items-center gap-2">
                <Badge tone="brand">Backup running</Badge>
                <span className="text-[11px] text-zinc-500">
                  {finished}/{total || '?'} photos
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-aqua-400 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Keep QR-JOEic open until this finishes. No background service is used.
              </p>
              <div className="max-h-52 space-y-1.5 overflow-y-auto">
                {progress.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border border-white/6 bg-black/20 px-2.5 py-1.5"
                  >
                    {item.status === 'uploading' ? (
                      <Spinner className="h-3 w-3 text-brand-300" />
                    ) : item.status === 'uploaded' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    ) : (
                      <XCircle className="h-3 w-3 text-rose-300" />
                    )}
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-300">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] text-zinc-500">{item.status}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {phase === 'prompt' ? (
            <>
              <div className="space-y-1.5">
                <StatusRow
                  icon={online ? Wifi : WifiOff}
                  label="Internet"
                  value={online ? 'Connected' : 'Offline'}
                  tone={online ? 'ok' : 'bad'}
                />
                <StatusRow
                  icon={KeyRound}
                  label="Yandex token"
                  value={tokenSaved ? 'Saved' : 'Not set'}
                  tone={tokenSaved ? 'ok' : 'warn'}
                />
                <StatusRow
                  icon={Image}
                  label="Photo access"
                  value={
                    photoPermission === 'granted'
                      ? 'Granted'
                      : photoPermission === 'denied'
                        ? 'Denied'
                        : 'Needs permission'
                  }
                  tone={photoPermission === 'granted' ? 'ok' : photoPermission === 'denied' ? 'bad' : 'warn'}
                />
                <StatusRow
                  icon={FolderUp}
                  label="New camera photos"
                  value={`${newPhotos.length}`}
                  tone={newPhotos.length > 0 ? 'ok' : 'warn'}
                />
              </div>

              {newPhotos.length > 0 ? (
                <div className="rounded-xl border border-white/6 bg-black/15 p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Will upload
                  </p>
                  <div className="space-y-1">
                    {newPhotos.slice(0, 5).map((photo) => (
                      <p key={photo.id} className="truncate font-mono text-[10px] text-zinc-400">
                        {photo.name}
                      </p>
                    ))}
                    {newPhotos.length > 5 ? (
                      <p className="text-[10px] text-zinc-600">+{newPhotos.length - 5} more camera photos</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <p className="text-[11px] leading-relaxed text-zinc-500">
                Only photos captured by the camera in <span className="font-mono text-zinc-400">DCIM/Camera</span>{' '}
                are considered. Nothing is uploaded until you tap Allow, and the check only runs while QR-JOEic is
                open.
              </p>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-rose-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              ) : null}

              {!ready ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
                  {!online
                    ? 'No internet connection. Reconnect and retry, or tap Not now.'
                    : !tokenSaved
                      ? 'Yandex Disk is not connected yet. Add a token in Backup settings.'
                      : 'Photo access is required before the backup can run.'}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={deny}>
                  Not now
                </Button>
                {!online ? (
                  <Button variant="secondary" size="sm" onClick={() => void retryPrompt()}>
                    Retry
                  </Button>
                ) : null}
                {!tokenSaved || photoPermission !== 'granted' ? (
                  <Button variant="secondary" size="sm" onClick={openSettingsFromDialog}>
                    Open backup settings
                  </Button>
                ) : null}
                {ready ? (
                  <Button variant="primary" size="sm" onClick={() => void allow()}>
                    <CloudUpload className="h-3.5 w-3.5" />
                    Allow &amp; upload {newPhotos.length > 0 ? `${newPhotos.length} ` : ''}photo
                    {newPhotos.length === 1 ? '' : 's'}
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}

          {phase === 'done' && summary ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Backup complete</p>
                  <p className="text-[11px] text-zinc-500">
                    {summary.uploaded} uploaded · {summary.failed} failed
                  </p>
                </div>
              </div>
              {summary.total === 0 ? (
                <p className="rounded-xl border border-white/8 bg-black/15 px-3 py-2.5 text-[11px] text-zinc-400">
                  No new camera photos were found. Nothing was uploaded.
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <a
                  href="https://disk.yandex.ru/client/disk/IT"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Open Yandex Disk
                </a>
                <Button variant="primary" size="sm" onClick={closeDialog}>
                  Close
                </Button>
              </div>
            </>
          ) : null}

          {phase === 'error' ? (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error ?? 'The backup stopped unexpectedly.'}</span>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={closeDialog}>
                  Close
                </Button>
                {!tokenSaved || photoPermission !== 'granted' ? (
                  <Button variant="secondary" size="sm" onClick={openSettingsFromDialog}>
                    Open backup settings
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => void allow()}>
                    Try again
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
