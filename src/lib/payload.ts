import type { CardProfile, ContentState, ContentType } from '../types'
import { buildTonePayload } from './audio'
import { truncate } from './utils'
import { buildVCard, fullName } from './vcard'

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function buildPayload(content: ContentState, profiles: CardProfile[]): string {
  switch (content.type) {
    case 'url':
      return normalizeUrl(content.url)
    case 'text':
      return content.text
    case 'email': {
      const to = content.emailTo.trim()
      if (!to) return ''
      const params = new URLSearchParams()
      if (content.emailSubject.trim()) params.set('subject', content.emailSubject.trim())
      if (content.emailBody.trim()) params.set('body', content.emailBody)
      const query = params.toString()
      return `mailto:${to}${query ? `?${query}` : ''}`
    }
    case 'phone': {
      const phone = content.phone.replace(/[^\d+*#]/g, '')
      return phone ? `tel:${phone}` : ''
    }
    case 'sms': {
      const phone = content.smsPhone.replace(/[^\d+*#]/g, '')
      if (!phone) return ''
      return `SMSTO:${phone}:${content.smsMessage}`
    }
    case 'wifi': {
      const ssid = content.wifiSsid.trim()
      if (!ssid) return ''
      const encryption = content.wifiEncryption
      const password = encryption === 'nopass' ? '' : content.wifiPassword
      const hidden = content.wifiHidden ? 'H:true;' : ''
      return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};${hidden};`
    }
    case 'geo': {
      const lat = Number(content.lat)
      const lng = Number(content.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !content.lat.trim() || !content.lng.trim()) {
        return ''
      }
      return `geo:${lat},${lng}`
    }
    case 'vcard': {
      const profile =
        profiles.find((item) => item.id === content.cardId) ?? profiles[0] ?? null
      return profile ? buildVCard(profile, false) : ''
    }
    case 'music':
      return content.musicMode === 'link'
        ? normalizeUrl(content.musicUrl)
        : buildTonePayload(content.musicBpm, content.musicNotes)
    default:
      return ''
  }
}

export function payloadLabel(content: ContentState, profiles: CardProfile[]): string {
  switch (content.type) {
    case 'url':
      return truncate(normalizeUrl(content.url) || 'Empty link', 60)
    case 'text':
      return truncate(content.text || 'Empty text', 60)
    case 'email':
      return content.emailTo ? `Email → ${content.emailTo}` : 'Email'
    case 'phone':
      return content.phone ? `Call → ${content.phone}` : 'Phone'
    case 'sms':
      return content.smsPhone ? `SMS → ${content.smsPhone}` : 'SMS'
    case 'wifi':
      return content.wifiSsid ? `Wi-Fi → ${content.wifiSsid}` : 'Wi-Fi'
    case 'geo':
      return content.lat && content.lng ? `Location → ${content.lat}, ${content.lng}` : 'Location'
    case 'vcard': {
      const profile =
        profiles.find((item) => item.id === content.cardId) ?? profiles[0] ?? null
      return profile ? `Card → ${fullName(profile)}` : 'Digital card'
    }
    case 'music': {
      const title = content.musicTitle.trim() || (content.musicMode === 'link' ? 'Audio link' : 'Ringtone')
      return `Music → ${title}`
    }
    default:
      return 'QR code'
  }
}

export function detectPayloadType(data: string): string {
  const value = data.trim()
  if (/^QRJOE:TONE:1:/i.test(value)) return 'Music'
  if (/^BEGIN:VCARD/i.test(value)) return 'vCard'
  if (/^WIFI:/i.test(value)) return 'Wi-Fi'
  if (/^mailto:/i.test(value)) return 'Email'
  if (/^tel:/i.test(value)) return 'Phone'
  if (/^(SMSTO:|sms:)/i.test(value)) return 'SMS'
  if (/^geo:/i.test(value)) return 'Location'
  if (/^(MECARD:|MATMSG:|BEGIN:VEVENT)/i.test(value)) return 'Contact'
  if (/^https?:\/\/\S+\.(mp3|wav|ogg|m4a|aac|flac|opus)(\?\S*)?$/i.test(value)) return 'Audio'
  if (/^https?:\/\//i.test(value)) return 'Link'
  return 'Text'
}

export function contentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    url: 'Link',
    text: 'Text',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
    wifi: 'Wi-Fi',
    geo: 'Location',
    vcard: 'Card',
    music: 'Music',
  }
  return labels[type]
}
