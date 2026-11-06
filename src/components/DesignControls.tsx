import { useRef, type ChangeEvent } from 'react'
import {
  Brush,
  Frame,
  Grid3x3,
  ImagePlus,
  Layers,
  Palette,
  RotateCcw,
  Route,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react'
import type { DotStyle, QrDesign } from '../types'
import { designPresets, randomPatch } from '../lib/presets'
import { cn, fileToOptimizedDataUrl } from '../lib/utils'
import {
  Button,
  ColorField,
  Disclosure,
  Field,
  IconButton,
  Segmented,
  Select,
  Slider,
  TextInput,
  Toggle,
} from './ui'

const dotStyles: Array<{ value: DotStyle; label: string }> = [
  { value: 'extra-rounded', label: 'Extra round' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy round' },
  { value: 'square', label: 'Square' },
]

function DotGlyph({ type }: { type: DotStyle }) {
  const radius =
    type === 'dots'
      ? 'rounded-full'
      : type === 'square'
        ? 'rounded-[1px]'
        : type === 'extra-rounded'
          ? 'rounded-[4px]'
          : type === 'rounded'
            ? 'rounded-[3px]'
            : type === 'classy-rounded'
              ? 'rounded-tl-[4px] rounded-br-[4px] rounded-tr-[1px] rounded-bl-[1px]'
              : 'rounded-tl-[3px] rounded-br-[3px]'
  return (
    <span className="grid grid-cols-3 gap-[2px]" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} className={cn('h-1.5 w-1.5 bg-current', radius)} />
      ))}
    </span>
  )
}

function PresetSwatches({
  onApply,
  onRandom,
}: {
  onApply: (patch: Partial<QrDesign>) => void
  onRandom: () => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {designPresets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onApply(preset.patch)}
          className="group flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <span
            className="h-3 w-3 rounded-full ring-1 ring-white/20"
            style={{
              background: `linear-gradient(135deg, ${preset.swatch[0]}, ${preset.swatch[1]})`,
            }}
          />
          {preset.name}
        </button>
      ))}
      <button
        type="button"
        onClick={onRandom}
        className="flex items-center gap-1.5 rounded-lg border border-brand-400/25 bg-brand-500/10 px-2 py-1.5 text-[11px] font-semibold text-brand-200 transition hover:bg-brand-500/20"
      >
        <Wand2 className="h-3 w-3" />
        Surprise me
      </button>
    </div>
  )
}

