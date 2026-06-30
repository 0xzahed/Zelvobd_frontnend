export function ProductCardSkeleton({
  compact = false,
  emphasis = false,
}: {
  compact?: boolean
  emphasis?: boolean
}) {
  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card ${
        compact
          ? "w-44 shrink-0 md:w-48 lg:w-56"
          : emphasis
            ? "w-full p-3 md:h-96 md:max-w-225"
            : "w-full md:h-80 md:max-w-225"
      }`}
    >
      {/* Image Skeleton */}
      <div
        className={`w-full overflow-hidden rounded-t-lg bg-muted/60 animate-pulse ${
          compact ? "aspect-square" : "aspect-square md:aspect-auto md:flex-1 md:min-h-0"
        }`}
      />

      <div className="mt-2 flex min-w-0 flex-1 flex-col">
        {/* Title Skeleton */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-2">
          <div className="h-3.5 w-11/12 rounded bg-muted/60 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded bg-muted/60 animate-pulse" />
        </div>

        {/* Price Skeleton */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <div className="h-4 w-16 rounded bg-muted/60 animate-pulse" />
          <div className="h-3 w-10 rounded bg-muted/60 animate-pulse" />
        </div>

        {/* Badges Skeleton */}
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-3 w-14 rounded-full bg-muted/60 animate-pulse" />
        </div>

        {/* Rating Skeleton */}
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-3 w-20 rounded bg-muted/60 animate-pulse" />
        </div>

        {/* Action Button Skeleton */}
        <div className="mt-auto px-2 pt-2 pb-2">
          <div
            className={`w-full rounded-full bg-muted/60 animate-pulse ${
              emphasis ? "h-9" : "h-8"
            }`}
          />
        </div>
      </div>
    </div>
  )
}
