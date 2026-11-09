# QR-JOE changelog

The visible version is `major.middle.minor`:
- **major** — large product eras or platform changes
- **middle** — substantial feature sets
- **minor** — fixes, refinements and small additions

Any future change must ship with an incremented version, a new entry in `src/version.ts`, and an update to this file.

## 4.4.1 — 2026-11-09
- MIT replaced with a bilingual proprietary license: modification, resale, derivatives and "inspired" works are prohibited.
- In-app Privacy & Usage Policy updated with the same prohibitions.

## 4.4.0 — 2026-11-06
- Batch content type: one payload per line, exported as a labeled PNG print sheet.
- Scanner reads barcodes (EAN/UPC) from uploads and supports paste-image scanning with haptic feedback.
- History search filters entries by label, type and payload.
- Caption font selector: Modern, Classic, Mono, Soft.
- Generative art textures for Art mode (blobs, waves, stars, contours) with seeded remixing.
- Repaired Russian translations that were corrupted by an encoding bug.
- QR-JOE Forge v1.1.0: tag info (UID/tech list), wipe, permanent read-only lock and a session tag log.

## 4.3.0 — 2026-11-06
- Built-in update feed with automatic update prompts.
- Default feed hosted on the GitHub repository.

## 4.2.0 — 2026-11-03
- Rebuilt QR frames: centered code, accent gradient, gradient caption bar.
- Self-update checker with configurable version feed.

## 4.1.0 — 2026-11-03
- Hardened Duo scanner with more crops and online/offline priority.
- Encrypted local vault export/restore (.qrjoe).
- Local-only data backup, no cloud.

## 4.0.0 — 2026-11-03
- QR-JOE Duo dual offline/online QR system.
- Duo double-QR scanner and nested QR export.
- Online card viewer and embedded offline fallback.
- QR-JOE Forge NFC developer app (v1.0.0).

## 3.7.0 — 2026-11-03
- Dual QR flip between offline and online payloads.
- Online card viewer at #card= with offline fallback.
- Download both QR codes / dual PNG.
- Public card URL setting.

## 3.6.0 — 2026-11-03
- Added glow, shine, pulse, flip and bounce options for QR and cards.
- Added cascadable animations with layer order, delay, duration and repeat.
- Cascade editor in Studio -> Animations.

## 3.5.0 — 2026-11-03
- Visible QR and card animation style lists in Studio/Scanner.
- Card formats: vCard 3.0, vCard 4.0, MECARD.
- Click QR/card for full-screen preview.
- Motion panel and Play animation control.

## 3.4.0 — 2026-11-03
- Added result-card animation settings: on/off and style (rise/shimmer, fade, none).
- Extended visual result cards to links, text, Wi-Fi, email, phone, SMS, location, music, audio and vCard.
- Added full-screen card preview with save/open actions.

## 3.3.0 — 2026-11-03
- Full Russian translation layer for the entire interface.
- Localized dynamic counts, relative times, clock times and content-type labels.
- Instant restoration of English when switching back.
- Backup screen and warning dialog fully translated.

## 3.2.1 — 2026-11-03
- Moved language and theme toggles to the persistent sidebar and mobile top bar.

## 3.2.0 — 2026-11-02
- Light theme with persistent theme toggle.
- Animated QR preview reveal.
- Scanned vCards open as an animated contact card with Save to contacts.
- Scan sound works alongside the animated card.
- Fixed social-link delete button overflowing the panel border.

## 3.1.0 — 2026-11-02
- Global scan sound setting with presets and preview.
- Bilingual Privacy & Usage Policy (EN/RU) with acceptance by use.
- Version badge and version page with current changes, 7-major-version history and a disabled full-history PDF placeholder.
- First-visit and post-update guided tours with spotlight arrows.
- Lazy-loaded views, smaller initial bundles and mobile layout refinements.

