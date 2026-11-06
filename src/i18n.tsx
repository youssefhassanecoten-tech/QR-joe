import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ruPhrases } from './ruPhrases'
import { ruPhrases2 } from './ruPhrases2'

export type Lang = 'en' | 'ru'

const STORAGE_KEY = 'qrjoe:lang'

const en: Record<string, string> = {
  'nav.studio': 'Studio',
  'nav.scan': 'Scanner',
  'nav.cards': 'Cards',
  'nav.history': 'History',
  'nav.backup': 'Backup',
  'nav.studio.hint': 'Design & export',
  'nav.scan.hint': 'Camera & uploads',
  'nav.cards.hint': 'Digital identity',
  'nav.history.hint': 'Recent activity',
  'nav.backup.hint': 'Yandex Disk',
  'brand.studio': 'Studio',
  'brand.autoBackup': 'Auto backup',
  'sidebar.workspace': 'Workspace',
  'sidebar.localBody': 'Scans, cards and designs stay in your browser. Nothing is uploaded.',
  'sidebar.icBody': 'Scans and cards stay on-device. Camera backup uploads only after you tap Allow.',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.next': 'Next',
  'common.previous': 'Back',
  'common.skip': 'Skip',
  'common.done': 'Done',
  'common.preview': 'Preview',
  'common.stop': 'Stop',
  'common.retry': 'Retry',
  'common.version': 'Version',
  'footer.rights': '© 2026 QR-JOE. All rights reserved.',
  'footer.agreement': 'By using QR-JOE you agree to the Privacy & Usage Policy.',
  'footer.legal': 'Privacy & Usage Policy',
  'footer.version': 'Version',
  'footer.language': 'Language',
  'footer.replay': 'Replay tutorial',
  'footer.local': 'Local-first',
  'legal.title': 'Privacy & Usage Policy',
  'legal.updated': 'Last updated',
  'legal.acceptance':
    'By accessing or using QR-JOE you accept this Policy. If you do not agree, do not use the product.',
  'legal.back': 'Back to app',
  'legal.disclaimer':
    'This document describes the current data practices of QR-JOE and is provided for transparency.',
  'version.title': 'Version & changes',
  'version.subtitle': 'A transparent history of what changed and when.',
  'version.current': 'Current version',
  'version.history': 'History',
  'version.currentChanges': 'Changes in this version',
  'version.previousChanges': 'Previous versions',
  'version.pdf': 'Full history PDF',
  'version.pdfNote': 'Coming soon',
  'version.replay': 'Replay tutorial',
  'version.latest': 'Latest',
  'version.released': 'Released',
  'version.emptyHistory': 'No earlier versions are in range.',
  'version.majorLimit': 'Showing the last 7 major versions.',
  'version.changeCount': 'changes',
  'scanSound.title': 'Scan sound',
  'scanSound.description': 'Play a sound whenever a QR code is successfully scanned.',
  'scanSound.enable': 'Play a sound on every successful scan',
  'scanSound.preset': 'Sound',
  'scanSound.preview': 'Preview',
  'scanSound.stop': 'Stop',
  'scanSound.note': 'This setting applies to every QR code scanned by QR-JOE on this device.',
  'scanSound.enabled': 'Enabled',
  'scanSound.disabled': 'Disabled',
  'sound.chime': 'Chime',
  'sound.ping': 'Ping',
  'sound.doorbell': 'Doorbell',
  'sound.startup': 'Startup',
  'sound.alert': 'Alert',
  'sound.soft': 'Soft',
  'tutorial.step': 'Step',
  'tutorial.skip': 'Skip tutorial',
  'tutorial.next': 'Next',
  'tutorial.previous': 'Back',
  'tutorial.done': 'Finish',
  'tutorial.of': 'of',
  'scannedCard.title': 'Scanned contact',
  'scannedCard.save': 'Save to contacts',
  'scannedCard.saving': 'Preparing…',
  'scannedCard.noTitle': 'No title',
  'scannedCard.animated': 'Animated card',
  'scannedCard.saveNote': 'Opens the share sheet — choose Contacts to import.',
}

