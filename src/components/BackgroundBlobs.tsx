export function BackgroundBlobs() {

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary Blob */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 animate-blob"
                style={{ background: 'hsl(var(--primary))' }}
            />

            {/* Accent Blob */}
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 animate-blob"
                style={{
                    background: 'hsl(var(--accent))',
                    animationDelay: '-5s',
                    animationDuration: '30s'
                }}
            />

            {/* Cyan Blob */}
            <div
                className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full blur-[80px] opacity-15 animate-blob"
                style={{
                    background: 'hsl(var(--accent-cyan))',
                    animationDelay: '-12s',
                    animationDuration: '35s'
                }}
            />

            {/* Secondary Blob for contrast */}
            <div
                className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-10 animate-blob"
                style={{
                    background: 'hsl(var(--primary))',
                    animationDelay: '-18s'
                }}
            />
        </div>
    )
}
