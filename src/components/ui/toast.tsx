import * as React from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast_${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto remove after 3.5 seconds to give more time to read
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isClosing, setIsClosing] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsClosing(true), 3200)
    return () => clearTimeout(timer)
  }, [])

  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }[toast.type]

  return (
    <div
      className={cn(
        'relative group pointer-events-auto overflow-hidden',
        'flex items-center gap-4 px-6 py-4 rounded-2xl border bg-card/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-butter duration-butter',
        'min-w-[340px] max-w-full',
        isClosing ? 'animate-toast-out' : 'animate-toast-in',
        toast.type === 'success' && 'border-accent-cyan/30 shadow-accent-cyan/5',
        toast.type === 'error' && 'border-destructive/30 shadow-destructive/5',
        toast.type === 'info' && 'border-primary/30 shadow-primary/5'
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        'absolute inset-0 opacity-[0.03] px-6 pointer-events-none',
        toast.type === 'success' && 'bg-accent-cyan',
        toast.type === 'error' && 'bg-destructive',
        toast.type === 'info' && 'bg-primary'
      )} />

      <div className={cn(
        'flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-transform duration-500 group-hover:scale-110',
        toast.type === 'success' && 'bg-accent-cyan/10 text-accent-cyan',
        toast.type === 'error' && 'bg-destructive/10 text-destructive',
        toast.type === 'info' && 'bg-primary/10 text-primary'
      )}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground tracking-tight leading-snug">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => {
          setIsClosing(true)
          setTimeout(onClose, 300)
        }}
        className="shrink-0 p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-butter active:scale-95"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar Loader - Thicker and more visible */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-[3200ms] ease-linear",
            toast.type === 'success' && 'bg-accent-cyan shadow-[0_0_8px_hsl(var(--accent-cyan))]',
            toast.type === 'error' && 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]',
            toast.type === 'info' && 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]'
          )}
          style={{ width: isClosing ? '0%' : '100%' }}
        />
      </div>
    </div>
  )
}
