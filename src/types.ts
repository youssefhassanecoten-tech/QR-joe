export type View = 'studio' | 'scan' | 'cards' | 'history' | 'backup' | 'legal' | 'version' | 'data'

export type ContentType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'geo' | 'vcard' | 'music' | 'batch'

export interface ContentState {
  type: ContentType
  url: string
  text: string
  emailTo: string
  emailSubject: string
  emailBody: string
  phone: string
  smsPhone: string
  smsMessage: string
  wifiSsid: string
  wifiPassword: string
  wifiEncryption: 'WPA' | 'WEP' | 'nopass'
  wifiHidden: boolean
  lat: string
  lng: string
  cardId: string | null
  musicMode: 'link' | 'tone'
  musicUrl: string
  musicTitle: string
  musicArtist: string
  musicBpm: number
  musicNotes: string
  batch: string
}

export interface SocialLink {
  id: string
  label: string
  url: string
}

export interface CardProfile {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  note: string
  avatar: string | null
  accent: string
  socials: SocialLink[]
  updatedAt: number
}

export interface HistoryEntry {
  id: string
  kind: 'scanned' | 'generated'
  contentType: string
  label: string
  data: string
  createdAt: number
}

export type DotStyle = 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
export type CornerSquareStyle = 'dot' | 'square' | 'extra-rounded'
export type CornerDotStyle = 'dot' | 'square'
export type GradientKind = 'linear' | 'radial'
export type FrameStyle = 'none' | 'rounded' | 'banner' | 'ticket'
export type QrMode = 'classic' | 'maze' | 'art'
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H'
export type CaptionPosition = 'top' | 'bottom'
export type CaptionFont = 'modern' | 'classic' | 'mono' | 'soft'
export type ArtTexture = 'blobs' | 'waves' | 'stars' | 'contours'

export interface QrDesign {
  mode: QrMode
  mazeThickness: number
  artImage: string | null
  artFade: number
  contrastGuard: boolean
  fgType: 'solid' | 'gradient'
  fgColor: string
  fgColor2: string
  gradientType: GradientKind
  gradientRotation: number
  bgColor: string
  transparentBg: boolean
  dotsType: DotStyle
  cornerSquareType: CornerSquareStyle
  cornerDotType: CornerDotStyle
  matchCorners: boolean
  cornerColor: string
  cornerDotColor: string
  errorCorrection: ErrorCorrection
  margin: number
  logo: string | null
  logoSize: number
  logoMargin: number
  hideLogoDots: boolean
  frame: FrameStyle
  caption: string
  captionPosition: CaptionPosition
  captionFont: CaptionFont
  artTexture: ArtTexture
  artSeed: number
  frameColor: string
  accentColor: string
  captionColor: string
  framePadding: number
  frameRadius: number
  size: number
}

export const defaultContent: ContentState = {
  type: 'url',
  url: 'https://qrjoe.app',
  text: '',
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsPhone: '',
  smsMessage: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',
  wifiHidden: false,
  lat: '',
  lng: '',
  cardId: null,
  musicMode: 'tone',
  musicUrl: '',
  musicTitle: 'QR-JOE Chime',
  musicArtist: '',
  musicBpm: 120,
  musicNotes: 'C5/2;E5/2;G5/2;C6/4',
  batch: 'https://qrjoe.app/1\nhttps://qrjoe.app/2\nhttps://qrjoe.app/3',
}

export const defaultDesign: QrDesign = {
  mode: 'classic',
  mazeThickness: 0.82,
  artImage: null,
  artFade: 55,
  contrastGuard: true,
  fgType: 'gradient',
  fgColor: '#8b5cf6',
  fgColor2: '#22d3ee',
  gradientType: 'linear',
  gradientRotation: 45,
  bgColor: '#f8fafc',
  transparentBg: false,
  dotsType: 'extra-rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  matchCorners: true,
  cornerColor: '#8b5cf6',
  cornerDotColor: '#22d3ee',
  errorCorrection: 'Q',
  margin: 16,
  logo: null,
  logoSize: 0.36,
  logoMargin: 8,
  hideLogoDots: true,
  frame: 'banner',
  caption: 'SCAN ME',
  captionPosition: 'bottom',
  captionFont: 'modern',
  artTexture: 'blobs',
  artSeed: 7,
  frameColor: '#101018',
  accentColor: '#8b5cf6',
  captionColor: '#f8fafc',
  framePadding: 44,
  frameRadius: 36,
  size: 1024,
}

export const starterCard = (): CardProfile => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  note: '',
  avatar: null,
  accent: '#8b5cf6',
  socials: [],
  updatedAt: Date.now(),
})
