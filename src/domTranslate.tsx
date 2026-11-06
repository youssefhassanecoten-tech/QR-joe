import { useEffect } from 'react'
import { ruDictionary, useI18n } from './i18n'

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'PRE', 'CODE'])
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const

const originalTexts = new Map<Text, string>()
const originalAttrs = new Map<Element, Map<string, string>>()
let observer: MutationObserver | null = null
let active = false

function skipped(node: Node): boolean {
  let element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
  while (element) {
    if (SKIP_TAGS.has(element.tagName) || element.hasAttribute('data-no-translate')) return true
    element = element.parentElement
  }
  return false
}

function ruPlural(value: number, one: string, few: string, many: string): string {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function translatePattern(value: string): string | null {
  const simple = value.match(/^(\d+)m ago$/)
  if (simple) return `${simple[1]} мин назад`
  const hours = value.match(/^(\d+)h ago$/)
  if (hours) return `${hours[1]} ч назад`
  const days = value.match(/^(\d+)d ago$/)
  if (days) return `${days[1]} дн назад`
  const entries = value.match(/^(\d+) entries$/)
  if (entries) {
    const count = Number(entries[1])
    return `${entries[1]} ${ruPlural(count, 'запись', 'записи', 'записей')}`
  }
  const codes = value.match(/^Batch · (\d+) codes$/)
  if (codes) {
    const count = Number(codes[1])
    return `Пакет · ${codes[1]} ${ruPlural(count, 'код', 'кода', 'кодов')}`
  }
  const singleCodes = value.match(/^(\d+) codes$/)
  if (singleCodes) {
    const count = Number(singleCodes[1])
    return `${singleCodes[1]} ${ruPlural(count, 'код', 'кода', 'кодов')}`
  }
  const seed = value.match(/^Seed (\d+)$/)
  if (seed) return `Сид ${seed[1]}`
  const noMatches = value.match(/^No entries match "(.+)"\.$/)
  if (noMatches) return `Нет записей по запросу «${noMatches[1]}».`
  const time = value.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)
  if (time) {
    let hour = Number(time[1])
    if (time[3] === 'PM' && hour < 12) hour += 12
    if (time[3] === 'AM' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${time[2]}`
  }
  const all = value.match(/^All \((\d+)\)$/)
  if (all) return `Все (${all[1]})`
  const exportSize = value.match(/^(\d+)px export$/i)
  if (exportSize) return `Экспорт ${exportSize[1]}px`
  const chars = value.match(/^(\d+) chars$/)
  if (chars) return `${chars[1]} символов`
  const scannedAt = value.match(/^Scanned at (.+)$/)
  if (scannedAt) return `Отсканировано в ${scannedAt[1]}`
  const updated = value.match(/^Updated (.+)$/)
  if (updated) return `Обновлено ${updated[1]}`
  const prefixes: Array<[RegExp, string]> = [
    [/^Card → (.+)$/, 'Карточка → $1'],
    [/^Music → (.+)$/, 'Музыка → $1'],
    [/^Email → (.+)$/, 'Почта → $1'],
    [/^Call → (.+)$/, 'Звонок → $1'],
    [/^SMS → (.+)$/, 'SMS → $1'],
    [/^Wi-Fi → (.+)$/, 'Wi-Fi → $1'],
    [/^Location → (.+)$/, 'Геолокация → $1'],
    [/^(.*) · max ~([\d,]+) chars$/, '$1 · макс. ~$2 символов'],
    [/^(\d+) new$/, '$1 новых'],
    [/^(\d+) camera photos$/, '$1 фото камеры'],
    [/^Showing first (\d+) of (\d+)$/, 'Показаны первые $1 из $2'],
    [/^(\d+) uploaded · (\d+) failed$/, '$1 загружено · $2 ошибок'],
    [/^(\d+) uploaded$/, '$1 загружено'],
    [/^(\d+) failed$/, '$1 ошибок'],
    [/^Allow & upload (\d+) photos$/, 'Разрешить и загрузить $1 фото'],
    [/^Allow & upload (\d+) photo$/, 'Разрешить и загрузить $1 фото'],
  ]
  for (const [pattern, replacement] of prefixes) {
    if (pattern.test(value)) return value.replace(pattern, replacement)
  }
  return null
}

function translateValue(value: string): string | null {
  const core = value.trim()
  if (!core) return null
  const direct = ruDictionary[core]
  if (direct) return direct
  return translatePattern(core)
}

function withWhitespace(original: string, translated: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? ''
  const trailing = original.match(/\s*$/)?.[0] ?? ''
  return `${leading}${translated}${trailing}`
}

function translateNode(node: Node): void {
  if (skipped(node)) return

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node as Text
    const value = text.nodeValue
    if (!value) return
    const translated = translateValue(value)
    if (!translated) return
    const next = withWhitespace(value, translated)
    if (next === value) return
    if (!originalTexts.has(text)) originalTexts.set(text, value)
    text.nodeValue = next
    return
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element
    for (const attribute of ATTRS) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      const translated = translateValue(value)
      if (!translated) continue
      const next = withWhitespace(value, translated)
      if (next === value) continue
      const map = originalAttrs.get(element) ?? new Map<string, string>()
      if (!map.has(attribute)) map.set(attribute, value)
      originalAttrs.set(element, map)
      element.setAttribute(attribute, next)
    }
  }

  for (const child of Array.from(node.childNodes)) translateNode(child)
}

function restore(): void {
  for (const [text, value] of originalTexts) text.nodeValue = value
  originalTexts.clear()
  for (const [element, attributes] of originalAttrs) {
    for (const [attribute, value] of attributes) element.setAttribute(attribute, value)
  }
  originalAttrs.clear()
}

function start(): void {
  if (active) return
  active = true
  translateNode(document.body)
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
        translateNode(mutation.target)
      } else if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => translateNode(node))
      } else if (mutation.type === 'attributes') {
        translateNode(mutation.target)
      }
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRS],
  })
}

function stop(): void {
  if (!active) return
  active = false
  observer?.disconnect()
  observer = null
  restore()
}

export function DomTranslator() {
  const { lang } = useI18n()
  useEffect(() => {
    if (lang === 'ru') start()
    else stop()
    return () => stop()
  }, [lang])
  return null
}
