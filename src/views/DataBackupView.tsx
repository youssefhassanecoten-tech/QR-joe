import { useMemo, useState } from 'react'
import { ArrowLeft, Database, Download, Lock, ShieldCheck, Upload } from 'lucide-react'
import { VERSION } from '../version'
import { backupCounts, collectBackupValues, createEncryptedBackup, restoreEncryptedBackup } from '../lib/backup'
import { downloadBlob } from '../lib/utils'
import { Badge, Button, Field, Panel, SectionHeading, TextInput } from '../components/ui'

export function DataBackupView({ onBack }: { onBack: () => void }) {
  const [exportPass, setExportPass] = useState('')
  const [exportConfirm, setExportConfirm] = useState('')
  const [importPass, setImportPass] = useState('')
  const [importText, setImportText] = useState('')
  const [importName, setImportName] = useState('')
  const [busy, setBusy] = useState<'export' | 'import' | null>(null)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const counts = useMemo(() => backupCounts(collectBackupValues()), [])

  const exportVault = async () => {
    setNotice(null)
    if (exportPass !== exportConfirm) {
      setNotice({ tone: 'error', text: 'Passphrases do not match.' })
      return
    }
    setBusy('export')
    try {
      const text = await createEncryptedBackup(exportPass)
      const stamp = new Date().toISOString().slice(0, 10)
      downloadBlob(
        new Blob([text], { type: 'application/json;charset=utf-8' }),
        `qr-joe-vault-${stamp}.qrjoe`,
      )
      setExportPass('')
      setExportConfirm('')
      setNotice({ tone: 'ok', text: 'Encrypted backup downloaded.' })
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Backup failed.' })
    } finally {
      setBusy(null)
    }
  }

  const pickFile = async (file: File) => {
    setImportText(await file.text())
    setImportName(file.name)
    setNotice(null)
  }

  const restoreVault = async () => {
    setNotice(null)
    if (!importText) {
      setNotice({ tone: 'error', text: 'Choose a .qrjoe backup file first.' })
      return
    }
    if (!window.confirm('Restore this backup? It will overwrite the current cards, history, designs and settings.')) {
      return
    }
    setBusy('import')
    try {
      const result = await restoreEncryptedBackup(importText, importPass)
      setNotice({
        tone: 'ok',
        text: `Restored ${result.count} settings. Version ${result.version}. Reloading…`,
      })
      window.setTimeout(() => window.location.reload(), 900)
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Restore failed.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-1">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Button>

      <header>
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-300">
          <Database className="h-3.5 w-3.5" />
          Vault
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Encrypted backup
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          Export or restore all QR-JOE data as one passphrase-protected <span className="font-mono">.qrjoe</span>{' '}
          file. Nothing is uploaded.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge tone="brand">AES-256-GCM</Badge>
        <Badge>PBKDF2 · 150k</Badge>
        <Badge tone="success">Local only</Badge>
        <Badge>{counts.profiles} cards · {counts.history} history</Badge>
      </div>

      {notice ? (
        <div
          className={`rounded-xl border px-3.5 py-2.5 text-[11px] leading-relaxed ${
            notice.tone === 'ok'
              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-400/20 bg-rose-500/10 text-rose-100'
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <SectionHeading
          icon={Download}
          title="Export vault"
          description="Create an encrypted backup of designs, cards, history, language, theme and animation settings."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Passphrase" hint="min 8 characters">
            <TextInput
              type="password"
              value={exportPass}
              onChange={(event) => setExportPass(event.target.value)}
              placeholder="Long passphrase"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Repeat passphrase">
            <TextInput
              type="password"
              value={exportConfirm}
              onChange={(event) => setExportConfirm(event.target.value)}
              placeholder="Repeat passphrase"
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={() => void exportVault()} disabled={busy !== null}>
            <Lock className="h-4 w-4" />
            {busy === 'export' ? 'Encrypting…' : 'Download .qrjoe'}
          </Button>
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            The passphrase is never stored.
          </span>
        </div>
      </Panel>

      <Panel className="p-4 sm:p-5">
        <SectionHeading
          icon={Upload}
          title="Restore vault"
          description="Restore from a .qrjoe file. This replaces current local data."
        />
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/12 bg-black/15 px-4 py-6 text-center transition hover:border-brand-400/40 hover:bg-brand-500/5">
            <Upload className="h-5 w-5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200">
              {importName || 'Choose a .qrjoe backup'}
            </span>
            <span className="text-[11px] text-zinc-500">Encrypted JSON envelope</span>
            <input
              type="file"
              accept=".qrjoe,.json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void pickFile(file)
              }}
            />
          </label>
          <Field label="Passphrase">
            <TextInput
              type="password"
              value={importPass}
              onChange={(event) => setImportPass(event.target.value)}
              placeholder="Passphrase used at export"
              autoComplete="current-password"
            />
          </Field>
          <Button variant="secondary" onClick={() => void restoreVault()} disabled={busy !== null || !importText}>
            <Database className="h-4 w-4" />
            {busy === 'import' ? 'Restoring…' : 'Restore backup'}
          </Button>
        </div>
      </Panel>

      <p className="text-center text-[10px] text-zinc-600">
        QR-JOE v{VERSION} · local-only vault · no server involved
      </p>
    </div>
  )
}
