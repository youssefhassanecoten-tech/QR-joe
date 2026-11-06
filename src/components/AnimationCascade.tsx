import type { ReactNode } from 'react'
import type { CascadeLayer } from '../scanSound'
import { cn } from '../lib/utils'

export function AnimationCascade({
  layers,
  className,
  children,
}: {
  layers: CascadeLayer[]
  className?: string
  children: ReactNode
}) {
  const shineLayers = layers.filter((layer) => layer.effect === 'shine')
  const wrappers = layers.filter((layer) => layer.effect !== 'shine')

  let content: ReactNode = children
  for (const layer of wrappers) {
    content = (
      <div
        key={layer.id}
        className="relative"
        style={{
          animationName: `cascade-${layer.effect}`,
          animationDuration: `${layer.duration}ms`,
          animationDelay: `${layer.delay}ms`,
          animationIterationCount: layer.repeat ? 'infinite' : 1,
          animationFillMode: 'both',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <div className={cn('relative', shineLayers.length > 0 && 'overflow-hidden rounded-2xl', className)}>
      {content}
      {shineLayers.map((layer) => (
        <span
          key={layer.id}
          className="cascade-shine"
          style={{
            animationDuration: `${layer.duration}ms`,
            animationDelay: `${layer.delay}ms`,
            animationIterationCount: layer.repeat ? 'infinite' : 1,
          }}
        />
      ))}
    </div>
  )
}
