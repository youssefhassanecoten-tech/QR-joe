export type LabelLang = 'en' | 'ru'

const TYPE_RU: Record<string, string> = {
  Link: 'Ссылка',
  Text: 'Текст',
  Email: 'Почта',
  Phone: 'Телефон',
  SMS: 'SMS',
  'Wi-Fi': 'Wi-Fi',
  Location: 'Геолокация',
  Card: 'Карточка',
  Music: 'Музыка',
  vCard: 'vCard',
  Audio: 'Аудио',
  Contact: 'Контакт',
}

export function typeLabel(type: string, lang: LabelLang): string {
  if (lang === 'en') return type
  return TYPE_RU[type] ?? type
}

const LABEL_PREFIXES: Array<[string, string]> = [
  ['Card → ', 'Карточка → '],
  ['Music → ', 'Музыка → '],
  ['Email → ', 'Почта → '],
  ['Call → ', 'Звонок → '],
  ['SMS → ', 'SMS → '],
  ['Wi-Fi → ', 'Wi-Fi → '],
  ['Location → ', 'Геолокация → '],
  ['Digital card', 'Цифровая карточка'],
]

export function localizeLabel(label: string, lang: LabelLang): string {
  if (lang === 'en') return label
  for (const [english, russian] of LABEL_PREFIXES) {
    if (label.startsWith(english)) return russian + label.slice(english.length)
  }
  return label
}
