import { useCallback, useEffect, useRef, useState } from 'react'

export type NoticeTone = 'success' | 'error' | 'info'

export interface Notice {
  id: number
  text: string
  tone: NoticeTone
}

export function useNotice(timeout = 3400) {
  const [notice, setNotice] = useState<Notice | null>(null)
  const idRef = useRef(0)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.id === notice.id ? null : current))
    }, timeout)
    return () => window.clearTimeout(timer)
  }, [notice, timeout])

  const notify = useCallback((text: string, tone: NoticeTone = 'success') => {
    idRef.current += 1
    setNotice({ id: idRef.current, text, tone })
  }, [])

  const dismiss = useCallback(() => setNotice(null), [])

  return { notice, notify, dismiss }
}
