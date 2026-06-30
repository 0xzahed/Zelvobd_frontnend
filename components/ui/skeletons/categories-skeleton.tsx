export function CategoriesSkeleton() {
  return (
    <section className="space-y-3">
      {/* Title skeleton */}
      <div className="h-5 w-40 rounded-md bg-muted/60 animate-pulse md:h-6 md:w-48" />

      {/* Grid skeleton */}
      <div className="flex overflow-hidden">
        <div className="grid w-full shrink-0 grid-cols-4 gap-y-4 pt-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse px-1">
              <div className="h-17 w-17 rounded-full bg-muted/60 sm:h-19 sm:w-19" />
              <div className="h-3 w-14 rounded-full bg-muted/60 sm:w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
