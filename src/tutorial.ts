import type { View } from './types'

export type TutorialPlacement = 'right' | 'bottom' | 'top' | 'left' | 'center'

export interface TutorialStep {
  id: string
  target?: string
  view?: View
  placement?: TutorialPlacement
  requiresIC?: boolean
  title: { en: string; ru: string }
  body: { en: string; ru: string }
}

export const fullTutorial: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'nav-studio',
    view: 'studio',
    placement: 'right',
    title: { en: 'Welcome to QR-JOE', ru: 'Добро пожаловать в QR-JOE' },
    body: {
      en: 'This is your workspace. Everything runs locally: QR codes, cards and scans stay on this device.',
      ru: 'Это ваше рабочее пространство. Всё работает локально: QR-коды, карточки и сканирования остаются на устройстве.',
    },
  },
  {
    id: 'content',
    target: 'content-types',
    view: 'studio',
    placement: 'bottom',
    title: { en: 'Choose what the QR should do', ru: 'Выберите назначение QR' },
    body: {
      en: 'Links, text, email, Wi-Fi, contacts, music and more. Each type builds a standards-compliant payload.',
      ru: 'Ссылки, текст, email, Wi-Fi, контакты, музыка и другое. Для каждого типа создаётся корректный payload.',
    },
  },
  {
    id: 'design',
    target: 'design-controls',
    view: 'studio',
    placement: 'top',
    title: { en: 'Customize every detail', ru: 'Настройте каждую деталь' },
    body: {
      en: 'Change colors, gradients, dot shapes, frames, logos, contrast and print size.',
      ru: 'Меняйте цвета, градиенты, форму точек, рамки, логотипы, контраст и размер для печати.',
    },
  },
  {
    id: 'export',
    target: 'preview-export',
    view: 'studio',
    placement: 'left',
    title: { en: 'Live preview and export', ru: 'Живой предпросмотр и экспорт' },
    body: {
      en: 'The preview matches the export. Download PNG, SVG or PDF, or copy the QR image.',
      ru: 'Предпросмотр совпадает с экспортом. Скачивайте PNG, SVG или PDF либо копируйте изображение.',
    },
  },
  {
    id: 'scanner',
    target: 'nav-scan',
    view: 'scan',
    placement: 'right',
    title: { en: 'Scan from camera or files', ru: 'Сканируйте камерой или файлами' },
    body: {
      en: 'Point the camera at a code or upload an image. Decoding happens on-device.',
      ru: 'Наведите камеру на код или загрузите изображение. Декодирование происходит на устройстве.',
    },
  },
  {
    id: 'scan-sound',
    target: 'scan-sound',
    view: 'scan',
    placement: 'top',
    title: { en: 'New: scan sound', ru: 'Новое: звук сканирования' },
    body: {
      en: 'Pick a sound and every successful scan will play it. You can switch it off at any time.',
      ru: 'Выберите звук, и он будет играть при каждом успешном сканировании. Его можно отключить в любой момент.',
    },
  },
  {
    id: 'cards',
    target: 'nav-cards',
    view: 'cards',
    placement: 'right',
    title: { en: 'Digital cards', ru: 'Цифровые карточки' },
    body: {
      en: 'Build a vCard profile, share it as a QR code, or download the contact file.',
      ru: 'Создайте профиль vCard, поделитесь им как QR-кодом или скачайте файл контакта.',
    },
  },
  {
    id: 'history',
    target: 'nav-history',
    view: 'history',
    placement: 'right',
    title: { en: 'History', ru: 'История' },
    body: {
      en: 'Every scan and export is logged locally. Reuse a result in the Studio at any time.',
      ru: 'Каждое сканирование и экспорт сохраняются локально. Результат можно снова открыть в Студии.',
    },
  },
  {
    id: 'backup',
    target: 'nav-backup',
    view: 'backup',
    placement: 'right',
    requiresIC: true,
    title: { en: 'Optional auto backup', ru: 'Необязательное автопополнение' },
    body: {
      en: 'QR-JOEic can back up camera photos after a visible 3 AM warning. It never uploads without Allow.',
      ru: 'QR-JOEic может сохранять фото камеры после видимого предупреждения в 3:00. Без «Разрешить» загрузки нет.',
    },
  },
  {
    id: 'version',
    target: 'version-badge',
    view: 'studio',
    placement: 'top',
    title: { en: 'Version and changes', ru: 'Версия и изменения' },
    body: {
      en: 'Tap the version number to see what changed, browse history and replay this tutorial.',
      ru: 'Нажмите на номер версии, чтобы увидеть изменения, историю и повторить обучение.',
    },
  },
  {
    id: 'legal',
    target: 'legal-link',
    view: 'studio',
    placement: 'top',
    title: { en: 'Privacy and usage', ru: 'Конфиденциальность и использование' },
    body: {
      en: 'The footer contains the Privacy & Usage Policy in English and Russian. Using the app means you accept it.',
      ru: 'В подвале доступна Политика конфиденциальности и использования на английском и русском. Использование приложения означает согласие.',
    },
  },
]

export const updateTutorial: TutorialStep[] = [
  {
    id: 'scan-sound-update',
    target: 'scan-sound',
    view: 'scan',
    placement: 'top',
    title: { en: 'New: scan sound', ru: 'Новое: звук сканирования' },
    body: {
      en: 'Any QR code can play a chosen sound when scanned. Enable it and pick a preset below.',
      ru: 'Любой QR-код может проигрывать выбранный звук при сканировании. Включите и выберите звук ниже.',
    },
  },
  {
    id: 'version-update',
    target: 'version-badge',
    view: 'studio',
    placement: 'top',
    title: { en: 'New: version history', ru: 'Новое: история версий' },
    body: {
      en: 'The version badge now opens the current changes and the previous seven major versions.',
      ru: 'Номер версии теперь открывает текущие изменения и предыдущие семь мажорных версий.',
    },
  },
  {
    id: 'legal-update',
    target: 'legal-link',
    view: 'studio',
    placement: 'top',
    title: { en: 'New: legal pages', ru: 'Новое: правовые страницы' },
    body: {
      en: 'Privacy and usage policy are available in English and Russian, and you agree by using the app.',
      ru: 'Политика конфиденциальности и использования доступна на английском и русском; использование приложения означает согласие.',
    },
  },
]
