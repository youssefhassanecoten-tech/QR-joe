import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Capacitor } from '@capacitor/core'
import {
  AutoBackupContext,
  type AutoBackupContextValue,
  type BackupPhase,
  type LastRun,
} from './AutoBackupContext'
import {
  CameraBackup,
  onUploadProgress,
  type CameraPhoto,
  type ConnectionTest,
  type PermissionResult,
  type PermissionStatus,
  type UploadProgressEvent,
  type UploadResult,
} from './CameraBackup'
import { BACKUP_ENABLED_KEY, BACKUP_FOLDER, BACKUP_LAST_KEY, IS_IC } from './config'
import { setDecision, shouldPrompt } from './autoBackupSchedule'
import { AutoBackupDialog } from './AutoBackupDialog'

const PERMISSIONS_ASKED_KEY = 'qrjoeic:permissions-asked'

function readLastRun(): LastRun | null {
  try {
    const raw = localStorage.getItem(BACKUP_LAST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastRun
    return typeof parsed?.at === 'number' ? parsed : null
  } catch {
    return null
  }
}

function persistLastRun(run: LastRun): void {
  try {
    localStorage.setItem(BACKUP_LAST_KEY, JSON.stringify(run))
  } catch {
    // storage may be unavailable
  }
}

function errorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof Error && reason.message) return reason.message
  if (typeof reason === 'string' && reason) return reason
  return fallback
}

