import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { CascadeEffect, CascadeLayer } from '../scanSound'
import { uid } from '../lib/utils'
import { Button, IconButton, Select, TextInput } from './ui'

const effects: Array<{ value: CascadeEffect; label: string }> = [
  { value: 'fade', label: 'Fade' },
  { value: 'rise', label: 'Rise' },
  { value: 'scale', label: 'Scale' },
  { value: 'flip', label: 'Flip' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'glow', label: 'Glow' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'shine', label: 'Shine' },
]

export function CascadeEditor({
  title,
  layers,
  onChange,
}: {
  title: string
  layers: CascadeLayer[]
  onChange: (layers: CascadeLayer[]) => void
}) {
  const update = (id: string, patch: Partial<CascadeLayer>) => {
    onChange(layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= layers.length) return
    const next = [...layers]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  const remove = (id: string) => onChange(layers.filter((layer) => layer.id !== id))

  const add = () => {
    onChange([
      ...layers,
      { id: uid(), effect: 'fade', delay: 0, duration: 600, repeat: false },
    ])
  }

  return (
    <div className="rounded-xl border border-white/8 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{title}</p>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
          Add layer
        </Button>
      </div>

      <div className="mt-2 space-y-2">
        {layers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-3 py-3 text-center text-[10px] text-zinc-500">
            No layers yet. Add an animation layer to build the cascade.
          </p>
        ) : (
          layers.map((layer, index) => (
            <div key={layer.id} className="rounded-lg border border-white/8 bg-black/15 p-2">
              <div className="flex items-center gap-1.5">
                <Select
                  value={layer.effect}
                  onChange={(event) => update(layer.id, { effect: event.target.value as CascadeEffect })}
                  className="h-8 px-2 py-1 text-xs"
                >
                  {effects.map((effect) => (
                    <option key={effect.value} value={effect.value}>
                      {effect.label}
                    </option>
                  ))}
                </Select>
                <IconButton
                  size="icon-sm"
                  aria-label="Move layer up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  size="icon-sm"
                  aria-label="Move layer down"
                  disabled={index === layers.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  size="icon-sm"
                  variant="danger"
                  aria-label="Remove layer"
                  onClick={() => remove(layer.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Delay
                  </span>
                  <TextInput
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={layer.delay}
                    onChange={(event) => update(layer.id, { delay: Number(event.target.value) })}
                    className="h-8 px-2 py-1 text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Duration
                  </span>
                  <TextInput
                    type="number"
                    min={200}
                    max={6000}
                    step={50}
                    value={layer.duration}
                    onChange={(event) => update(layer.id, { duration: Number(event.target.value) })}
                    className="h-8 px-2 py-1 text-xs"
                  />
                </label>
                <label className="flex items-end gap-1.5 pb-1 text-[10px] font-medium text-zinc-400">
                  <input
                    type="checkbox"
                    checked={layer.repeat}
                    onChange={(event) => update(layer.id, { repeat: event.target.checked })}
                    className="h-3.5 w-3.5 accent-violet-500"
                  />
                  Repeat
                </label>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
        Layers run in order. Delay and duration are in milliseconds.
      </p>
    </div>
  )
}
