#!/usr/bin/env node
// Publishes the built APK as a GitHub release and refreshes the in-app update feed.
// Usage:
//   GITHUB_TOKEN=... node scripts/publish-release.mjs          # main app (release/QR-JOE.apk)
//   GITHUB_TOKEN=... node scripts/publish-release.mjs --forge  # NFC tool (release/QR-JOE-Forge.apk)
// The token needs Contents: Read and write on this repository and is used in-memory only.

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('GITHUB_TOKEN is not set. Export a fine-grained PAT with Contents: Read and write.')
  process.exit(1)
}

const repoMatch = spawnSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' })
  .stdout?.match(/github\.com[:/](.+?)(?:\.git)?\s*$/)
const repo = repoMatch?.[1]
if (!repo) {
  console.error('Could not read the GitHub repository from the origin remote.')
  process.exit(1)
}

const forge = process.argv.includes('--forge')
const api = (route, init = {}) =>
  fetch(`https://api.github.com${route}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers ?? {}),
    },
  }).then(async (response) => {
    const text = await response.text()
    const body = text ? JSON.parse(text) : null
    if (!response.ok) {
      throw new Error(`${init.method ?? 'GET'} ${route} -> ${response.status} ${body?.message ?? text}`)
    }
    return body
  })

function mainVersion() {
  return JSON.parse(fs.readFileSync('package.json', 'utf8')).version
}

function forgeVersion() {
  const gradle = fs.readFileSync(path.join('android-forge', 'app', 'build.gradle'), 'utf8')
  return gradle.match(/versionName\s+"([^"]+)"/)?.[1]
}

function releaseNotes(version) {
  const source = fs.readFileSync('src/version.ts', 'utf8')
  const start = source.indexOf(`version: '${version}'`)
  if (start === -1) return { en: `QR-JOE ${version}`, ru: `QR-JOE ${version}`, body: `QR-JOE ${version}` }
  const rest = source.slice(start)
  const end = rest.indexOf("version: '", 10)
  const block = end === -1 ? rest : rest.slice(0, end)
  const pairs = [...block.matchAll(/en:\s*'([^']*)',\s*ru:\s*'([^']*)'/g)]
  const en = pairs.map((match) => match[1])
  const ru = pairs.map((match) => match[2])
  const body = ['## What changed', ...en.map((line) => `- ${line}`), '', '## Что изменилось', ...ru.map((line) => `- ${line}`)].join('\n')
  return { en: en.join(' '), ru: ru.join(' '), body }
}

async function publish() {
  const version = forge ? forgeVersion() : mainVersion()
  if (!version) throw new Error('Could not determine the version.')
  const apk = forge ? 'release/QR-JOE-Forge.apk' : 'release/QR-JOE.apk'
  if (!fs.existsSync(apk)) {
    throw new Error(`${apk} is missing. Build the APK first.`)
  }

  const tag = `v${version}`
  const name = forge ? `QR-JOE Forge ${version}` : `QR-JOE ${version}`
  const existing = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (existing.ok) {
    throw new Error(`Release ${tag} already exists. Bump the version before publishing.`)
  }

  const { en, ru, body } = forge ? { en: '', ru: '', body: name } : releaseNotes(version)
  const release = await api(`/repos/${repo}/releases`, {
    method: 'POST',
    body: JSON.stringify({ tag_name: tag, name, body, draft: false, prerelease: false }),
  })

  const buffer = fs.readFileSync(apk)
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: 'application/vnd.android.package-archive' }), path.basename(apk))
  const upload = await fetch(`${release.upload_url.replace('{?name,label}', '')}?name=${encodeURIComponent(path.basename(apk))}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!upload.ok) {
    throw new Error(`Asset upload failed: ${upload.status} ${await upload.text()}`)
  }
  console.log(`Released ${name} -> ${release.html_url}`)

  if (forge) return { changed: false }

  const feedPath = 'qrjoe-update.json'
  const feed = {
    version,
    url: `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(path.basename(apk))}`,
    notes: { en, ru },
  }
  const next = `${JSON.stringify(feed, null, 2)}\n`
  const current = fs.existsSync(feedPath) ? fs.readFileSync(feedPath, 'utf8') : ''
  if (current === next) return { changed: false }
  fs.writeFileSync(feedPath, next, 'utf8')
  console.log(`Update feed -> ${feed.url}`)

  const run = (args) => {
    const result = spawnSync('git', args, { encoding: 'utf8' })
    if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`)
    return result.stdout
  }
  run(['add', feedPath])
  const staged = run(['diff', '--cached', '--name-only'])
  if (!staged.trim()) return { changed: false }
  run(['commit', '-m', `${tag}: publish release and refresh update feed`])
  const auth = Buffer.from(`x-access-token:${token}`).toString('base64')
  const push = spawnSync('git', ['-c', `http.extraHeader=AUTHORIZATION: basic ${auth}`, 'push', 'origin', 'HEAD:main'], {
    encoding: 'utf8',
  })
  if (push.status !== 0) throw new Error(`git push failed:\n${push.stderr}`)
  console.log('Update feed committed and pushed.')
  return { changed: true }
}

publish().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
