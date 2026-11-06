import type { CardAnimationStyle, QrAnimationStyle } from '../scanSound'

export function cardAnimationClass(enabled: boolean, style: CardAnimationStyle): string {
  if (!enabled || style === 'none') return ''
  switch (style) {
    case 'rise':
      return 'animate-card-in animate-card-shimmer'
    case 'fade':
      return 'animate-fade-in'
    case 'glow':
      return 'animate-card-glow'
    case 'shine':
      return 'animate-card-shine'
    case 'pulse':
      return 'animate-card-pulse'
    case 'flip':
      return 'animate-card-flip'
    case 'bounce':
      return 'animate-card-bounce'
    case 'cascade':
      return ''
    default:
      return ''
  }
}

export function qrAnimationClass(style: QrAnimationStyle): string {
  switch (style) {
    case 'reveal':
      return 'animate-qr-reveal'
    case 'fade':
      return 'animate-fade-in'
    case 'scale':
    case 'scanline':
      return 'animate-qr-scale'
    case 'glow':
      return 'animate-qr-glow'
    case 'pulse':
      return 'animate-qr-pulse'
    case 'shine':
      return ''
    case 'cascade':
      return ''
    default:
      return ''
  }
}

