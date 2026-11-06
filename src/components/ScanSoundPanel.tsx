import { useState } from 'react'
import { Play, Square, Volume2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { useScanSound, type CardAnimationStyle } from '../scanSound'
import { tonePresets } from '../lib/audio'
import { Badge, Button, Panel, SectionHeading, Select, Toggle } from './ui'

export function ScanSoundPanel() {
  const { t } = useI18n()
  const {
    enabled,
    presetId,
    cardAnimation,
    cardAnimationStyle,
    setEnabled,
    setPresetId,
    setCardAnimation,
    setCardAnimationStyle,
    preview,
    stop,
  } = useScanSound()
  const [playing, setPlaying] = useState(false)

  const togglePreview = async () => {
    if (playing) {
      stop()
      setPlaying(false)
      return
    }
    setPlaying(true)
    try {
      const duration = await preview()
      window.setTimeout(() => setPlaying(false), Math.max(400, duration))
    } catch {
      setPlaying(false)
    }
  }

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <SectionHeading
          icon={Volume2}
          title="Scan feedback"
          description="Sound and card animation after a successful scan."
        />
        <Badge tone={enabled ? 'success' : 'neutral'}>
          {enabled ? t('scanSound.enabled') : t('scanSound.disabled')}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label={t('scanSound.enable')}
          description={t('scanSound.note')}
        />
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              {t('scanSound.preset')}
            </span>
            <Select value={presetId} onChange={(event) => setPresetId(event.target.value)}>
              {tonePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {t(`sound.${preset.id}`)}
                </option>
              ))}
            </Select>
          </label>
          <Button variant="secondary" size="sm" onClick={() => void togglePreview()}>
            {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? t('scanSound.stop') : t('scanSound.preview')}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-white/6 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Card animation</p>
        <Toggle
          checked={cardAnimation}
          onChange={setCardAnimation}
          label="Animate the result card"
          description="Applies to scanned vCards and other result cards."
        />
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Animation
          </span>
          <Select
            value={cardAnimationStyle}
            onChange={(event) =>
              setCardAnimationStyle(event.target.value as CardAnimationStyle)
            }
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
          {cardAnimationStyle === 'cascade' ? (
            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
              Edit cascade layers in Studio → Animations.
            </p>
          ) : null}
        </label>
      </div>
    </Panel>
  )
}
