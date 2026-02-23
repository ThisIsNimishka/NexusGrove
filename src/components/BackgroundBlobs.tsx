import { cn } from '@/lib/utils'

export function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
            <div
                className={cn(
                    "absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full",
                    "bg-primary/20 blur-[120px] animate-blob"
                )}
            />
            <div
                className={cn(
                    "absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full",
                    "bg-accent/20 blur-[120px] animate-blob"
                )}
                style={{ animationDelay: '-5s' }}
            />
            <div
                className={cn(
                    "absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full",
                    "bg-accent-cyan/10 blur-[100px] animate-blob"
                )}
                style={{ animationDelay: '-10s' }}
            />
            <div
                className={cn(
                    "absolute bottom-[20%] left-[10%] w-[25%] h-[25%] rounded-full",
                    "bg-primary/15 blur-[80px] animate-blob"
                )}
                style={{ animationDelay: '-15s' }}
            />
        </div>
    )
}
