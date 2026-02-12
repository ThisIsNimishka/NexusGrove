import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowRight, Sprout } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'

interface SplashScreenProps {
  onEnter: () => void
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false)
  const isExitingRef = useRef(false)
  const isConnected = useModelStore((s) => s.isConnected)

  const handleEnter = useCallback(() => {
    // Guard against multiple triggers (double-click, key hold, space+click)
    if (isExitingRef.current) return
    isExitingRef.current = true
    setIsExiting(true)
    setTimeout(onEnter, 600)
  }, [onEnter])

  // Keyboard accessibility — only Enter key on window to avoid
  // double-triggering with native button activation on Space
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-600 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
    >
      {/* Subtle gradient background matching main app */}
      <div className="absolute inset-0 bg-gradient-animated" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="backdrop-blur-2xl bg-card/50 border border-border/50 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-16 min-h-[85vh] flex flex-col">

          {/* Top Bar */}
          <div className="flex items-center justify-end mb-auto">
            <span className="font-semibold text-xs sm:text-sm md:text-base text-gradient">
              Intel MMET-Gaming & AI
            </span>
          </div>

          {/* Main Content - Centered on mobile, bottom on desktop */}
          <div className="flex-1 flex flex-col items-center justify-center lg:justify-end lg:items-start mt-8 lg:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full gap-8 lg:gap-12">

              {/* Left - Logo + Title + Tagline */}
              <div className="flex flex-col items-center lg:items-start">
                {/* Logo with garden theme and glow */}
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 sm:mb-8 animate-fade-in-up border border-primary/20 glow"
                  style={{
                    animationDelay: '0.1s',
                    animationFillMode: 'both'
                  }}
                >
                  <Sprout className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-primary-foreground drop-shadow-lg" />
                </div>

                {/* Title with fluid responsive sizing */}
                <div className="text-center lg:text-left mb-4 sm:mb-6">
                  <h1
                    className="font-black tracking-tighter leading-[0.9] text-foreground mb-1 sm:mb-2 animate-fade-in-up"
                    style={{
                      fontSize: 'clamp(3rem, 12vw, 10rem)',
                      animationDelay: '0.3s',
                      animationFillMode: 'both'
                    }}
                  >
                    Model
                  </h1>
                  <h1
                    className="font-black tracking-tighter leading-[0.9] text-foreground animate-fade-in-up"
                    style={{
                      fontSize: 'clamp(3rem, 12vw, 10rem)',
                      animationDelay: '0.5s',
                      animationFillMode: 'both'
                    }}
                  >
                    Garden.
                  </h1>
                </div>

                {/* Tagline */}
                <p
                  className="text-muted-foreground font-medium tracking-wide text-center lg:text-left animate-fade-in-up"
                  style={{
                    fontSize: 'clamp(0.875rem, 2vw, 1.5rem)',
                    animationDelay: '0.7s',
                    animationFillMode: 'both'
                  }}
                >
                  Your local AI Playground
                </p>

                {/* Connection Status */}
                {isConnected && (
                  <div
                    className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border animate-fade-in-up"
                    style={{
                      animationDelay: '0.9s',
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_hsl(var(--accent-cyan))] animate-pulse" />
                    <span className="text-foreground text-xs sm:text-sm font-medium">
                      Server Connected
                    </span>
                  </div>
                )}
              </div>

              {/* Right - CTA Button */}
              <div
                className="flex justify-center lg:justify-end lg:self-end w-full lg:w-auto animate-fade-in-up"
                style={{
                  animationDelay: '1.1s',
                  animationFillMode: 'both'
                }}
              >
                <button
                  onClick={handleEnter}
                  className="group relative inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-base sm:text-lg md:text-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30"
                  aria-label="Start exploring Model Garden"
                >
                  <span className="relative z-10 text-primary-foreground">
                    Start Exploring
                  </span>

                  {/* Arrow icon */}
                  <span className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/20 flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
