export interface VersionChange {
  en: string
  ru: string
}

export interface ReleaseEntry {
  version: string
  major: number
  middle: number
  minor: number
  date: string
  changes: VersionChange[]
}

export const releases: ReleaseEntry[] = [
  {
    version: '4.2.0',
    major: 4,
    middle: 2,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'Rebuilt QR frames: centered code, accent wash, gradient caption bar and hairline border.', ru: 'Переработаны рамки QR: центрированный код, акцентный градиент, градиентная подпись и тонкая рамка.' },
      { en: 'Self-update checker with version feed URL and download prompts.', ru: 'Встроенный проверщик обновлений с лентой версий и кнопкой скачивания.' },
    ],
  },
  {
    version: '4.1.0',
    major: 4,
    middle: 1,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'Duo scanner hardening with 3x3/center crops and online/offline priority labels.', ru: 'Улучшен сканер Duo: области 3x3, центральные фрагменты и приоритет онлайн/офлайн.' },
      { en: 'Encrypted local vault backup and restore (.qrjoe, AES-256-GCM).', ru: 'Зашифрованное локальное хранилище: экспорт и восстановление .qrjoe (AES-256-GCM).' },
      { en: 'No cloud or accounts; backups are passphrase-protected files.', ru: 'Без облака и аккаунтов; резервные копии защищены парольной фразой.' },
    ],
  },
  {
    version: '4.0.0',
    major: 4,
    middle: 0,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'QR-JOE Duo: flip between offline and online QR codes.', ru: 'QR-JOE Duo: переключение между офлайн- и онлайн-QR.' },
      { en: 'Duo double-QR scanner with region detection and camera capture.', ru: 'Двойной сканер Duo с поиском по областям и снимком камеры.' },
      { en: 'Dual and nested QR downloads, online card viewer, embedded offline fallback.', ru: 'Скачивание двойных и вложенных QR, онлайн-просмотр и офлайн-резерв.' },
      { en: 'Separate QR-JOE Forge NFC developer app.', ru: 'Отдельное приложение QR-JOE Forge для NFC.' },
    ],
  },
  {
    version: '3.7.0',
    major: 3,
    middle: 7,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'Dual QR flip between offline contact and online card.', ru: 'Двойной QR с переворотом между офлайн-контактом и онлайн-карточкой.' },
      { en: 'Online card viewer at #card= links, with embedded offline fallback.', ru: 'Онлайн-просмотр карточки по ссылке #card= с офлайн-резервом.' },
      { en: 'Download dual QR PNG or both separate codes.', ru: 'Скачивание двойного QR PNG или двух отдельных кодов.' },
      { en: 'Public card URL setting for hosted animated cards.', ru: 'Настройка публичного URL для онлайн-карточек.' },
    ],
  },
  {
    version: '3.6.0',
    major: 3,
    middle: 6,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'Added glow, shine, pulse, flip and bounce animation options for QR and cards.', ru: 'Добавлены анимации свечения, блика, пульса, переворота и отскока для QR и карточек.' },
      { en: 'Added cascadable animations with multiple layers, order, delay, duration and repeat.', ru: 'Добавлены каскадные анимации со слоями, порядком, задержкой, длительностью и повтором.' },
      { en: 'Cascade editor available in Studio -> Animations.', ru: 'Редактор каскада доступен в Студии -> Анимации.' },
    ],
  },
  {
    version: '3.5.0',
    major: 3,
    middle: 5,
    minor: 0,
    date: '2026-11-03',
    changes: [
      { en: 'QR and card animation style lists are now visible in Studio and Scanner.', ru: 'Списки анимации QR и карточки теперь видны в Студии и Сканере.' },
      { en: 'Card formats: vCard 3.0, vCard 4.0 and MECARD.', ru: 'Форматы карточки: vCard 3.0, vCard 4.0 и MECARD.' },
      { en: 'Click the QR or card to open a full-screen preview.', ru: 'Нажмите на QR или карточку, чтобы открыть полноэкранный предпросмотр.' },
      { en: 'Added a Motion panel and Play animation control.', ru: 'Добавлены панель анимации и кнопка проигрывания.' },
    ],
  },
  {
    version: '3.4.0',
    major: 3,
    middle: 4,
    minor: 0,
    date: '2026-11-03',
    changes: [
      {
        en: 'Scan feedback settings now include result-card animation on/off and animation style.',
        ru: 'Ð’ Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ°Ñ… Ð¾Ð±Ñ€Ð°Ñ‚Ð½Ð¾Ð¹ ÑÐ²ÑÐ·Ð¸ Ð¿Ð¾ÑÐ²Ð¸Ð»Ð¸ÑÑŒ Ð²ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ð°Ð½Ð¸Ð¼Ð°Ñ†Ð¸Ð¸ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ð° Ð¸ Ð²Ñ‹Ð±Ð¾Ñ€ ÑÑ‚Ð¸Ð»Ñ.',
      },
      {
        en: 'Visual result cards now support links, text, Wi-Fi, email, phone, SMS, location, music, audio and vCard.',
        ru: 'Ð’Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ñ‹Ðµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ð° Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÑŽÑ‚ ÑÑÑ‹Ð»ÐºÐ¸, Ñ‚ÐµÐºÑÑ‚, Wi-Fi, Ð¿Ð¾Ñ‡Ñ‚Ñƒ, Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½, SMS, Ð³ÐµÐ¾Ð»Ð¾ÐºÐ°Ñ†Ð¸ÑŽ, Ð¼ÑƒÐ·Ñ‹ÐºÑƒ, Ð°ÑƒÐ´Ð¸Ð¾ Ð¸ vCard.',
      },
      {
        en: 'Full-screen card preview with save/open actions.',
        ru: 'ÐŸÐ¾Ð»Ð½Ð¾ÑÐºÑ€Ð°Ð½Ð½Ñ‹Ð¹ Ð¿Ñ€ÐµÐ´Ð¿Ñ€Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ñ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸ÐµÐ¼ Ð¸ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¸ÐµÐ¼.',
      },
      {
        en: 'The animation option applies to every scanned result card, not only vCards.',
        ru: 'ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ° Ð°Ð½Ð¸Ð¼Ð°Ñ†Ð¸Ð¸ Ð¿Ñ€Ð¸Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ ÐºÐ¾ Ð²ÑÐµÐ¼ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ°Ð¼ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ð°, Ð° Ð½Ðµ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ðº vCard.',
      },
    ],
  },
  {
    version: '3.3.0',
    major: 3,
    middle: 3,
    minor: 0,
    date: '2026-11-03',
    changes: [
      {
        en: 'Complete Russian translation of the interface, including forms, labels, hints, statuses and empty states.',
        ru: 'ÐŸÐ¾Ð»Ð½Ñ‹Ð¹ Ñ€ÑƒÑÑÐºÐ¸Ð¹ Ð¿ÐµÑ€ÐµÐ²Ð¾Ð´ Ð¸Ð½Ñ‚ÐµÑ€Ñ„ÐµÐ¹ÑÐ°: Ñ„Ð¾Ñ€Ð¼Ñ‹, Ð¿Ð¾Ð´Ð¿Ð¸ÑÐ¸, Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸, ÑÑ‚Ð°Ñ‚ÑƒÑÑ‹ Ð¸ Ð¿ÑƒÑÑ‚Ñ‹Ðµ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ñ.',
      },
      {
        en: 'Dynamic strings such as counts, relative times, clock times and content-type names are localized.',
        ru: 'Ð›Ð¾ÐºÐ°Ð»Ð¸Ð·Ð¾Ð²Ð°Ð½Ñ‹ Ð´Ð¸Ð½Ð°Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸: ÑÑ‡Ñ‘Ñ‚Ñ‡Ð¸ÐºÐ¸, Ð¾Ñ‚Ð½Ð¾ÑÐ¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ, Ð²Ñ€ÐµÐ¼Ñ Ð¸ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ñ Ñ‚Ð¸Ð¿Ð¾Ð² ÐºÐ¾Ð½Ñ‚ÐµÐ½Ñ‚Ð°.',
      },
      {
        en: 'Switching back to English restores the original interface instantly.',
        ru: 'ÐŸÐµÑ€ÐµÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ð½Ð° Ð°Ð½Ð³Ð»Ð¸Ð¹ÑÐºÐ¸Ð¹ Ð¼Ð³Ð½Ð¾Ð²ÐµÐ½Ð½Ð¾ Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰Ð°ÐµÑ‚ Ð¸ÑÑ…Ð¾Ð´Ð½Ñ‹Ð¹ Ð¸Ð½Ñ‚ÐµÑ€Ñ„ÐµÐ¹Ñ.',
      },
      {
        en: 'Backup screen and warning dialog fully translated in QR-JOEic.',
        ru: 'Ð­ÐºÑ€Ð°Ð½ Ñ€ÐµÐ·ÐµÑ€Ð²Ð½Ð¾Ð³Ð¾ ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ Ð¸ Ð¿Ñ€ÐµÐ´ÑƒÐ¿Ñ€ÐµÐ¶Ð´ÐµÐ½Ð¸Ðµ Ð¿Ð¾Ð»Ð½Ð¾ÑÑ‚ÑŒÑŽ Ð¿ÐµÑ€ÐµÐ²ÐµÐ´ÐµÐ½Ñ‹ Ð² QR-JOEic.',
      },
    ],
  },
  {
    version: '3.2.1',
    major: 3,
    middle: 2,
    minor: 1,
    date: '2026-11-03',
    changes: [
      {
        en: 'Moved language and theme toggles to the persistent top bar/sidebar.',
        ru: 'ÐŸÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð°Ñ‚ÐµÐ»Ð¸ ÑÐ·Ñ‹ÐºÐ° Ð¸ Ñ‚ÐµÐ¼Ñ‹ Ð¿ÐµÑ€ÐµÐ½ÐµÑÐµÐ½Ñ‹ Ð² Ð²ÐµÑ€Ñ…Ð½ÑŽÑŽ Ð¿Ð°Ð½ÐµÐ»ÑŒ Ð¸ Ð±Ð¾ÐºÐ¾Ð²ÑƒÑŽ Ð¿Ð°Ð½ÐµÐ»ÑŒ.',
      },
    ],
  },
  {
    version: '3.2.0',
    major: 3,
    middle: 2,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'New light theme with a persistent theme toggle.',
        ru: 'ÐÐ¾Ð²Ð°Ñ ÑÐ²ÐµÑ‚Ð»Ð°Ñ Ñ‚ÐµÐ¼Ð° Ñ Ð¿ÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð°Ñ‚ÐµÐ»ÐµÐ¼, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ð·Ð°Ð¿Ð¾Ð¼Ð¸Ð½Ð°ÐµÑ‚ÑÑ.',
      },
      {
        en: 'QR preview now reveals with a smooth animation when it updates.',
        ru: 'ÐŸÑ€ÐµÐ´Ð¿Ñ€Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ QR Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð¿Ð¾ÑÐ²Ð»ÑÐµÑ‚ÑÑ Ñ Ð¿Ð»Ð°Ð²Ð½Ð¾Ð¹ Ð°Ð½Ð¸Ð¼Ð°Ñ†Ð¸ÐµÐ¹ Ð¿Ñ€Ð¸ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ð¸.',
      },
      {
        en: 'Scanned vCards open as an animated visual contact card with a Save to contacts button.',
        ru: 'ÐžÑ‚ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ vCard Ð¾Ñ‚ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‚ÑÑ ÐºÐ°Ðº Ð°Ð½Ð¸Ð¼Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ð° Ñ ÐºÐ½Ð¾Ð¿ÐºÐ¾Ð¹ Â«Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ Ð² ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹Â».',
      },
      {
        en: 'Scan sound can be combined with the animated contact card.',
        ru: 'Ð—Ð²ÑƒÐº ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ Ð¼Ð¾Ð¶Ð½Ð¾ ÑÐ¾Ñ‡ÐµÑ‚Ð°Ñ‚ÑŒ Ñ Ð°Ð½Ð¸Ð¼Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¾Ð¹ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ð°.',
      },
      {
        en: 'Fixed social-link rows so the delete button stays inside the panel border.',
        ru: 'Ð˜ÑÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ñ‹ ÑÑ‚Ñ€Ð¾ÐºÐ¸ ÑÐ¾Ñ†ÑÑÑ‹Ð»Ð¾Ðº: ÐºÐ½Ð¾Ð¿ÐºÐ° ÑƒÐ´Ð°Ð»ÐµÐ½Ð¸Ñ Ð±Ð¾Ð»ÑŒÑˆÐµ Ð½Ðµ Ð²Ñ‹Ñ…Ð¾Ð´Ð¸Ñ‚ Ð·Ð° Ð³Ñ€Ð°Ð½Ð¸Ñ†Ñƒ Ð¿Ð°Ð½ÐµÐ»Ð¸.',
      },
    ],
  },
  {
    version: '3.1.0',
    major: 3,
    middle: 1,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'Global scan sound setting â€” choose a sound and every successful scan plays it.',
        ru: 'Ð“Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð°Ñ Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ° Ð·Ð²ÑƒÐºÐ° ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ â€” Ð²Ñ‹Ð±ÐµÑ€Ð¸Ñ‚Ðµ Ð·Ð²ÑƒÐº, Ð¸ Ð¾Ð½ Ð±ÑƒÐ´ÐµÑ‚ Ð¸Ð³Ñ€Ð°Ñ‚ÑŒ Ð¿Ñ€Ð¸ ÐºÐ°Ð¶Ð´Ð¾Ð¼ ÑƒÑÐ¿ÐµÑˆÐ½Ð¾Ð¼ ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ð¸.',
      },
      {
        en: 'Bilingual Privacy & Usage Policy in English and Russian.',
        ru: 'Ð”Ð²ÑƒÑÐ·Ñ‹Ñ‡Ð½Ð°Ñ ÐŸÐ¾Ð»Ð¸Ñ‚Ð¸ÐºÐ° ÐºÐ¾Ð½Ñ„Ð¸Ð´ÐµÐ½Ñ†Ð¸Ð°Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸ Ð¸ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ñ Ð½Ð° Ð°Ð½Ð³Ð»Ð¸Ð¹ÑÐºÐ¾Ð¼ Ð¸ Ñ€ÑƒÑÑÐºÐ¾Ð¼.',
      },
      {
        en: 'Clickable version badge with current changes and a 7-major-version history.',
        ru: 'ÐšÐ»Ð¸ÐºÐ°Ð±ÐµÐ»ÑŒÐ½Ð°Ñ Ð²ÐµÑ€ÑÐ¸Ñ Ñ Ñ‚ÐµÐºÑƒÑ‰Ð¸Ð¼Ð¸ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸ÑÐ¼Ð¸ Ð¸ Ð¸ÑÑ‚Ð¾Ñ€Ð¸ÐµÐ¹ Ð·Ð° 7 Ð¼Ð°Ð¶Ð¾Ñ€Ð½Ñ‹Ñ… Ð²ÐµÑ€ÑÐ¸Ð¹.',
      },
      {
        en: 'First-visit and post-update guided tours with spotlight arrows.',
        ru: 'ÐžÐ±ÑƒÑ‡Ð°ÑŽÑ‰Ð¸Ðµ Ñ‚ÑƒÑ€Ñ‹ Ð¿Ñ€Ð¸ Ð¿ÐµÑ€Ð²Ð¾Ð¼ Ð²Ð¸Ð·Ð¸Ñ‚Ðµ Ð¸ Ð¿Ð¾ÑÐ»Ðµ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ Ñ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÐ¾Ð¹ Ð¸ ÑÑ‚Ñ€ÐµÐ»ÐºÐ°Ð¼Ð¸.',
      },
      {
        en: 'Lazy-loaded views and smaller initial bundles for faster startup.',
        ru: 'Ð›ÐµÐ½Ð¸Ð²Ð°Ñ Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ° Ñ€Ð°Ð·Ð´ÐµÐ»Ð¾Ð² Ð¸ ÑƒÐ¼ÐµÐ½ÑŒÑˆÐµÐ½Ð½Ñ‹Ð¹ Ð½Ð°Ñ‡Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ð±Ð°Ð½Ð´Ð» Ð´Ð»Ñ Ð±Ñ‹ÑÑ‚Ñ€Ð¾Ð³Ð¾ Ð·Ð°Ð¿ÑƒÑÐºÐ°.',
      },
      {
        en: 'Mobile navigation, footer spacing, and layout refinements.',
        ru: 'Ð˜ÑÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ñ Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ð¾Ð¹ Ð½Ð°Ð²Ð¸Ð³Ð°Ñ†Ð¸Ð¸, Ð¾Ñ‚ÑÑ‚ÑƒÐ¿Ð¾Ð² Ð¿Ð¾Ð´Ð²Ð°Ð»Ð° Ð¸ ÐºÐ¾Ð¼Ð¿Ð¾Ð½Ð¾Ð²ÐºÐ¸.',
      },
    ],
  },
  {
    version: '2.1.0',
    major: 2,
    middle: 1,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'QR-JOEic Android variant with consent-gated camera photo backup.',
        ru: 'Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚ QR-JOEic Ð´Ð»Ñ Android Ñ Ñ€ÐµÐ·ÐµÑ€Ð²Ð½Ñ‹Ð¼ ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸ÐµÐ¼ Ñ„Ð¾Ñ‚Ð¾ ÐºÐ°Ð¼ÐµÑ€Ñ‹ Ð¿Ð¾ ÑÐ¾Ð³Ð»Ð°ÑÐ¸ÑŽ.',
      },
      {
        en: '3:00 AM warning dialog with explicit Allow / Not now controls.',
        ru: 'ÐŸÑ€ÐµÐ´ÑƒÐ¿Ñ€ÐµÐ¶Ð´ÐµÐ½Ð¸Ðµ Ð² 3:00 Ñ ÑÐ²Ð½Ñ‹Ð¼Ð¸ ÐºÐ½Ð¾Ð¿ÐºÐ°Ð¼Ð¸ Â«Ð Ð°Ð·Ñ€ÐµÑˆÐ¸Ñ‚ÑŒÂ» / Â«ÐÐµ ÑÐµÐ¹Ñ‡Ð°ÑÂ».',
      },
      {
        en: 'Camera-only photo selection from DCIM/Camera and Yandex Disk upload.',
        ru: 'Ð’Ñ‹Ð±Ð¾Ñ€ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ñ„Ð¾Ñ‚Ð¾ ÐºÐ°Ð¼ÐµÑ€Ñ‹ Ð¸Ð· DCIM/Camera Ð¸ Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ° Ð² Ð¯Ð½Ð´ÐµÐºÑ Ð”Ð¸ÑÐº.',
      },
      {
        en: 'Encrypted token storage and visible upload progress.',
        ru: 'Ð—Ð°ÑˆÐ¸Ñ„Ñ€Ð¾Ð²Ð°Ð½Ð½Ð¾Ðµ Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ðµ Ñ‚Ð¾ÐºÐµÐ½Ð° Ð¸ Ð²Ð¸Ð´Ð¸Ð¼Ñ‹Ð¹ Ð¿Ñ€Ð¾Ð³Ñ€ÐµÑÑ Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸.',
      },
    ],
  },
  {
    version: '2.0.0',
    major: 2,
    middle: 0,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'Native Android APK builds powered by Capacitor.',
        ru: 'ÐÐ°Ñ‚Ð¸Ð²Ð½Ñ‹Ðµ APK Ð´Ð»Ñ Android Ð½Ð° Ð±Ð°Ð·Ðµ Capacitor.',
      },
      {
        en: 'Camera permission and native share-sheet exports for PNG, SVG, PDF and vCard.',
        ru: 'Ð Ð°Ð·Ñ€ÐµÑˆÐµÐ½Ð¸Ðµ ÐºÐ°Ð¼ÐµÑ€Ñ‹ Ð¸ ÑÐºÑÐ¿Ð¾Ñ€Ñ‚ Ñ‡ÐµÑ€ÐµÐ· ÑÐ¸ÑÑ‚ÐµÐ¼Ð½Ð¾Ðµ Ð¼ÐµÐ½ÑŽ Ð´Ð»Ñ PNG, SVG, PDF Ð¸ vCard.',
      },
      {
        en: 'PWA manifest, branded favicon and mobile layout.',
        ru: 'PWA-Ð¼Ð°Ð½Ð¸Ñ„ÐµÑÑ‚, Ñ„Ð¸Ñ€Ð¼ÐµÐ½Ð½Ð°Ñ Ð¸ÐºÐ¾Ð½ÐºÐ° Ð¸ Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ð°Ñ ÐºÐ¾Ð¼Ð¿Ð¾Ð½Ð¾Ð²ÐºÐ°.',
      },
    ],
  },
  {
    version: '1.2.0',
    major: 1,
    middle: 2,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'Digital vCard profiles with social links and local history.',
        ru: 'Ð¦Ð¸Ñ„Ñ€Ð¾Ð²Ñ‹Ðµ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»Ð¸ vCard Ñ ÑÐ¾Ñ†Ð¸Ð°Ð»ÑŒÐ½Ñ‹Ð¼Ð¸ ÑÑÑ‹Ð»ÐºÐ°Ð¼Ð¸ Ð¸ Ð»Ð¾ÐºÐ°Ð»ÑŒÐ½Ð¾Ð¹ Ð¸ÑÑ‚Ð¾Ñ€Ð¸ÐµÐ¹.',
      },
      {
        en: 'QR frames, captions, logo embedding and PDF export.',
        ru: 'Ð Ð°Ð¼ÐºÐ¸ QR, Ð¿Ð¾Ð´Ð¿Ð¸ÑÐ¸, Ð²ÑÑ‚Ñ€Ð°Ð¸Ð²Ð°Ð½Ð¸Ðµ Ð»Ð¾Ð³Ð¾Ñ‚Ð¸Ð¿Ð° Ð¸ ÑÐºÑÐ¿Ð¾Ñ€Ñ‚ Ð² PDF.',
      },
      {
        en: 'Contrast guard to keep stylized codes scannable.',
        ru: 'ÐšÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÑÑ‚Ð° Ð´Ð»Ñ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ñ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ð¾ÑÑ‚Ð¸ ÑÑ‚Ð¸Ð»Ð¸Ð·Ð¾Ð²Ð°Ð½Ð½Ñ‹Ñ… ÐºÐ¾Ð´Ð¾Ð².',
      },
    ],
  },
  {
    version: '1.1.0',
    major: 1,
    middle: 1,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'Maze and Art QR rendering engines.',
        ru: 'Ð”Ð²Ð¸Ð¶ÐºÐ¸ Ð¾Ñ‚Ñ€Ð¸ÑÐ¾Ð²ÐºÐ¸ QR Â«Ð›Ð°Ð±Ð¸Ñ€Ð¸Ð½Ñ‚Â» Ð¸ Â«ÐÑ€Ñ‚Â».',
      },
      {
        en: 'Music and ringtone content type with in-app tone playback.',
        ru: 'Ð¢Ð¸Ð¿ ÐºÐ¾Ð½Ñ‚ÐµÐ½Ñ‚Ð° Â«ÐœÑƒÐ·Ñ‹ÐºÐ°Â» Ð¸ Ñ€Ð¸Ð½Ð³Ñ‚Ð¾Ð½ Ñ Ð²Ð¾ÑÐ¿Ñ€Ð¾Ð¸Ð·Ð²ÐµÐ´ÐµÐ½Ð¸ÐµÐ¼ Ñ‚Ð¾Ð½Ð° Ð² Ð¿Ñ€Ð¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ð¸.',
      },
      {
        en: 'Preset palettes and randomized styling.',
        ru: 'Ð“Ð¾Ñ‚Ð¾Ð²Ñ‹Ðµ Ð¿Ð°Ð»Ð¸Ñ‚Ñ€Ñ‹ Ð¸ ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ð¾Ðµ Ð¾Ñ„Ð¾Ñ€Ð¼Ð»ÐµÐ½Ð¸Ðµ.',
      },
    ],
  },
  {
    version: '1.0.0',
    major: 1,
    middle: 0,
    minor: 0,
    date: '2026-11-02',
    changes: [
      {
        en: 'Initial QR generation and scanning studio.',
        ru: 'ÐŸÐµÑ€Ð²Ð°Ñ Ð²ÐµÑ€ÑÐ¸Ñ ÑÑ‚ÑƒÐ´Ð¸Ð¸ Ð³ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ð¸ Ð¸ ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ QR.',
      },
      {
        en: 'Links, text, email, phone, SMS, Wi-Fi, location and contact payloads.',
        ru: 'Ð¡ÑÑ‹Ð»ÐºÐ¸, Ñ‚ÐµÐºÑÑ‚, email, Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½, SMS, Wi-Fi, Ð³ÐµÐ¾Ð»Ð¾ÐºÐ°Ñ†Ð¸Ñ Ð¸ ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹.',
      },
      {
        en: 'Local-first storage and scan history.',
        ru: 'Ð›Ð¾ÐºÐ°Ð»ÑŒÐ½Ð¾Ðµ Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ðµ Ð´Ð°Ð½Ð½Ñ‹Ñ… Ð¸ Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ ÑÐºÐ°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ð¹.',
      },
    ],
  },
]

export const currentRelease = releases[0]
export const VERSION = currentRelease.version
export const MAX_MAJOR_HISTORY = 7

export function historyWithinMajorLimit(): ReleaseEntry[] {
  return releases.filter(
    (release) => release.version !== VERSION && currentRelease.major - release.major < MAX_MAJOR_HISTORY,
  )
}







