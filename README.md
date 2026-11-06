# QR-JOE

A local-first QR studio with deep visual customization, on-device scanning, digital vCard profiles, the QR-JOE Duo offline/online dual-QR system, an optional QR-JOEic camera-photo backup, and a separate QR-JOE Forge NFC developer app.

**Current version: 4.2.0** (see `CHANGELOG.md` and `src/version.ts`)

## Apps

| App | Package | Description |
| --- | --- | --- |
| QR-JOE | `app.qrjoe.studio` | Main web + Android app |
| QR-JOEic | `app.qrjoe.studio.ic` | Android variant with consent-gated camera backup to Yandex Disk |
| QR-JOE Forge | `app.qrjoe.forge` | Standalone Android NFC developer app (write/read URL + vCard tags) |

## Features

- **Studio** — URL, text, email, phone, SMS, Wi-Fi, geo, vCard and music/ringtone payloads.
- **Design** — Classic/Maze/Art rendering, gradients, dot and corner styles, frames, captions, logos, contrast guard, error correction, exports to PNG/SVG/PDF.
- **Animations** — QR reveal/fade/scale/scanline/glow/shine/pulse plus card animations (rise, glow, shine, pulse, flip, bounce) with a cascable layer editor.
- **QR-JOE Duo** — one QR that flips between an offline contact and an online animated card; multi-region double-code scanner; dual PNG and experimental nested QR export.
- **Scanner** — live camera, image upload, Duo scan, animated result cards, scan sounds, full-screen preview, save-to-contacts.
- **Cards** — vCard 3.0 / vCard 4.0 / MECARD formats, avatar, social links, QR + dual QR, `.vcf`/`.txt` export.
- **History** — local log of scans and exports with reuse/copy/delete.
- **Privacy** — full Privacy & Usage Policy (EN/RU) with acceptance by use.
- **Localization** — English and Russian interface switch, dark and light themes.
- **Guided tours** — first-visit tutorial and update tutorials.
- **Self-update** — version feed URL with update banner (Version page → Automatic updates).
- **Encrypted vault** — passphrase-protected `.qrjoe` export/import (AES-256-GCM), no cloud.
- **QR-JOEic backup** — 3:00 AM consent warning, DCIM/Camera only, Yandex Disk `disk:/IT`, encrypted token, no background service.

## Development

```bash
npm install
npm run dev            # web app on http://localhost:5173
npm run dev:ic         # QR-JOEic variant preview on 5174
npm run dev:forge      # QR-JOE Forge (NFC tool) preview
npm run build          # production web build
npm run lint           # oxlint
```

Windows launchers in the project root:

- `Run QR-JOE.bat` — start the web app
- `Preview QR-JOEic.bat` — start the IC preview
- `Build Android APK.bat` — build `release\QR-JOE.apk`
- `Build QR-JOEic APK.bat` — build `release\QR-JOEic.apk`
- `Build QR-JOE Forge APK.bat` — build `release\QR-JOE-Forge.apk`

Android builds use the local toolchain in `.tooling/` (JDK 21 + Android SDK 36). Install the produced APKs from `release/` by sideloading.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Capacitor 8 · QRCodeStyling · ZXing · jsPDF · Web Audio

## Versioning

Every shipped change increments `major.middle.minor` in `package.json` / `src/version.ts` / Android `build.gradle`, and adds an entry to `CHANGELOG.md`.
