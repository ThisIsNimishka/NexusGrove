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
        'flex items-center gap-4 px-6 py-4 rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-300',
        'min-w-[320px] max-w-full',
        isClosing ? 'animate-toast-out' : 'animate-toast-in',
        toast.type === 'success' && 'border-accent-cyan/40 shadow-accent-cyan/10',
        toast.type === 'error' && 'border-destructive/40 shadow-destructive/10',
        toast.type === 'info' && 'border-primary/40 shadow-primary/10'
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        'absolute inset-0 opacity-5 px-6 pointer-events-none',
        toast.type === 'success' && 'bg-accent-cyan',
        toast.type === 'error' && 'bg-destructive',
        toast.type === 'info' && 'bg-primary'
      )} />

      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
        toast.type === 'success' && 'bg-accent-cyan/15 text-accent-cyan',
        toast.type === 'error' && 'bg-destructive/15 text-destructive',
        toast.type === 'info' && 'bg-primary/15 text-primary'
      )}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-bold text-foreground tracking-tight line-clamp-2">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => {
          setIsClosing(true)
          setTimeout(onClose, 300)
        }}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar Loader */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-[3200ms] ease-linear",
            toast.type === 'success' && 'bg-accent-cyan',
            toast.type === 'error' && 'bg-destructive',
            toast.type === 'info' && 'bg-primary'
          )}
          style={{ width: isClosing ? '0%' : '100%' }}
        />
      </div>
    </div>
  )
}
