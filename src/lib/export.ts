import { Capacitor } from '@capacitor/core'
import type { CardProfile, QrDesign } from '../types'
import { renderCompositeDataUrl, renderFramedSvg } from './render'
import { downloadBlob, downloadDataUrl, fileSafeName } from './utils'
import { buildCardPayload, buildVCard, fullName, type CardFormat } from './vcard'

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return btoa(binary)
}

function textToBase64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value))
}

function dataUrlToBase64(value: string): string {
  return value.includes(',') ? value.slice(value.indexOf(',') + 1) : value
}

async function blobToBase64(blob: Blob): Promise<string> {
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()))
}

async function shareNativeFile(base64: string, filename: string, mime: string): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')
  const result = await Filesystem.writeFile({
    path: `qr-joe/${filename}`,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  })
  await Share.share({
    title: filename,
    text: mime.startsWith('image/') ? 'QR code made with QR-JOE' : 'Made with QR-JOE',
    url: result.uri,
    dialogTitle: 'Save or share',
  })
}

export async function exportPng(payload: string, design: QrDesign, label: string): Promise<void> {
  const dataUrl = await renderCompositeDataUrl(payload, design, design.size)
  const filename = `${fileSafeName(label)}-${timestamp()}.png`
  if (Capacitor.isNativePlatform()) {
    await shareNativeFile(dataUrlToBase64(dataUrl), filename, 'image/png')
    return
  }
  downloadDataUrl(dataUrl, filename)
}

export async function exportSvg(payload: string, design: QrDesign, label: string): Promise<void> {
  const svg = await renderFramedSvg(payload, design, design.size)
  const filename = `${fileSafeName(label)}-${timestamp()}.svg`
  if (Capacitor.isNativePlatform()) {
    await shareNativeFile(textToBase64(svg), filename, 'image/svg+xml')
    return
  }
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), filename)
}

export async function exportPdf(payload: string, design: QrDesign, label: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const dataUrl = await renderCompositeDataUrl(payload, design, Math.max(1024, design.size))
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageSize = Math.min(160, pageWidth - 40)
  const x = (pageWidth - imageSize) / 2
  const y = (pageHeight - imageSize) / 2 - 12

  pdf.addImage(dataUrl, 'PNG', x, y, imageSize, imageSize, undefined, 'FAST')
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(130, 130, 150)
  pdf.text('Generated with QR-JOE', pageWidth / 2, y + imageSize + 12, { align: 'center' })

  const filename = `${fileSafeName(label)}-${timestamp()}.pdf`
  if (Capacitor.isNativePlatform()) {
    await shareNativeFile(await blobToBase64(pdf.output('blob')), filename, 'application/pdf')
    return
  }
  pdf.save(filename)
}

export async function copyPngToClipboard(payload: string, design: QrDesign): Promise<void> {
  const dataUrl = await renderCompositeDataUrl(payload, design, Math.min(design.size, 1024))
  const blob = await (await fetch(dataUrl)).blob()
  if (!('clipboard' in navigator) || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard is not supported in this browser')
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load QR image'))
    image.src = source
  })
}

export async function exportDualPng(
  offlinePayload: string,
  onlinePayload: string,
  design: QrDesign,
  name: string,
  lang: 'en' | 'ru' = 'en',
): Promise<void> {
  const size = Math.min(design.size, 1200)
  const [offlineUrl, onlineUrl] = await Promise.all([
    renderCompositeDataUrl(offlinePayload, design, size),
    renderCompositeDataUrl(onlinePayload, design, size),
  ])
  const [offlineImage, onlineImage] = await Promise.all([
    loadImage(offlineUrl),
    loadImage(onlineUrl),
  ])
  const gap = 32
  const header = 84
  const canvas = document.createElement('canvas')
  canvas.width = size * 2 + gap
  canvas.height = size + header
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#111827'
  context.font = '700 30px Inter, system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const [offlineLabel, onlineLabel] = lang === 'ru' ? ['ОФЛАЙН', 'ОНЛАЙН'] : ['OFFLINE', 'ONLINE']
  context.fillText(offlineLabel, size / 2, header / 2)
  context.fillText(onlineLabel, size + gap / 2, header / 2)
  context.drawImage(offlineImage, 0, header, size, size)
  context.drawImage(onlineImage, size + gap, header, size, size)
  downloadDataUrl(canvas.toDataURL('image/png'), `${fileSafeName(name)}-dual.png`)
}

export async function exportNestedPng(
  offlinePayload: string,
  onlinePayload: string,
  design: QrDesign,
  name: string,
): Promise<void> {
  const innerDesign: QrDesign = {
    ...design,
    frame: 'none',
    caption: '',
    logo: null,
    margin: 8,
    errorCorrection: 'H',
    size: 420,
  }
  const inner = await renderCompositeDataUrl(offlinePayload, innerDesign, 420)
  const outerDesign: QrDesign = {
    ...design,
    logo: inner,
    logoSize: 0.3,
    hideLogoDots: true,
    errorCorrection: 'H',
  }
  const outer = await renderCompositeDataUrl(onlinePayload, outerDesign, design.size)
  downloadDataUrl(outer, `${fileSafeName(name)}-duo-nested.png`)
}

export async function downloadVCard(
  profile: CardProfile,
  version: '3.0' | '4.0' = '3.0',
): Promise<void> {
  const vcard = buildVCard(profile, true, version)
  const safeName = fileSafeName(fullName(profile), 'contact')
  const filename = `${safeName}.vcf`
  if (Capacitor.isNativePlatform()) {
    await shareNativeFile(textToBase64(vcard), filename, 'text/vcard')
    return
  }
  downloadBlob(new Blob([vcard], { type: 'text/vcard;charset=utf-8' }), filename)
}

export async function downloadCardFile(
  profile: CardProfile,
  format: CardFormat = 'vcard3',
): Promise<void> {
  if (format !== 'mecard') {
    await downloadVCard(profile, format === 'vcard4' ? '4.0' : '3.0')
    return
  }
  const payload = buildCardPayload(profile, 'mecard')
  const safeName = fileSafeName(fullName(profile), 'contact')
  const filename = `${safeName}.txt`
  if (Capacitor.isNativePlatform()) {
    await shareNativeFile(textToBase64(payload), filename, 'text/plain')
    return
  }
  downloadBlob(new Blob([payload], { type: 'text/plain;charset=utf-8' }), filename)
}


