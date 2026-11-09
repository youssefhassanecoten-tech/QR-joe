# QR-JOE

[![CI](https://github.com/youssefhassanecoten-tech/QR-joe/actions/workflows/ci.yml/badge.svg)](https://github.com/youssefhassanecoten-tech/QR-joe/actions/workflows/ci.yml)

A local-first QR studio with deep visual customization, on-device scanning, digital vCard profiles, the QR-JOE Duo offline/online dual-QR system, and a separate QR-JOE Forge NFC developer app.

**Current version: 4.4.0** (see `CHANGELOG.md` and `src/version.ts`)

## Apps

| App | Package | Description |
| --- | --- | --- |
| QR-JOE | `app.qrjoe.studio` | Main web + Android app |
| QR-JOE Forge | `app.qrjoe.forge` | Standalone Android NFC developer app (write/read/wipe/lock tags) |

## Features

- **Studio** — URL, text, email, phone, SMS, Wi-Fi, geo, vCard, music/ringtone and batch payloads.
- **Design** — Classic/Maze/Art rendering, gradients, dot and corner styles, frames, caption fonts, generative art textures, logos, contrast guard, error correction, exports to PNG/SVG/PDF.
- **Animations** — QR reveal/fade/scale/scanline/glow/shine/pulse plus card animations (rise, glow, shine, pulse, flip, bounce) with a cascable layer editor.
- **QR-JOE Duo** — one QR that flips between an offline contact and an online animated card; multi-region double-code scanner; dual PNG and experimental nested QR export.
- **Scanner** — live camera, image upload or paste, barcode decoding, Duo scan, animated result cards, scan sounds, full-screen preview, save-to-contacts.
- **Cards** — vCard 3.0 / vCard 4.0 / MECARD formats, avatar, social links, QR + dual QR, `.vcf`/`.txt` export.
- **History** — local log of scans and exports with search, reuse/copy/delete.
- **Privacy** — full Privacy & Usage Policy (EN/RU) with acceptance by use.
- **Localization** — English and Russian interface switch, dark and light themes.
- **Guided tours** — first-visit tutorial and update tutorials.
- **Self-update** — version feed URL with update banner (Version page → Automatic updates).
- **Encrypted vault** — passphrase-protected `.qrjoe` export/import (AES-256-GCM), no cloud.

## Development

```bash
npm install
npm run dev            # web app on http://localhost:5173
npm run dev:forge      # QR-JOE Forge (NFC tool) preview
npm run build          # production web build
npm run lint           # oxlint
```

Windows launchers in the project root:

- `Run QR-JOE.bat` — start the web app
- `Build Android APK.bat` — build `release\QR-JOE.apk`
- `Build QR-JOE Forge APK.bat` — build `release\QR-JOE-Forge.apk`
- `Publish Release.bat` — tag, create the GitHub release, upload the APK and refresh the in-app update feed

Android builds use the local toolchain in `.tooling/` (JDK 21 + Android SDK 36). Install the produced APKs from `release/` by sideloading.

## Hosted web app

**https://youssefhassanecoten-tech.github.io/QR-joe/** — the same web app deployed by the *Pages*
workflow on every push. Activate it once via **Settings → Pages → Source: GitHub Actions**
(the workflow starts deploying automatically after that). The hosted URL also works as the public
base for QR-JOE Duo online cards (`#card=…`).

## Releases & updates

APKs are published as **GitHub Releases** (never committed to git). Every release refreshes
`qrjoe-update.json`, so installed apps (4.3.0+) show the in-app update banner automatically.

Two equivalent release paths:

1. **Local** — run `Publish Release.bat` with a `Contents: Read and write` token (kept in memory only).
2. **CI** — push a tag `v<version>` (or run the *Publish release* workflow manually); GitHub Actions
   builds the APK, creates the release and pushes the feed update.

CI on every push runs lint, repository guards (encoding, version sync, no private files, no APKs in git),
the web build, and uploads a debug APK artifact.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Capacitor 8 · QRCodeStyling · ZXing · jsPDF · Web Audio

## Versioning

Every shipped change increments `major.middle.minor` in `package.json` / `src/version.ts` / Android `build.gradle`, and adds an entry to `CHANGELOG.md`.