export function DesignControls({
  design,
  setDesign,
  onReset,
}: {
  design: QrDesign
  setDesign: (patch: Partial<QrDesign>) => void
  onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const artRef = useRef<HTMLInputElement>(null)
  const frameActive = design.frame !== 'none'

  const onLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const dataUrl = await fileToOptimizedDataUrl(file, 384, 'image/png')
    setDesign({ logo: dataUrl })
  }

  const onArtChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const dataUrl = await fileToOptimizedDataUrl(file, 960, 'image/webp')
    setDesign({ artImage: dataUrl })
  }

  const modes = [
    { value: 'classic' as const, label: 'Classic', hint: 'Crisp modules', icon: Grid3x3 },
    { value: 'maze' as const, label: 'Maze', hint: 'Connected lines', icon: Route },
    { value: 'art' as const, label: 'Art', hint: 'Photo mosaic', icon: Brush },
  ]

  return (
    <div className="space-y-2.5" data-tour="design-controls">
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <span className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          QR architecture
          <span className="font-normal normal-case tracking-normal text-zinc-500">rendering engine</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((mode) => {
            const Icon = mode.icon
            const active = design.mode === mode.value
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => setDesign({ mode: mode.value })}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition',
                  active
                    ? 'border-brand-400/50 bg-gradient-to-br from-brand-500/20 to-aqua-500/10 text-brand-100'
                    : 'border-white/8 bg-black/15 text-zinc-500 hover:border-white/15 hover:text-zinc-200',
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold">{mode.label}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-70">{mode.hint}</span>
              </button>
            )
          })}
        </div>

        {design.mode === 'maze' ? (
          <div className="mt-3">
            <Slider
              label="Maze thickness"
              value={Math.round(design.mazeThickness * 100)}
              min={45}
              max={100}
              unit="%"
              onChange={(value) => setDesign({ mazeThickness: value / 100 })}
            />
            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
              Data modules connect into flowing corridors while the three finder eyes keep the code readable.
              {design.contrastGuard ? ' Contrast guard auto-darkens bright palettes for reliable scans.' : ''}
            </p>
          </div>
        ) : null}

        {design.mode === 'art' ? (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              {design.artImage ? (
                <img
                  src={design.artImage}
                  alt="Artwork"
                  className="h-11 w-11 rounded-lg object-cover ring-1 ring-white/15"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-brand-500/40 to-aqua-500/40 text-white ring-1 ring-white/10">
                  <Brush className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-zinc-200">
                  {design.artImage ? 'Custom artwork' : 'Generated artwork'}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {design.artImage ? 'Modules sample colors from your image.' : 'Uses your palette — upload to personalize.'}
                </p>
              </div>
              <input ref={artRef} type="file" accept="image/*" onChange={onArtChange} className="hidden" />
              <Button size="sm" variant="secondary" onClick={() => artRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                {design.artImage ? 'Replace' : 'Upload'}
              </Button>
              {design.artImage ? (
                <IconButton
                  size="icon-sm"
                  variant="danger"
                  aria-label="Remove artwork"
                  onClick={() => setDesign({ artImage: null })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              ) : null}
            </div>
            <Slider
              label="Art fade"
              value={design.artFade}
              min={0}
              max={90}
              unit="%"
              onChange={(value) => setDesign({ artFade: value })}
            />
            <p className="text-[10px] leading-relaxed text-amber-300/80">
              Art codes trade contrast for style. Always test-scan before printing or sharing.
            </p>
          </div>
        ) : null}
      </div>

      <Disclosure title="Style & color" icon={Palette} defaultOpen>
        <PresetSwatches onApply={setDesign} onRandom={() => setDesign(randomPatch())} />

        <Field label="Fill">
          <Segmented
            value={design.fgType}
            onChange={(value) => setDesign({ fgType: value })}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
            ]}
          />
        </Field>

        {design.fgType === 'gradient' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Start" value={design.fgColor} onChange={(value) => setDesign({ fgColor: value })} />
              <ColorField label="End" value={design.fgColor2} onChange={(value) => setDesign({ fgColor2: value })} />
            </div>
            <Field label="Gradient type">
              <Segmented
                value={design.gradientType}
                onChange={(value) => setDesign({ gradientType: value })}
                options={[
                  { value: 'linear', label: 'Linear' },
                  { value: 'radial', label: 'Radial' },
                ]}
              />
            </Field>
            {design.gradientType === 'linear' ? (
              <Slider
                label="Angle"
                value={design.gradientRotation}
                min={0}
                max={360}
                step={5}
                unit="°"
                onChange={(value) => setDesign({ gradientRotation: value })}
              />
            ) : null}
          </>
        ) : (
          <ColorField label="Foreground" value={design.fgColor} onChange={(value) => setDesign({ fgColor: value })} />
        )}

        <ColorField label="Background" value={design.bgColor} onChange={(value) => setDesign({ bgColor: value })} />

        <Field label="Dot shape">
          <div className="grid grid-cols-3 gap-1.5">
            {dotStyles.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDesign({ dotsType: option.value })}
                aria-pressed={design.dotsType === option.value}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-1.5 py-2 text-[10px] font-medium transition',
                  design.dotsType === option.value
                    ? 'border-brand-400/50 bg-brand-500/15 text-brand-100'
                    : 'border-white/8 bg-black/15 text-zinc-500 hover:border-white/15 hover:text-zinc-200',
                )}
              >
                <DotGlyph type={option.value} />
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Corner frame">
          <Segmented
            value={design.cornerSquareType}
            onChange={(value) => setDesign({ cornerSquareType: value })}
            options={[
              { value: 'extra-rounded', label: 'Round' },
              { value: 'square', label: 'Square' },
              { value: 'dot', label: 'Dot' },
            ]}
            columns={3}
          />
        </Field>

        <Field label="Corner center">
          <Segmented
            value={design.cornerDotType}
            onChange={(value) => setDesign({ cornerDotType: value })}
            options={[
              { value: 'dot', label: 'Dot' },
              { value: 'square', label: 'Square' },
            ]}
          />
        </Field>

        <Toggle
          checked={design.matchCorners}
          onChange={(checked) => setDesign({ matchCorners: checked })}
          label="Match corners to fill"
          description="Corners inherit your gradient or foreground color."
        />

        {!design.matchCorners ? (
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Corner frame"
              value={design.cornerColor}
              onChange={(value) => setDesign({ cornerColor: value })}
            />
            <ColorField
              label="Corner center"
              value={design.cornerDotColor}
              onChange={(value) => setDesign({ cornerDotColor: value })}
            />
          </div>
        ) : null}
      </Disclosure>

      <Disclosure title="Frame & caption" icon={Frame} defaultOpen>
        <Field label="Frame">
          <Segmented
            value={design.frame}
            onChange={(value) => setDesign({ frame: value })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'banner', label: 'Banner' },
              { value: 'ticket', label: 'Ticket' },
            ]}
            columns={4}
          />
        </Field>

        {frameActive ? (
          <>
            <Field label="Caption" hint={`${design.caption.length}/24`}>
              <TextInput
                value={design.caption}
                maxLength={24}
                onChange={(event) => setDesign({ caption: event.target.value })}
                placeholder="SCAN ME"
              />
            </Field>

            {design.frame !== 'banner' ? (
              <Field label="Caption position">
                <Segmented
                  value={design.captionPosition}
                  onChange={(value) => setDesign({ captionPosition: value })}
                  options={[
                    { value: 'top', label: 'Top' },
                    { value: 'bottom', label: 'Bottom' },
                  ]}
                />
              </Field>
            ) : null}

            <div className="grid grid-cols-3 gap-2.5">
              <ColorField
                label="Frame"
                value={design.frameColor}
                onChange={(value) => setDesign({ frameColor: value })}
              />
              <ColorField
                label="Accent"
                value={design.accentColor}
                onChange={(value) => setDesign({ accentColor: value })}
              />
              <ColorField
                label="Caption"
                value={design.captionColor}
                onChange={(value) => setDesign({ captionColor: value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Slider
                label="Padding"
                value={design.framePadding}
                min={16}
                max={88}
                unit="px"
                onChange={(value) => setDesign({ framePadding: value })}
              />
              <Slider
                label="Corner radius"
                value={design.frameRadius}
                min={0}
                max={88}
                unit="px"
                onChange={(value) => setDesign({ frameRadius: value })}
              />
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
            Frames add a padded card and caption around the code. Pick one to unlock caption and spacing controls.
          </p>
        )}
      </Disclosure>

      <Disclosure title="Center logo" icon={ImagePlus} badge={design.logo ? 'On' : undefined}>
        {design.logo ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3">
            <img
              src={design.logo}
              alt="Logo preview"
              className="h-12 w-12 rounded-lg bg-white/90 object-contain p-1 ring-1 ring-white/15"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold text-zinc-200">Logo embedded</p>
              <p className="text-[11px] text-zinc-500">Keep it simple and high-contrast.</p>
            </div>
            <IconButton variant="danger" aria-label="Remove logo" onClick={() => setDesign({ logo: null })}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/12 bg-black/15 px-4 py-6 text-center transition hover:border-brand-400/40 hover:bg-brand-500/5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-zinc-400 ring-1 ring-white/10">
              <ImagePlus className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-semibold text-zinc-200">Upload a logo</span>
            <span className="text-[11px] text-zinc-500">PNG, SVG, JPG or WebP · transparent PNG works best</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onLogoChange} className="hidden" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Slider
            label="Logo size"
            value={Math.round(design.logoSize * 100)}
            min={15}
            max={50}
            step={1}
            unit="%"
            onChange={(value) => setDesign({ logoSize: value / 100 })}
          />
          <Slider
            label="Logo margin"
            value={design.logoMargin}
            min={0}
            max={24}
            unit="px"
            onChange={(value) => setDesign({ logoMargin: value })}
          />
        </div>
        <Toggle
          checked={design.hideLogoDots}
          onChange={(checked) => setDesign({ hideLogoDots: checked })}
          label="Clear dots behind logo"
          description="Removes modules under the image for a cleaner look."
        />
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Tip: logos reduce scannable data, so use error correction Q or H when embedding one.
        </p>
      </Disclosure>

      <Disclosure title="Advanced" icon={Settings2}>
        <Field label="Error correction">
          <Segmented
            value={design.errorCorrection}
            onChange={(value) => setDesign({ errorCorrection: value })}
            options={[
              { value: 'L', label: 'L · 7%' },
              { value: 'M', label: 'M · 15%' },
              { value: 'Q', label: 'Q · 25%' },
              { value: 'H', label: 'H · 30%' },
            ]}
            columns={4}
          />
        </Field>
        <p className="-mt-1 text-[11px] leading-relaxed text-zinc-500">
          Higher levels survive more damage or logo coverage but hold less data.
        </p>

        <Slider
          label="Quiet zone"
          value={design.margin}
          min={0}
          max={80}
          unit="px"
          onChange={(value) => setDesign({ margin: value })}
        />

        <Field label="Export size">
          <Select
            value={String(design.size)}
            onChange={(event) => setDesign({ size: Number(event.target.value) })}
          >
            <option value="512">512 × 512 px · web</option>
            <option value="1024">1024 × 1024 px · standard</option>
            <option value="2048">2048 × 2048 px · print</option>
            <option value="3000">3000 × 3000 px · large format</option>
          </Select>
        </Field>

        <Toggle
          checked={design.transparentBg}
          onChange={(checked) => setDesign({ transparentBg: checked })}
          label="Transparent background"
          description="Only applies when no frame is used. Make sure the placement surface is light."
        />

        <Toggle
          checked={design.contrastGuard}
          onChange={(checked) => setDesign({ contrastGuard: checked })}
          label="Contrast guard"
          description="Auto-darkens bright palettes just enough to keep codes scannable. Turn off for pure aesthetics."
        />

        <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Layers className="h-3.5 w-3.5" />
            WYSIWYG preview matches export.
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </Disclosure>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        <Sparkles className="h-3 w-3" />
        Every pixel is yours
      </div>
    </div>
  )
}
