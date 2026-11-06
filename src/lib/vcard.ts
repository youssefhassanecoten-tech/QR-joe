import type { CardProfile, SocialLink } from '../types'
import { truncate, uid } from './utils'

export function fullName(profile: CardProfile): string {
  const name = `${profile.firstName} ${profile.lastName}`.trim()
  return name || 'Unnamed profile'
}

export function initials(profile: CardProfile): string {
  const first = profile.firstName.trim().charAt(0)
  const last = profile.lastName.trim().charAt(0)
  const value = `${first}${last}`.trim()
  if (value) return value.toUpperCase()
  return (profile.company.trim().charAt(0) || 'Q').toUpperCase()
}

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function structured(...parts: string[]): string {
  return parts.map(escapeValue).join(';')
}

export type CardFormat = 'vcard3' | 'vcard4' | 'mecard'

export function buildVCard(profile: CardProfile, includePhoto = true, version: '3.0' | '4.0' = '3.0'): string {
  const lines: string[] = ['BEGIN:VCARD', `VERSION:${version}`]
  lines.push(`N:${structured(profile.lastName, profile.firstName, '', '', '')}`)
  lines.push(`FN:${escapeValue(fullName(profile))}`)
  if (profile.company.trim()) lines.push(`ORG:${escapeValue(profile.company.trim())}`)
  if (profile.title.trim()) lines.push(`TITLE:${escapeValue(profile.title.trim())}`)
  if (profile.phone.trim()) lines.push(`TEL;TYPE=CELL:${escapeValue(profile.phone.trim())}`)
  if (profile.email.trim()) lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(profile.email.trim())}`)
  if (profile.website.trim()) lines.push(`URL:${escapeValue(profile.website.trim())}`)
  if (profile.address.trim()) {
    lines.push(`ADR;TYPE=WORK:${structured('', '', profile.address.trim(), '', '', '')}`)
  }
  if (profile.note.trim()) lines.push(`NOTE:${escapeValue(profile.note.trim())}`)
  for (const social of profile.socials) {
    if (social.url.trim()) {
      const label = (social.label.trim() || 'social').toUpperCase()
      lines.push(`X-SOCIALPROFILE;TYPE=${escapeValue(label)}:${escapeValue(social.url.trim())}`)
    }
  }
  if (includePhoto && profile.avatar && profile.avatar.startsWith('data:')) {
    const match = profile.avatar.match(/^data:([^;]+);base64,(.+)$/)
    if (match) {
      const subtype = match[1].split('/')[1]?.toUpperCase() ?? 'JPEG'
      lines.push(`PHOTO;ENCODING=b;TYPE=${subtype}:${match[2]}`)
    }
  }
  lines.push('END:VCARD')
  return `${lines.join('\r\n')}\r\n`
}

export function vcardSummary(profile: CardProfile): string {
  const parts = [fullName(profile)]
  if (profile.title.trim()) parts.push(profile.title.trim())
  if (profile.company.trim()) parts.push(profile.company.trim())
  return truncate(parts.join(' · '), 70)
}

function unescapeValue(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function splitStructured(value: string): string[] {
  return value.split(';').map(unescapeValue)
}

export function parseVCard(data: string): CardProfile | null {
  if (!/^BEGIN:VCARD/im.test(data)) return null
  const lines = data.replace(/\r\n[ \t]/g, '').split(/\r?\n/)
  let formattedName = ''
  let structuredName: string[] = []
  let company = ''
  let title = ''
  let phone = ''
  let email = ''
  let website = ''
  let address = ''
  let note = ''
  const socials: SocialLink[] = []

  for (const line of lines) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const keyPart = line.slice(0, separator)
    const value = line.slice(separator + 1)
    const key = keyPart.split(';')[0].toUpperCase()
    switch (key) {
      case 'FN':
        formattedName = unescapeValue(value)
        break
      case 'N':
        structuredName = splitStructured(value)
        break
      case 'ORG':
        company = unescapeValue(value)
        break
      case 'TITLE':
        title = unescapeValue(value)
        break
      case 'TEL':
        if (!phone) phone = unescapeValue(value)
        break
      case 'EMAIL':
        if (!email) email = unescapeValue(value)
        break
      case 'URL':
        if (!website) website = unescapeValue(value)
        break
      case 'ADR': {
        const parts = splitStructured(value).filter((part) => part.trim().length > 0)
        if (parts.length > 0) address = parts.join(', ')
        break
      }
      case 'NOTE':
        note = unescapeValue(value)
        break
      case 'X-SOCIALPROFILE': {
        const label = keyPart.match(/TYPE=([^;:]+)/i)?.[1] ?? 'Link'
        const url = unescapeValue(value).trim()
        if (url) socials.push({ id: uid(), label, url })
        break
      }
      default:
        break
    }
  }

  const lastName = (structuredName[0] ?? '').trim()
  const firstName = (structuredName[1] ?? '').trim()
  if (!formattedName && !firstName && !lastName) return null
  const nameParts = formattedName.trim().split(/\s+/)
  const fallbackFirst = nameParts[0] ?? ''
  const fallbackLast = nameParts.slice(1).join(' ')

  return {
    id: uid(),
    firstName: firstName || fallbackFirst,
    lastName: lastName || fallbackLast,
    title,
    company,
    phone,
    email,
    website,
    address,
    note,
    avatar: null,
    accent: '#8b5cf6',
    socials,
    updatedAt: Date.now(),
  }
}

export function buildMeCard(profile: CardProfile): string {
  const parts: string[] = ['MECARD']
  const name = `${profile.lastName}${profile.firstName ? `,${profile.firstName}` : ''}`.trim()
  if (name) parts.push(`N:${escapeValue(name)}`)
  if (profile.phone.trim()) parts.push(`TEL:${escapeValue(profile.phone.trim())}`)
  if (profile.email.trim()) parts.push(`EMAIL:${escapeValue(profile.email.trim())}`)
  if (profile.website.trim()) parts.push(`URL:${escapeValue(profile.website.trim())}`)
  if (profile.company.trim()) parts.push(`ORG:${escapeValue(profile.company.trim())}`)
  if (profile.address.trim()) parts.push(`ADR:${escapeValue(profile.address.trim())}`)
  if (profile.note.trim()) parts.push(`NOTE:${escapeValue(profile.note.trim())}`)
  return `${parts.join(';')};;`
}

export function buildCardPayload(
  profile: CardProfile,
  format: CardFormat,
  includePhoto = false,
): string {
  if (format === 'mecard') return buildMeCard(profile)
  return buildVCard(profile, includePhoto, format === 'vcard4' ? '4.0' : '3.0')
}

export function parseMeCard(data: string): CardProfile | null {
  if (!/^MECARD:/i.test(data.trim())) return null
  const body = data.trim().slice(7).replace(/;+$/, '')
  const values = new Map<string, string>()
  for (const part of body.split(';')) {
    const separator = part.indexOf(':')
    if (separator < 0) continue
    const key = part.slice(0, separator).toUpperCase()
    const value = unescapeValue(part.slice(separator + 1))
    if (!values.has(key)) values.set(key, value)
  }
  const rawName = values.get('N') ?? ''
  const [lastName = '', firstName = ''] = rawName.split(',')
  const formatted = `${firstName} ${lastName}`.trim()
  if (!formatted && !values.get('TEL') && !values.get('EMAIL')) return null
  return {
    id: uid(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    title: '',
    company: values.get('ORG') ?? '',
    phone: values.get('TEL') ?? '',
    email: values.get('EMAIL') ?? '',
    website: values.get('URL') ?? '',
    address: values.get('ADR') ?? '',
    note: values.get('NOTE') ?? '',
    avatar: null,
    accent: '#8b5cf6',
    socials: [],
    updatedAt: Date.now(),
  }
}
