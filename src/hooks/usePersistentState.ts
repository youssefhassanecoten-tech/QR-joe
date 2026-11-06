import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { isPlainObject } from '../lib/utils'

export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const parsed: unknown = JSON.parse(raw)
      if (isPlainObject(initial) && isPlainObject(parsed)) {
        return { ...initial, ...parsed } as T
      }
      if (Array.isArray(initial) && Array.isArray(parsed)) {
        return parsed as T
      }
      return parsed as T
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // storage unavailable or full — keep working in-memory
    }
  }, [key, state])

  return [state, setState]
}
