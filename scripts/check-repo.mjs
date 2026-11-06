#!/usr/bin/env node
// Repository guards run in CI:
//  1. no double-encoded (mojibake) UTF-8 in tracked text files
//  2. version stays in sync: package.json == src/version.ts == android gradle == CHANGELOG
//  3. update feed never advertises a version newer than the app
//  4. no APK binaries tracked in git (APKs live in GitHub Releases)

import fs from 'node:fs'
import { execSync } from 'node:child_process'

const failures = []
const fail = (message) => failures.push(message)

const CP1252_REV = {
  '\u20ac': 0x80, '\u201a': 0x82, '\u0192': 0x83, '\u201e': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02c6': 0x88, '\u2030': 0x89, '\u0160': 0x8a,
  '\u2039': 0x8b, '\u0152': 0x8c, '\u017d': 0x8e, '\u2018': 0x91, '\u2019': 0x92,
  '\u201c': 0x93, '\u201d': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02dc': 0x98, '\u2122': 0x99, '\u0161': 0x9a, '\u203a': 0x9b, '\u0153': 0x9c,
  '\u017e': 0x9e, '\u0178': 0x9f,
}

function charToByte(ch) {
  const cp = ch.codePointAt(0)
  if (cp <= 0xff) return cp
  const mapped = CP1252_REV[ch]
  return mapped === undefined ? null : mapped
}

function decodeRun(chars) {
  const bytes = chars.map((ch) => charToByte(ch))
  let out = ''
  let i = 0
  while (i < bytes.length) {
    const b = bytes[i]
    if (b < 0x80) {
      out += String.fromCharCode(b)
      i += 1
      continue
    }
    let len = 0
    if ((b & 0xe0) === 0xc0) len = 2
    else if ((b & 0xf0) === 0xe0) len = 3
    else if ((b & 0xf8) === 0xf0) len = 4
    if (len === 0 || i + len > bytes.length) {
      out += chars[i]
      i += 1
      continue
    }
    let valid = true
    for (let k = 1; k < len; k += 1) {
      if ((bytes[i + k] & 0xc0) !== 0x80) valid = false
    }
    if (!valid) {
      out += chars[i]
      i += 1
      continue
    }
    const decoded = Buffer.from(bytes.slice(i, i + len)).toString('utf8')
    if (decoded.includes('\ufffd')) {
      out += chars[i]
      i += 1
      continue
    }
    out += decoded
    i += len
  }
  return out
}

function repairText(text) {
  let current = text
  for (let round = 0; round < 3; round += 1) {
    let out = ''
    let run = []
    const flush = () => {
      if (run.length > 0) {
        out += decodeRun(run)
        run = []
      }
    }
    for (const ch of current) {
      if (charToByte(ch) === null) {
        flush()
        out += ch
      } else {
        run.push(ch)
      }
    }
    flush()
    if (out === current) break
    current = out
  }
  return current
}

const tracked = execSync('git ls-files', { maxBuffer: 1 << 26 }).toString().trim().split(/\r?\n/)

for (const file of tracked) {
  if (/^(android-ic|src\/ic)\//.test(file)) {
    fail(`private QR-JOEic file tracked in git: ${file}`)
  }
  if (/\.(apk|aab|jar|png|jpg|jpeg|gif|webp|ico|pdf)$/i.test(file)) {
    if (/\.(apk|aab)$/i.test(file)) fail(`binary tracked in git: ${file} (APKs belong in GitHub Releases)`)
    continue
  }
  if (!/\.(tsx?|json|md|yml|yaml|css|html|xml|java|gradle|mjs|bat)$/i.test(file)) continue
  let text
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (repairText(text) !== text) fail(`double-encoded UTF-8 (mojibake): ${file}`)
}

const pkgVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
const versionSource = fs.readFileSync('src/version.ts', 'utf8')
const tsVersion = versionSource.match(/version:\s*'([^']+)'/)?.[1]
const gradle = fs.readFileSync('android/app/build.gradle', 'utf8')
const gradleVersion = gradle.match(/versionName\s+"([^"]+)"/)?.[1]
const gradleCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1])
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8')

if (tsVersion !== pkgVersion) fail(`src/version.ts (${tsVersion}) != package.json (${pkgVersion})`)
if (gradleVersion !== pkgVersion) fail(`android versionName (${gradleVersion}) != package.json (${pkgVersion})`)
const [major, middle, minor] = pkgVersion.split('.').map(Number)
const expectedCode = major * 100 + middle * 10 + minor
if (gradleCode !== expectedCode) fail(`android versionCode (${gradleCode}) != expected ${expectedCode}`)
if (!changelog.includes(`## ${pkgVersion} `)) fail(`CHANGELOG.md has no entry for ${pkgVersion}`)

const feed = JSON.parse(fs.readFileSync('qrjoe-update.json', 'utf8'))
const feedParts = String(feed.version).split('.').map(Number)
const cmp = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}
if (cmp(feedParts, [major, middle, minor]) > 0) {
  fail(`update feed advertises ${feed.version} but the app is ${pkgVersion}`)
}

if (failures.length > 0) {
  console.error('Repository guard failed:')
  for (const message of failures) console.error(` - ${message}`)
  process.exit(1)
}
console.log(`Repository guards passed for v${pkgVersion}.`)