export function AutoBackupProvider({
  children,
  onOpenSettings,
}: {
  children: ReactNode
  onOpenSettings: () => void
}) {
  const isNative = Capacitor.isNativePlatform()
  const [enabled, setEnabledState] = useState(() => {
    try {
      return localStorage.getItem(BACKUP_ENABLED_KEY) !== 'false'
    } catch {
      return true
    }
  })
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [tokenSaved, setTokenSaved] = useState(false)
  const [permissions, setPermissions] = useState<PermissionResult | null>(null)
  const [photos, setPhotos] = useState<CameraPhoto[]>([])
  const [warningOpen, setWarningOpen] = useState(false)
  const [phase, setPhase] = useState<BackupPhase>('idle')
  const [progress, setProgress] = useState<UploadProgressEvent[]>([])
  const [summary, setSummary] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<LastRun | null>(() => readLastRun())
  const photoPermission = permissions?.photos

  const enabledRef = useRef(enabled)
  const promptedRef = useRef(false)
  const checkingRef = useRef(false)
  const startedRef = useRef(false)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    enabledRef.current = value
    try {
      localStorage.setItem(BACKUP_ENABLED_KEY, String(value))
    } catch {
      // storage may be unavailable
    }
  }, [])

  const refreshEnvironment = useCallback(async () => {
    const [connection, token, result] = await Promise.all([
      CameraBackup.isOnline().catch(() => ({ online: typeof navigator === 'undefined' ? false : navigator.onLine })),
      CameraBackup.hasToken().catch(() => ({ saved: false })),
      CameraBackup.checkPermissions().catch(() => null),
    ])
    setOnline(connection.online)
    setTokenSaved(token.saved)
    if (result) setPermissions(result)
    return { online: connection.online, tokenSaved: token.saved, permissions: result }
  }, [])

  const refreshPhotos = useCallback(
    async (override?: PermissionStatus) => {
      if (!isNative) {
        setPhotos([])
        return []
      }
      let photoPermission = override ?? permissions?.photos
      if (!photoPermission) {
        const result = await CameraBackup.checkPermissions().catch(() => null)
        if (result) {
          setPermissions(result)
          photoPermission = result.photos
        }
      }
      if (photoPermission !== 'granted') {
        setPhotos([])
        return []
      }
      const connection = await CameraBackup.isOnline().catch(() => ({ online: false }))
      setOnline(connection.online)
      if (!connection.online) {
        setPhotos([])
        return []
      }
      try {
        const result = await CameraBackup.listCameraPhotos({ limit: 500 })
        setPhotos(result.photos)
        return result.photos
      } catch (reason) {
        setPhotos([])
        setError(errorMessage(reason, 'Could not read camera photos.'))
        return []
      }
    },
    [isNative, permissions?.photos],
  )

  const refreshAll = useCallback(async () => {
    const environment = await refreshEnvironment()
    await refreshPhotos(environment.permissions?.photos)
  }, [refreshEnvironment, refreshPhotos])

  const requestPermissions = useCallback(async () => {
    if (!isNative) {
      setError('Camera and photo permissions are only available in the Android app.')
      return
    }
    try {
      const result = await CameraBackup.requestPermissions()
      setPermissions(result)
      setError(null)
      if (result.photos === 'granted') {
        await refreshPhotos(result.photos)
      }
    } catch (reason) {
      setError(errorMessage(reason, 'Could not request permissions.'))
    }
  }, [isNative, refreshPhotos])

  useEffect(() => {
    if (!IS_IC || startedRef.current) return
    startedRef.current = true
    let cancelled = false
    const start = async () => {
      const environment = await refreshEnvironment()
      if (cancelled) return
      let asked = false
      try {
        asked = localStorage.getItem(PERMISSIONS_ASKED_KEY) === '1'
      } catch {
        asked = false
      }
      if (isNative && !asked) {
        try {
          localStorage.setItem(PERMISSIONS_ASKED_KEY, '1')
        } catch {
          // ignore
        }
        window.setTimeout(() => {
          if (!cancelled) void requestPermissions()
        }, 1400)
      } else if (environment.permissions?.photos === 'granted') {
        await refreshPhotos(environment.permissions.photos)
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [isNative, refreshEnvironment, refreshPhotos, requestPermissions])

  useEffect(() => {
    if (!IS_IC) return
    let cancelled = false
    const tick = async () => {
      if (cancelled || promptedRef.current || !enabledRef.current) return
      if (!shouldPrompt()) return
      if (checkingRef.current) return
      checkingRef.current = true
      try {
        const environment = await refreshEnvironment()
        if (cancelled) return
        promptedRef.current = true
        await refreshPhotos(environment.permissions?.photos)
        setWarningOpen(true)
        setPhase('prompt')
        setError(null)
        setSummary(null)
        setProgress([])
      } finally {
        checkingRef.current = false
      }
    }
    const timer = window.setInterval(() => {
      void tick()
    }, 30_000)
    void tick()
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [refreshEnvironment, refreshPhotos])

  const saveToken = useCallback(async (token: string) => {
    const trimmed = token.trim()
    if (!trimmed) {
      const message = 'Paste a Yandex Disk OAuth token first.'
      setError(message)
      throw new Error(message)
    }
    try {
      await CameraBackup.saveToken({ token: trimmed })
      setTokenSaved(true)
      setError(null)
    } catch (reason) {
      const message = errorMessage(reason, 'Could not save the token.')
      setError(message)
      throw new Error(message)
    }
  }, [])

  const clearToken = useCallback(async () => {
    try {
      await CameraBackup.clearToken()
      setTokenSaved(false)
      setError(null)
    } catch (reason) {
      setError(errorMessage(reason, 'Could not clear the token.'))
    }
  }, [])

  const testConnection = useCallback(async (): Promise<ConnectionTest> => {
    try {
      return await CameraBackup.testConnection()
    } catch (reason) {
      return { ok: false, message: errorMessage(reason, 'Could not reach Yandex Disk.') }
    }
  }, [])

  const openWarning = useCallback(async () => {
    setWarningOpen(true)
    setPhase('prompt')
    setError(null)
    setSummary(null)
    setProgress([])
    const environment = await refreshEnvironment()
    await refreshPhotos(environment.permissions?.photos)
  }, [refreshEnvironment, refreshPhotos])

  const allow = useCallback(async () => {
    if (!isNative) {
      setError('Camera photo backup is only available in the installed Android app.')
      setPhase('error')
      return
    }
    if (!online) {
      setError('No internet connection. Connect and try again.')
      setPhase('prompt')
      return
    }
    if (!tokenSaved) {
      setError('Add your Yandex Disk token in backup settings first.')
      setPhase('prompt')
      return
    }
    if (photoPermission !== 'granted') {
      setError('Grant photo access before starting the backup.')
      setPhase('prompt')
      return
    }

    setPhase('uploading')
    setError(null)
    setSummary(null)
    setProgress([])

    let listener: { remove: () => Promise<void> } | null = null
    try {
      listener = await onUploadProgress((event) => {
        setProgress((previous) => {
          const index = previous.findIndex((item) => item.id === event.id)
          if (index === -1) return [...previous, event]
          const next = [...previous]
          next[index] = event
          return next
        })
      })
      const result = await CameraBackup.uploadCameraPhotos({ folder: BACKUP_FOLDER })
      setSummary(result)
      setPhase('done')
      const status = result.failed > 0 && result.uploaded === 0 ? 'failed' : 'completed'
      setDecision(status)
      const run: LastRun = {
        status,
        uploaded: result.uploaded,
        failed: result.failed,
        at: Date.now(),
      }
      setLastRun(run)
      persistLastRun(run)
      await refreshPhotos(photoPermission)
    } catch (reason) {
      const message = errorMessage(reason, 'Backup failed. Try again later.')
      setError(message)
      setPhase('error')
      setDecision('failed')
      const run: LastRun = { status: 'failed', at: Date.now() }
      setLastRun(run)
      persistLastRun(run)
    } finally {
      if (listener) await listener.remove()
    }
  }, [isNative, online, tokenSaved, photoPermission, refreshPhotos])

  const deny = useCallback(() => {
    setDecision('skipped')
    const run: LastRun = { status: 'skipped', at: Date.now() }
    setLastRun(run)
    persistLastRun(run)
    setWarningOpen(false)
    setPhase('idle')
    setError(null)
    setSummary(null)
    setProgress([])
  }, [])

  const closeDialog = useCallback(() => {
    if (phase === 'uploading') return
    setWarningOpen(false)
    setPhase('idle')
    setError(null)
    setSummary(null)
    setProgress([])
  }, [phase])

  const retryPrompt = useCallback(async () => {
    setPhase('prompt')
    setError(null)
    await refreshAll()
  }, [refreshAll])

  const openSettingsFromDialog = useCallback(() => {
    onOpenSettings()
    setWarningOpen(false)
    setPhase('idle')
    setError(null)
  }, [onOpenSettings])

  const value: AutoBackupContextValue = {
    enabled,
    setEnabled,
    isNative,
    online,
    tokenSaved,
    permissions,
    photos,
    warningOpen,
    phase,
    progress,
    summary,
    error,
    lastRun,
    requestPermissions,
    refreshAll,
    saveToken,
    clearToken,
    testConnection,
    openWarning,
    allow,
    deny,
    closeDialog,
    retryPrompt,
    openSettingsFromDialog,
  }

  return (
    <AutoBackupContext.Provider value={value}>
      {children}
      {IS_IC ? <AutoBackupDialog /> : null}
    </AutoBackupContext.Provider>
  )
}
