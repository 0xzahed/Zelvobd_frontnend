export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-sm border border-border/60 bg-card p-1 shadow-sm ${
        compact ? "w-44 shrink-0 md:w-48 lg:w-56" : "w-full md:h-80 md:max-w-225"
      }`}
    >
      <div className={`w-full overflow-hidden rounded-xl bg-muted/60 animate-pulse ${
        compact ? "aspect-square" : "aspect-square md:aspect-auto md:flex-1 md:min-h-0"
      }`} />
      
      <div className="mt-2 flex min-w-0 flex-1 flex-col p-1">
        <div className="flex flex-col gap-1.5 items-center">
          <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-muted/60 animate-pulse" />
        </div>
        
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
        </div>
        
        <div className="mt-1 flex items-center gap-1">
          <div className="h-2 w-12 rounded-full bg-muted/60 animate-pulse" />
        </div>
        
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="h-8 flex-1 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-8 w-10 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
