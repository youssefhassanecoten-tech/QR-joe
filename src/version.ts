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
    version: '4.4.0',
    major: 4,
    middle: 4,
    minor: 0,
    date: '2026-11-06',
    changes: [
      { en: 'Batch content type: one payload per line, exported as a labeled PNG print sheet.', ru: 'Тип контента «Пакет»: по одной нагрузке в строке и экспорт всех кодов на один PNG-лист с подписями.' },
      { en: 'Scanner reads barcodes from uploads and supports paste-image scanning with vibration.', ru: 'Сканер распознаёт штрихкоды на изображениях, вставляет картинку из буфера и вибрирует при сканировании.' },
      { en: 'History search filters entries by label, type and payload.', ru: 'Поиск в истории фильтрует записи по подписи, типу и данным.' },
      { en: 'Caption font selector: Modern, Classic, Mono and Soft.', ru: 'Выбор шрифта подписи: современный, классический, моно и мягкий.' },
      { en: 'Generative art textures with seeded remixing: blobs, waves, stars and contours.', ru: 'Генеративные текстуры для режима «Арт» с зерном: кляксы, волны, звёзды и контуры.' },
      { en: 'Repaired Russian translation strings corrupted by an encoding bug.', ru: 'Восстановлены русские строки перевода, повреждённые ошибкой кодировки.' },
    ],
  },
  {
    version: '4.3.0',
    major: 4,
    middle: 3,
    minor: 0,
    date: '2026-11-06',
    changes: [
      { en: 'Built-in update feed with automatic update prompts.', ru: 'Встроенная лента обновлений с автоматическими уведомлениями.' },
      { en: 'Default feed hosted on the QR-JOE GitHub repository.', ru: 'Лента обновлений размещена в репозитории QR-JOE на GitHub.' },
    ],
  },
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
        ru: 'В настройках обратной связи появились включение анимации карточки результата и выбор стиля.',
      },
      {
        en: 'Visual result cards now support links, text, Wi-Fi, email, phone, SMS, location, music, audio and vCard.',
        ru: 'Визуальные карточки результата теперь поддерживают ссылки, текст, Wi-Fi, почту, телефон, SMS, геолокацию, музыку, аудио и vCard.',
      },
      {
        en: 'Full-screen card preview with save/open actions.',
        ru: 'Полноэкранный предпросмотр карточки с сохранением и открытием.',
      },
      {
        en: 'The animation option applies to every scanned result card, not only vCards.',
        ru: 'Настройка анимации применяется ко всем карточкам результата, а не только к vCard.',
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
        ru: 'Полный русский перевод интерфейса: формы, подписи, подсказки, статусы и пустые состояния.',
      },
      {
        en: 'Dynamic strings such as counts, relative times, clock times and content-type names are localized.',
        ru: 'Локализованы динамические строки: счётчики, относительное время, время и названия типов контента.',
      },
      {
        en: 'Switching back to English restores the original interface instantly.',
        ru: 'Переключение на английский мгновенно возвращает исходный интерфейс.',
      },
      {
        en: 'Backup screen and warning dialog fully translated.',
        ru: 'Экран резервного копирования и предупреждение полностью переведены.',
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
        ru: 'Переключатели языка и темы перенесены в верхнюю панель и боковую панель.',
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
        ru: 'Новая светлая тема с переключателем, который запоминается.',
      },
      {
        en: 'QR preview now reveals with a smooth animation when it updates.',
        ru: 'Предпросмотр QR теперь появляется с плавной анимацией при обновлении.',
      },
      {
        en: 'Scanned vCards open as an animated visual contact card with a Save to contacts button.',
        ru: 'Отсканированные vCard открываются как анимированная карточка контакта с кнопкой «Сохранить в контакты».',
      },
      {
        en: 'Scan sound can be combined with the animated contact card.',
        ru: 'Звук сканирования можно сочетать с анимированной карточкой контакта.',
      },
      {
        en: 'Fixed social-link rows so the delete button stays inside the panel border.',
        ru: 'Исправлены строки соцссылок: кнопка удаления больше не выходит за границу панели.',
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
        en: 'Global scan sound setting — choose a sound and every successful scan plays it.',
        ru: 'Глобальная настройка звука сканирования — выберите звук, и он будет играть при каждом успешном сканировании.',
      },
      {
        en: 'Bilingual Privacy & Usage Policy in English and Russian.',
        ru: 'Двуязычная Политика конфиденциальности и использования на английском и русском.',
      },
      {
        en: 'Clickable version badge with current changes and a 7-major-version history.',
        ru: 'Кликабельная версия с текущими изменениями и историей за 7 мажорных версий.',
      },
      {
        en: 'First-visit and post-update guided tours with spotlight arrows.',
        ru: 'Обучающие туры при первом визите и после обновления с подсветкой и стрелками.',
      },
      {
        en: 'Lazy-loaded views and smaller initial bundles for faster startup.',
        ru: 'Ленивая загрузка разделов и уменьшенный начальный бандл для быстрого запуска.',
      },
      {
        en: 'Mobile navigation, footer spacing, and layout refinements.',
        ru: 'Исправления мобильной навигации, отступов подвала и компоновки.',
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
        en: 'Android variant with consent-gated camera photo backup.',
        ru: 'Вариант для Android с резервным копированием фото камеры по согласию.',
      },
      {
        en: '3:00 AM warning dialog with explicit Allow / Not now controls.',
        ru: 'Предупреждение в 3:00 с явными кнопками «Разрешить» / «Не сейчас».',
      },
      {
        en: 'Camera-only photo selection from DCIM/Camera and Yandex Disk upload.',
        ru: 'Выбор только фото камеры из DCIM/Camera и загрузка в Яндекс Диск.',
      },
      {
        en: 'Encrypted token storage and visible upload progress.',
        ru: 'Зашифрованное хранение токена и видимый прогресс загрузки.',
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
        ru: 'Нативные APK для Android на базе Capacitor.',
      },
      {
        en: 'Camera permission and native share-sheet exports for PNG, SVG, PDF and vCard.',
        ru: 'Разрешение камеры и экспорт через системное меню для PNG, SVG, PDF и vCard.',
      },
      {
        en: 'PWA manifest, branded favicon and mobile layout.',
        ru: 'PWA-манифест, фирменная иконка и мобильная компоновка.',
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
        ru: 'Цифровые профили vCard с социальными ссылками и локальной историей.',
      },
      {
        en: 'QR frames, captions, logo embedding and PDF export.',
        ru: 'Рамки QR, подписи, встраивание логотипа и экспорт в PDF.',
      },
      {
        en: 'Contrast guard to keep stylized codes scannable.',
        ru: 'Контроль контраста для сохранения читаемости стилизованных кодов.',
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
        ru: 'Движки отрисовки QR «Лабиринт» и «Арт».',
      },
      {
        en: 'Music and ringtone content type with in-app tone playback.',
        ru: 'Тип контента «Музыка» и рингтон с воспроизведением тона в приложении.',
      },
      {
        en: 'Preset palettes and randomized styling.',
        ru: 'Готовые палитры и случайное оформление.',
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
        ru: 'Первая версия студии генерации и сканирования QR.',
      },
      {
        en: 'Links, text, email, phone, SMS, Wi-Fi, location and contact payloads.',
        ru: 'Ссылки, текст, email, телефон, SMS, Wi-Fi, геолокация и контакты.',
      },
      {
        en: 'Local-first storage and scan history.',
        ru: 'Локальное хранение данных и история сканирований.',
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