const ru: Record<string, string> = {
  'nav.studio': 'Студия',
  'nav.scan': 'Сканер',
  'nav.cards': 'Карточки',
  'nav.history': 'История',
  'nav.backup': 'Резервная копия',
  'nav.studio.hint': 'Создание и экспорт',
  'nav.scan.hint': 'Камера и файлы',
  'nav.cards.hint': 'Цифровая личность',
  'nav.history.hint': 'Недавняя активность',
  'nav.backup.hint': 'Яндекс Диск',
  'brand.studio': 'Студия',
  'brand.autoBackup': 'Автопополнение',
  'sidebar.workspace': 'Рабочее пространство',
  'sidebar.localBody': 'Сканирование, карточки и дизайны остаются в браузере. Ничего не загружается.',
  'sidebar.icBody': 'Сканирование и карточки остаются на устройстве. Резервное копирование фото — только после «Разрешить».',
  'common.back': 'Назад',
  'common.close': 'Закрыть',
  'common.next': 'Далее',
  'common.previous': 'Назад',
  'common.skip': 'Пропустить',
  'common.done': 'Готово',
  'common.preview': 'Прослушать',
  'common.stop': 'Стоп',
  'common.retry': 'Повторить',
  'common.version': 'Версия',
  'footer.rights': '© 2026 QR-JOE. Все права защищены.',
  'footer.agreement':
    'Используя QR-JOE, вы принимаете Политику конфиденциальности и использования.',
  'footer.legal': 'Политика конфиденциальности и использования',
  'footer.version': 'Версия',
  'footer.language': 'Язык',
  'footer.replay': 'Повторить обучение',
  'footer.local': 'Локально',
  'legal.title': 'Политика конфиденциальности и использования',
  'legal.updated': 'Обновлено',
  'legal.acceptance':
    'Используя QR-JOE, вы принимаете настоящую Политику. Если вы не согласны, не используйте продукт.',
  'legal.back': 'Вернуться в приложение',
  'legal.disclaimer':
    'Документ описывает текущие практики обработки данных QR-JOE и предоставлен для прозрачности.',
  'version.title': 'Версия и изменения',
  'version.subtitle': 'Прозрачная история изменений продукта.',
  'version.current': 'Текущая версия',
  'version.history': 'История',
  'version.currentChanges': 'Изменения в этой версии',
  'version.previousChanges': 'Предыдущие версии',
  'version.pdf': 'Полная история в PDF',
  'version.pdfNote': 'Скоро',
  'version.replay': 'Повторить обучение',
  'version.latest': 'Актуальная',
  'version.released': 'Выпущено',
  'version.emptyHistory': 'Предыдущих версий в диапазоне нет.',
  'version.majorLimit': 'Показаны последние 7 мажорных версий.',
  'version.changeCount': 'изм.',
  'scanSound.title': 'Звук сканирования',
  'scanSound.description': 'Проигрывать звук при каждом успешном сканировании QR-кода.',
  'scanSound.enable': 'Проигрывать звук при успешном сканировании',
  'scanSound.preset': 'Звук',
  'scanSound.preview': 'Прослушать',
  'scanSound.stop': 'Стоп',
  'scanSound.note': 'Настройка применяется ко всем QR-кодам, отсканированным в QR-JOE на этом устройстве.',
  'scanSound.enabled': 'Включён',
  'scanSound.disabled': 'Выключен',
  'sound.chime': 'Перезвон',
  'sound.ping': 'Пинг',
  'sound.doorbell': 'Дверной звонок',
  'sound.startup': 'Запуск',
  'sound.alert': 'Сигнал',
  'sound.soft': 'Мягкий',
  'tutorial.step': 'Шаг',
  'tutorial.skip': 'Пропустить обучение',
  'tutorial.next': 'Далее',
  'tutorial.previous': 'Назад',
  'tutorial.done': 'Готово',
  'tutorial.of': 'из',
  'scannedCard.title': 'Отсканированный контакт',
  'scannedCard.save': 'Сохранить в контакты',
  'scannedCard.saving': 'Подготовка…',
  'scannedCard.noTitle': 'Без должности',
  'scannedCard.animated': 'Анимированная карточка',
  'scannedCard.saveNote': 'Откроется меню «Поделиться» — выберите «Контакты» для импорта.',
}

export const ruDictionary: Record<string, string> = { ...ru, ...ruPhrases, ...ruPhrases2 }

const dictionaries: Record<Lang, Record<string, string>> = { en, ru: ruDictionary }

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ru') return stored
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')) return 'ru'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  const setLang = (value: Lang) => setLangState(value)
  const t = (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside LanguageProvider')
  return value
}

export function localized(lang: Lang, value: { en: string; ru: string }): string {
  return value[lang] ?? value.en
}
