export function CategoriesListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0">
          <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
          <div className="ml-auto h-4 w-4 rounded bg-muted/40 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
