import { Sparkles } from 'lucide-react'
import { useScanSound, type CardAnimationStyle, type QrAnimationStyle } from '../scanSound'
import { CascadeEditor } from './CascadeEditor'
import { Panel, SectionHeading, Select, Toggle } from './ui'

export function MotionSettingsPanel() {
  const {
    qrAnimationStyle,
    cardAnimation,
    cardAnimationStyle,
    qrCascade,
    cardCascade,
    setQrAnimationStyle,
    setCardAnimation,
    setCardAnimationStyle,
    setQrCascade,
    setCardCascade,
  } = useScanSound()

  return (
    <Panel className="p-4 sm:p-5">
      <SectionHeading
        icon={Sparkles}
        title="Animations"
        description="Control how QR previews and scanned cards appear."
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            QR animation
          </span>
          <Select
            value={qrAnimationStyle}
            onChange={(event) => setQrAnimationStyle(event.target.value as QrAnimationStyle)}
          >
            <option value="reveal">Reveal</option>
            <option value="fade">Fade</option>
            <option value="scale">Scale</option>
            <option value="scanline">Scanline</option>
            <option value="glow">Glow</option>
            <option value="shine">Shine</option>
            <option value="pulse">Pulse</option>
            <option value="cascade">Cascade</option>
            <option value="none">None</option>
          </Select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Card animation style
          </span>
          <Select
            value={cardAnimationStyle}
            onChange={(event) => setCardAnimationStyle(event.target.value as CardAnimationStyle)}
            disabled={!cardAnimation}
          >
            <option value="rise">Rise &amp; shimmer</option>
            <option value="fade">Fade in</option>
            <option value="glow">Glow</option>
            <option value="shine">Shine</option>
            <option value="pulse">Pulse</option>
            <option value="flip">Flip</option>
            <option value="bounce">Bounce</option>
            <option value="cascade">Cascade</option>
            <option value="none">None</option>
          </Select>
        </label>
      </div>
      <div className="mt-3">
        <Toggle
          checked={cardAnimation}
          onChange={setCardAnimation}
          label="Animate scanned result cards"
          description="Applies when a code is scanned, including vCards and other result types."
        />
      </div>

      {qrAnimationStyle === 'cascade' ? (
        <div className="mt-3">
          <CascadeEditor title="QR cascade" layers={qrCascade} onChange={setQrCascade} />
        </div>
      ) : null}

      {cardAnimationStyle === 'cascade' && cardAnimation ? (
        <div className="mt-3">
          <CascadeEditor title="Card cascade" layers={cardCascade} onChange={setCardCascade} />
        </div>
      ) : null}

      <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
        The QR animation replays whenever the preview content or style changes.
      </p>
    </Panel>
  )
}
