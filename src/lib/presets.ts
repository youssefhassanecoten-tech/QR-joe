import type { QrDesign } from '../types'

export interface DesignPreset {
  id: string
  name: string
  swatch: [string, string]
  patch: Partial<QrDesign>
}

export const designPresets: DesignPreset[] = [
  {
    id: 'neon',
    name: 'Neon',
    swatch: ['#8b5cf6', '#22d3ee'],
    patch: {
      fgType: 'gradient',
      fgColor: '#8b5cf6',
      fgColor2: '#22d3ee',
      bgColor: '#f8fafc',
      frame: 'banner',
      frameColor: '#101018',
      accentColor: '#8b5cf6',
      captionColor: '#f8fafc',
      matchCorners: true,
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    swatch: ['#111111', '#555555'],
    patch: {
      fgType: 'solid',
      fgColor: '#111111',
      fgColor2: '#111111',
      bgColor: '#ffffff',
      frame: 'rounded',
      frameColor: '#ffffff',
      accentColor: '#111111',
      captionColor: '#111111',
      cornerColor: '#111111',
      cornerDotColor: '#111111',
      matchCorners: true,
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: ['#fb7185', '#fbbf24'],
    patch: {
      fgType: 'gradient',
      fgColor: '#fb7185',
      fgColor2: '#fbbf24',
      bgColor: '#fff7ed',
      frame: 'ticket',
      frameColor: '#2a1320',
      accentColor: '#fb7185',
      captionColor: '#ffe4e6',
      matchCorners: true,
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    swatch: ['#0ea5e9', '#14b8a6'],
    patch: {
      fgType: 'gradient',
      fgColor: '#0ea5e9',
      fgColor2: '#14b8a6',
      bgColor: '#f0fdfa',
      frame: 'banner',
      frameColor: '#082f49',
      accentColor: '#0ea5e9',
      captionColor: '#e0f2fe',
      matchCorners: true,
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    swatch: ['#22c55e', '#a3e635'],
    patch: {
      fgType: 'gradient',
      fgColor: '#16a34a',
      fgColor2: '#84cc16',
      bgColor: '#f7fee7',
      frame: 'rounded',
      frameColor: '#0f1f15',
      accentColor: '#22c55e',
      captionColor: '#ecfccb',
      matchCorners: true,
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    swatch: ['#ec4899', '#a855f7'],
    patch: {
      fgType: 'gradient',
      fgColor: '#ec4899',
      fgColor2: '#a855f7',
      bgColor: '#fdf2f8',
      frame: 'ticket',
      frameColor: '#241033',
      accentColor: '#ec4899',
      captionColor: '#fce7f3',
      matchCorners: true,
    },
  },
]

const palettes: Array<[string, string]> = [
  ['#8b5cf6', '#22d3ee'],
  ['#f43f5e', '#f97316'],
  ['#22c55e', '#14b8a6'],
  ['#0ea5e9', '#6366f1'],
  ['#eab308', '#f97316'],
  ['#ec4899', '#8b5cf6'],
  ['#14b8a6', '#a3e635'],
  ['#f97316', '#e11d48'],
]

export function randomPatch(): Partial<QrDesign> {
  const [a, b] = palettes[Math.floor(Math.random() * palettes.length)]
  const dotStyles: QrDesign['dotsType'][] = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded']
  const corners: QrDesign['cornerSquareType'][] = ['dot', 'square', 'extra-rounded']
  const frames: QrDesign['frame'][] = ['rounded', 'banner', 'ticket']
  return {
    fgType: Math.random() > 0.25 ? 'gradient' : 'solid',
    fgColor: a,
    fgColor2: b,
    dotsType: dotStyles[Math.floor(Math.random() * dotStyles.length)],
    cornerSquareType: corners[Math.floor(Math.random() * corners.length)],
    matchCorners: true,
    frame: frames[Math.floor(Math.random() * frames.length)],
    frameColor: '#0f0f18',
    accentColor: a,
  }
}
