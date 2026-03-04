import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ArrowRight, Sprout } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'
import { BackgroundBlobs } from './BackgroundBlobs'

interface SplashScreenProps {
  onEnter: () => void
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false)
  const isExitingRef = useRef(false)
  const isConnected = useModelStore((s) => s.isConnected)

  const handleEnter = useCallback(() => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    setIsExiting(true)
    setTimeout(onEnter, 600)
  }, [onEnter])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleEnter()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleEnter])

  // Generate random particles for the "garden" feel
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }))
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-700 ${isExiting ? 'opacity-0 scale-105 blur-lg' : 'opacity-100 scale-100'
        }`}
    >
      <BackgroundBlobs />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary/20 animate-float-particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-3xl bg-card/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 lg:p-16 min-h-[70vh] lg:min-h-[80vh] flex flex-col overflow-hidden group/card shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)]">

          {/* Decorative Corner Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] group-hover/card:bg-primary/20 transition-colors duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 blur-[80px] group-hover/card:bg-accent/20 transition-colors duration-1000" />

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-auto w-full">
            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Made with love for AI @Intel • Nimishka Jain
            </span>
            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="w-8 h-px bg-muted-foreground/30" />
              Intel MMET-Gaming & AI
            </span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center lg:justify-end lg:items-start mt-8 lg:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full gap-8 lg:gap-12">

              {/* Left Column */}
              <div className="flex flex-col items-center lg:items-start max-w-2xl">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center mb-6 sm:mb-8 relative group"
                >
                  <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-3xl -z-10 group-hover:blur-3xl transition-all duration-500 scale-90 opacity-50" />
                  <Sprout className="w-10 h-10 lg:w-14 lg:h-14 text-primary-foreground drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] animate-pulse-glow" />
                </div>

                <div className="text-center lg:text-left space-y-1 mb-6 sm:mb-8">
                  <div className="overflow-hidden">
                    <h1
                      className="font-black tracking-tighter leading-none text-foreground animate-fade-in-up"
                      style={{
                        fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
                        animationDelay: '0.3s',
                        animationFillMode: 'both'
                      }}
                    >
                      Model
                    </h1>
                  </div>
                  <div className="overflow-hidden">
                    <h1
                      className="font-black tracking-tighter leading-none text-gradient animate-fade-in-up inline-block"
                      style={{
                        fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
                        animationDelay: '0.5s',
                        animationFillMode: 'both'
                      }}
                    >
                      Garden.
                    </h1>
                  </div>
                </div>

                <p
                  className="text-muted-foreground font-medium tracking-tight text-center lg:text-left max-w-sm sm:max-w-md animate-fade-in-up leading-relaxed"
                  style={{
                    fontSize: 'clamp(0.95rem, 2vw, 1.25rem)',
                    animationDelay: '0.7s',
                    animationFillMode: 'both'
                  }}
                >
                  Empower your workflow with a curated ecosystem of locally hosted, state-of-the-art AI models.
                </p>

                {isConnected && (
                  <div
                    className="flex items-center gap-3 mt-6 sm:mt-8 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur border border-white/10 animate-fade-in-up shadow-xl"
                    style={{
                      animationDelay: '0.9s',
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
                      <div className="absolute inset-x-0 inset-y-0 w-2 h-2 rounded-full bg-accent-cyan animate-ping opacity-75" />
                    </div>
                    <span className="text-foreground/80 text-[11px] font-bold tracking-tight uppercase">
                      System Ready
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column - CTA */}
              <div
                className="flex justify-center lg:justify-end lg:self-end w-full lg:w-auto animate-fade-in-up"
                style={{
                  animationDelay: '1.2s',
                  animationFillMode: 'both'
                }}
              >
                <div className="relative group/btn">
                  {/* Subtle outer glow that appears on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-0 group-hover/btn:opacity-40 transition-opacity duration-500" />

                  <button
                    onClick={handleEnter}
                    className="group relative inline-flex items-center gap-4 px-10 py-6 rounded-full font-bold text-xl bg-foreground text-background shadow-2xl hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-4 overflow-hidden"
                  >
                    <span className="relative z-10">Start Exploring</span>
                    <span className="relative z-10 w-12 h-12 rounded-full bg-background/10 group-hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>

                    {/* Animated background on hover */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-gradient-flow"
                      style={{ backgroundSize: '200% 100%' }}
                    />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
