import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useModelStore, getModelDisplayName, getModelBadge, getModelInfo } from '@/stores/modelStore'
import { useToast } from '@/components/ui/toast'
import { Zap, Gauge, Turtle, Info } from 'lucide-react'

const speedConfig = {
  fast: { label: 'Fast', icon: Zap, color: 'text-accent-cyan' },
  medium: { label: 'Medium', icon: Gauge, color: 'text-amber-400' },
  slow: { label: 'Slow', icon: Turtle, color: 'text-orange-400' },
}

export function ModelCard({ modelId }: { modelId: string }) {
  const { selectedModelId, selectModel } = useModelStore()
  const { addToast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const isActive = selectedModelId === modelId
  const badge = getModelBadge(modelId)
  const displayName = getModelDisplayName(modelId)
  const info = getModelInfo(modelId)
  const SpeedIcon = speedConfig[info.speed].icon

  const handleSelect = () => {
    selectModel(modelId)
    addToast(`Model: ${displayName}`, 'success')
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 transition-butter duration-butter relative overflow-hidden',
        'glass-card hover:border-primary/50',
        'hover:shadow-[0_0_15px_hsl(var(--primary)/0.25)]',
        isActive && [
          'border-primary',
          'bg-gradient-to-br from-primary/20 to-accent/15',
          'shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
        ]
      )}
    >
      {/* Glow overlay */}
      <div
        className={cn(
          'absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-0 transition-opacity duration-400 pointer-events-none',
          'bg-[radial-gradient(ellipse_at_center,hsl(var(--primary))_0%,transparent_70%)]',
          isActive && 'opacity-10 animate-glow-pulse'
        )}
      />

      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent shadow-[0_0_15px_hsl(var(--primary)),0_0_30px_hsl(var(--primary))]" />
      )}

      {/* Main clickable row */}
      <button
        onClick={handleSelect}
        className="w-full text-left p-2.5 relative z-10"
      >
        <div className="relative z-10">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <span className="font-semibold text-xs text-foreground">{displayName}</span>
            <span
              className={cn(
                'text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide',
                badge.type === 'vision' && 'bg-accent-cyan/20 text-accent-cyan',
                badge.type === 'chat' && 'bg-primary/20 text-primary',
                badge.type === 'embed' && 'bg-amber-500/20 text-amber-400'
              )}
            >
              {badge.text}
            </span>
            {/* Speed badge */}
            <span className={cn('flex items-center gap-0.5 text-[9px] font-semibold', speedConfig[info.speed].color)}>
              <SpeedIcon className="w-2.5 h-2.5" />
              {speedConfig[info.speed].label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-mono truncate flex-1">{modelId}</p>
            <div className="flex items-center gap-1 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            </div>
          </div>
        </div>
      </button>

      {/* Info toggle — hidden for now, re-enable by changing false to true */}
      {false && <button
        onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}
        className={cn(
          'absolute top-2 right-2 z-20 p-1 rounded-md transition-all',
          'text-muted-foreground hover:text-primary hover:bg-primary/10',
          expanded && 'text-primary bg-primary/10'
        )}
        title="Model info"
      >
        <Info className="w-3 h-3" />
      </button>}

      {/* Expanded info panel — hidden for now */}
      {false && expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-white/5 pt-2.5 relative z-10">
          {/* Description */}
          <p className="text-[10px] text-muted-foreground leading-relaxed">{info.description}</p>

          {/* Size */}
          <p className="text-[9px] text-primary/70 font-mono">{info.size}</p>

          {/* Capability chips */}
          <div className="flex flex-wrap gap-1">
            {info.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground"
              >
                {cap}
              </span>
            ))}
          </div>

          {/* Best for */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-primary/60 mb-1">Best for</p>
            <div className="flex flex-wrap gap-1">
              {info.bestFor.map((task) => (
                <span
                  key={task}
                  className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium"
                >
                  {task}
                </span>
              ))}
            </div>
          </div>

          {/* Select button */}
          <button
            onClick={handleSelect}
            className={cn(
              'w-full mt-1 py-1 rounded-md text-[10px] font-semibold transition-all',
              isActive
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            )}
          >
            {isActive ? '✓ Selected' : 'Use this model'}
          </button>
        </div>
      )}
    </div>
  )
}

export function ModelCardSkeleton() {
  return (
    <div className="p-3 rounded-xl border border-border bg-card animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-4 rounded-full border-2 border-border border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading models...</span>
      </div>
    </div>
  )
}
