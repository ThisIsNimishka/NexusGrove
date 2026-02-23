import { useState } from 'react'
import { Palette, Sparkles, SlidersHorizontal, Terminal, Network, Unplug, RefreshCw, Settings2, Zap, Scale, Target, CodeXml } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSettingsStore } from '@/stores/settingsStore'
import { useModelStore } from '@/stores/modelStore'
import { useToast } from '@/components/ui/toast'

import { cn } from '@/lib/utils'
import type { Theme, PresetName } from '@/types'

const THEMES: { id: Theme; name: string; colors: string }[] = [
  { id: 'dark', name: 'Dark', colors: 'from-violet-600 to-slate-900' },
  { id: 'midnight', name: 'Midnight', colors: 'from-blue-500 to-slate-900' },
  { id: 'cyberpunk', name: 'Cyber', colors: 'from-pink-500 to-slate-900' },
  { id: 'forest', name: 'Forest', colors: 'from-green-500 to-slate-900' },
]

const PRESETS: { id: PresetName; name: string; icon: React.ElementType; desc: string }[] = [
  { id: 'creative', name: 'Creative', icon: Zap, desc: 'High temperature, diverse outputs' },
  { id: 'balanced', name: 'Balanced', icon: Scale, desc: 'Default settings for general use' },
  { id: 'precise', name: 'Precise', icon: Target, desc: 'Low temperature, focused outputs' },
  { id: 'coding', name: 'Coding', icon: CodeXml, desc: 'Optimized for code generation' },
]

export function SettingsSidebar() {
  const [isRefreshing, setIsRefreshing] = useState(false)


  const {
    theme,
    setTheme,
    parameters,
    setParameter,
    setSystemPrompt,
    applyPreset,
    resetParameters,
  } = useSettingsStore()
  const { isConnected, loadModels } = useModelStore()
  const { addToast } = useToast()



  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadModels()
    setIsRefreshing(false)
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    addToast(`Theme: ${newTheme}`, 'success')
  }

  const handlePresetChange = (preset: PresetName) => {
    applyPreset(preset)
    addToast(`Preset: ${preset}`, 'success')
  }



  return (
    <aside className="w-80 glass border-l border-white/10 flex flex-col z-30">
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Theme Section */}
          <section>
            <SectionHeader icon={Palette} title="Theme" />
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium',
                    'bg-card border-border hover:border-primary',
                    theme === t.id && 'bg-primary/15 border-primary'
                  )}
                >
                  <div className={cn('w-3 h-3 rounded-full bg-gradient-to-br', t.colors)} />
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* Presets Section */}
          <section>
            <SectionHeader icon={Sparkles} title="Presets" />
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl border transition-all',
                    'bg-card border-border hover:border-primary hover:translate-x-1',
                    // Check if current params match preset (simplified check)
                    parameters.temperature ===
                    { creative: 1.2, balanced: 0.7, precise: 0.3, coding: 0.2 }[preset.id] &&
                    'bg-primary/10 border-primary'
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <preset.icon className="w-4 h-4 text-primary" />
                    {preset.name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{preset.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Parameters Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader icon={SlidersHorizontal} title="Parameters" className="mb-0" />
              <Button variant="outline" size="sm" onClick={resetParameters} className="text-xs h-7">
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              <ParameterSlider
                label="Temperature"
                value={parameters.temperature}
                min={0}
                max={2}
                step={0.1}
                onChange={(v) => setParameter('temperature', v)}
              />
              <ParameterSlider
                label="Max Tokens"
                value={parameters.maxTokens}
                min={64}
                max={8192}
                step={64}
                onChange={(v) => setParameter('maxTokens', v)}
              />
              <ParameterSlider
                label="Top P"
                value={parameters.topP}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setParameter('topP', v)}
              />
              <ParameterSlider
                label="Top K"
                value={parameters.topK}
                min={1}
                max={100}
                step={1}
                onChange={(v) => setParameter('topK', v)}
              />
              <ParameterSlider
                label="Repeat Penalty"
                value={parameters.repeatPenalty}
                min={1}
                max={2}
                step={0.05}
                onChange={(v) => setParameter('repeatPenalty', v)}
              />
            </div>
          </section>



          {/* System Prompt */}
          <section>
            <SectionHeader icon={Terminal} title="System Prompt" />
            <Textarea
              placeholder="You are a helpful assistant..."
              value={parameters.systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </section>

          {/* Server Status */}
          <div
            className={cn(
              'px-4 py-3 rounded-2xl border flex items-center gap-3 text-xs transition-all duration-300',
              'bg-secondary/40 backdrop-blur-sm',
              isConnected
                ? 'border-accent-cyan/20 shadow-[0_0_15px_-5px_rgba(34,197,94,0.1)]'
                : 'border-destructive/20'
            )}
          >
            <div className="flex items-center gap-2.5 flex-1">
              {isConnected ? (
                <>
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_10px_hsl(var(--accent-cyan))]" />
                    <div className="absolute inset-x-0 inset-y-0 w-2 h-2 rounded-full bg-accent-cyan animate-ping opacity-50" />
                  </div>
                  <Network className="w-4 h-4 text-accent-cyan/80" />
                  <span className="font-semibold text-foreground/90">Connected to Server</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]" />
                  <Unplug className="w-4 h-4 text-destructive/80" />
                  <span className="font-semibold text-foreground/90">Server Offline</span>
                </>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-all active:scale-90"
              title="Refresh connection"
            >
              <RefreshCw className={cn(
                "w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-all",
                isRefreshing && "animate-spin text-primary"
              )} />
            </button>
          </div>

          {/* API Configuration - Hidden for now
          <section className="pt-4 border-t border-border/50">
            <SectionHeader icon={Globe} title="API Configuration" />
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    LM Studio URL
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      if (isEditingApi) {
                        setApiUrl(tempApiUrl || null)
                        setIsEditingApi(false)
                        addToast('API URL Updated', 'success')
                        loadModels()
                      } else {
                        setIsEditingApi(true)
                      }
                    }}
                  >
                    {isEditingApi ? 'Save' : 'Edit'}
                  </Button>
                </div>

                {isEditingApi ? (
                  <input
                    type="text"
                    value={tempApiUrl}
                    onChange={(e) => setTempApiUrl(e.target.value)}
                    placeholder="http://localhost:1234"
                    className="w-full bg-secondary/50 border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-xs font-mono text-primary truncate">
                    {apiUrl || 'Auto-detecting...'}
                  </p>
                )}

                {!apiUrl && !isEditingApi && (
                  <p className="text-[10px] text-muted-foreground leading-tight italic">
                    Currently utilizing auto-detection based on your connection address.
                  </p>
                )}
              </div>

              {apiUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] h-7"
                  onClick={() => {
                    setApiUrl(null)
                    setTempApiUrl('')
                    addToast('Reset to auto-detect', 'info')
                    loadModels()
                  }}
                >
                  Reset to Auto-detect
                </Button>
              )}
            </div>
          </section>
          */}



          {/* Version Info */}
          <div className="pt-4 flex items-center justify-center gap-2 opacity-30">
            <Settings2 className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-widest uppercase">v2.1.0-updated</span>
          </div>
        </div>
      </ScrollArea>


    </aside>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  className,
}: {
  icon: React.ElementType
  title: string
  className?: string
}) {
  return (
    <h3
      className={cn(
        'flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary/80 mb-3',
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {title}
    </h3>
  )
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => v !== undefined && onChange(v)}
      />
    </div>
  )
}
