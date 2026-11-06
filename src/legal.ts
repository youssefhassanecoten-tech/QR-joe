export interface LegalText {
  en: string
  ru: string
}

export interface LegalSection {
  heading: LegalText
  paragraphs: LegalText[]
}

export const legalUpdated = '2026-11-02'

export const legalSections: LegalSection[] = [
  {
    heading: { en: '1. Acceptance', ru: '1. Принятие условий' },
    paragraphs: [
      {
        en: 'By downloading, installing, accessing or using QR-JOE or QR-JOEic (the “Service”), you confirm that you have read and agree to this Privacy & Usage Policy. If you do not agree, do not use the Service.',
        ru: 'Загружая, устанавливая, открывая или используя QR-JOE или QR-JOEic (далее — «Сервис»), вы подтверждаете, что ознакомились с настоящей Политикой конфиденциальности и использования и согласны с ней. Если вы не согласны, не используйте Сервис.',
      },
      {
        en: 'Continued use after an update means you accept the updated Policy.',
        ru: 'Продолжение использования после обновления означает принятие обновлённой Политики.',
      },
    ],
  },
  {
    heading: { en: '2. The Service', ru: '2. О Сервисе' },
    paragraphs: [
      {
        en: 'QR-JOE generates, styles and scans QR codes and creates digital vCard profiles. Most processing happens locally on your device.',
        ru: 'QR-JOE создаёт, оформляет и сканирует QR-коды, а также создаёт цифровые профили vCard. Основная обработка выполняется локально на вашем устройстве.',
      },
      {
        en: 'QR-JOEic optionally backs up camera photos to a storage destination that you configure, only after you explicitly tap Allow.',
        ru: 'QR-JOEic по желанию создаёт резервные копии фотографий камеры в выбранное вами хранилище и только после явного нажатия «Разрешить».',
      },
    ],
  },
  {
    heading: { en: '3. Data and privacy', ru: '3. Данные и конфиденциальность' },
    paragraphs: [
      {
        en: 'Content you enter, generated QR codes, card profiles, settings and scan history are stored in your browser or app storage on your device. We do not operate a server that receives this content by default.',
        ru: 'Введённые вами данные, созданные QR-коды, профили карточек, настройки и история сканирований хранятся в браузере или хранилище приложения на вашем устройстве. По умолчанию мы не используем сервер, который получает эти данные.',
      },
      {
        en: 'We do not sell personal data. The current version does not include advertising trackers or third-party analytics.',
        ru: 'Мы не продаём персональные данные. Текущая версия не содержит рекламных трекеров и сторонней аналитики.',
      },
    ],
  },
  {
    heading: { en: '4. Camera, photos and files', ru: '4. Камера, фотографии и файлы' },
    paragraphs: [
      {
        en: 'Camera access is used for QR scanning. Photo access is used only to list camera images (DCIM/Camera) for the optional backup feature. File access uses Android’s system picker.',
        ru: 'Доступ к камере используется для сканирования QR. Доступ к фотографиям используется только для просмотра изображений камеры (DCIM/Camera) в рамках необязательного резервного копирования. Доступ к файлам осуществляется через системный выбор файлов Android.',
      },
      {
        en: 'No photo is uploaded unless you grant permission and tap Allow. The QR-JOEic warning screen shows the destination and the number of photos before every run.',
        ru: 'Ни одна фотография не загружается без вашего разрешения и нажатия «Разрешить». Экран предупреждения QR-JOEic показывает место назначения и количество фотографий перед каждым запуском.',
      },
      {
        en: 'You are responsible for the photos you choose to back up and for ensuring you have the right to store them in the selected destination.',
        ru: 'Вы несёте ответственность за фотографии, которые решили сохранить, и за наличие прав на их размещение в выбранном хранилище.',
      },
    ],
  },
  {
    heading: { en: '5. User content and responsibility', ru: '5. Пользовательский контент и ответственность' },
    paragraphs: [
      {
        en: 'You retain ownership of the content you create. You grant the Service only the local processing needed to perform the requested actions. You must not use the Service for unlawful, infringing, abusive or privacy-violating content.',
        ru: 'Вы сохраняете права на создаваемый контент. Сервису предоставляется только локальная обработка, необходимая для выполнения запрошенных действий. Запрещается использовать Сервис для противоправного, нарушающего права, оскорбительного контента или контента, нарушающего приватность.',
      },
      {
        en: 'You are solely responsible for the QR codes, card data and files you generate, scan, share or upload.',
        ru: 'Вы несёте полную ответственность за QR-коды, данные карточек и файлы, которые вы создаёте, сканируете, передаёте или загружаете.',
      },
    ],
  },
  {
    heading: { en: '6. Acceptable use', ru: '6. Допустимое использование' },
    paragraphs: [
      {
        en: 'You may not use the Service to surveil or track another person without lawful authority, to distribute malware, to bypass access controls, or to infringe intellectual property.',
        ru: 'Запрещается использовать Сервис для скрытого наблюдения или отслеживания другого лица без законных оснований, распространения вредоносного кода, обхода средств защиты доступа или нарушения интеллектуальной собственности.',
      },
      {
        en: 'Reverse engineering, copying or redistributing the Service is prohibited except where applicable law expressly permits it.',
        ru: 'Обратная разработка, копирование или распространение Сервиса запрещены, кроме случаев, прямо разрешённых применимым законодательством.',
      },
    ],
  },
  {
    heading: { en: '7. Intellectual property', ru: '7. Интеллектуальная собственность' },
    paragraphs: [
      {
        en: 'The QR-JOE name, logo, interface, source code and visual design are owned by the operator and protected by applicable intellectual property laws. All rights not expressly granted are reserved.',
        ru: 'Название QR-JOE, логотип, интерфейс, исходный код и визуальный дизайн принадлежат оператору и защищены применимым законодательством об интеллектуальной собственности. Все права, прямо не предоставленные, сохраняются за оператором.',
      },
      {
        en: 'You receive a limited, revocable, non-exclusive license to use the Service for personal or internal business purposes.',
        ru: 'Вам предоставляется ограниченная, отзывная, неисключительная лицензия на использование Сервиса в личных или внутренних деловых целях.',
      },
    ],
  },
  {
    heading: { en: '8. Third-party services and disclaimers', ru: '8. Сторонние сервисы и отказ от гарантий' },
    paragraphs: [
      {
        en: 'Optional backup destinations such as Yandex Disk, WebDAV providers or your own PC are independent third parties. Their terms and privacy policies apply, and we do not control their availability, security or data handling.',
        ru: 'Необязательные места резервного копирования, такие как Яндекс Диск, WebDAV-провайдеры или ваш компьютер, являются независимыми сторонами. К ним применяются их собственные условия и политики конфиденциальности, и мы не контролируем их доступность, безопасность или обработку данных.',
      },
      {
        en: 'The Service is provided “as is” and “as available”, without warranties of any kind, including fitness for a particular purpose, accuracy or uninterrupted operation. QR scanning and backups can fail; verify important data independently.',
        ru: 'Сервис предоставляется «как есть» и «по мере доступности» без каких-либо гарантий, включая пригодность для конкретной цели, точность или бесперебойную работу. Сканирование QR и резервное копирование могут давать сбои; проверяйте важные данные самостоятельно.',
      },
    ],
  },
  {
    heading: { en: '9. Limitation of liability and indemnity', ru: '9. Ограничение ответственности и возмещение' },
    paragraphs: [
      {
        en: 'To the maximum extent permitted by law, the operator is not liable for indirect, incidental, special or consequential damages, loss of data, loss of profit, or actions of third-party services.',
        ru: 'В максимальной степени, разрешённой законом, оператор не несёт ответственности за косвенные, случайные, специальные или последующие убытки, потерю данных, упущенную выгоду или действия сторонних сервисов.',
      },
      {
        en: 'You agree to indemnify and hold the operator harmless from claims arising out of your use or misuse of the Service, your content, or your violation of this Policy or applicable law.',
        ru: 'Вы соглашаетесь возместить оператору убытки и оградить его от претензий, возникших в связи с использованием или неправомерным использованием Сервиса, вашим контентом или нарушением настоящей Политики либо применимого законодательства.',
      },
    ],
  },
  {
    heading: { en: '10. Changes, law and contact', ru: '10. Изменения, право и контакты' },
    paragraphs: [
      {
        en: 'We may update this Policy as the Service evolves. The latest version is always available from the footer. Continued use after publication means acceptance.',
        ru: 'Мы можем обновлять настоящую Политику по мере развития Сервиса. Актуальная версия всегда доступна в подвале сайта. Продолжение использования после публикации означает принятие.',
      },
      {
        en: 'This Policy is governed by the laws applicable at the operator’s principal place of business, without regard to conflict-of-law rules. Contact the operator through the channel where you obtained the app.',
        ru: 'Настоящая Политика регулируется законодательством, применимым по месту основной деятельности оператора, без учёта коллизионных норм. Свяжитесь с оператором через канал, где вы получили приложение.',
      },
    ],
  },
]
