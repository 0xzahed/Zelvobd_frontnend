export function OfferSkeleton() {
  return (
    <div className="block overflow-hidden rounded-lg border border-border/30 bg-card animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-video w-full rounded-b-lg bg-muted/60" />
      
      {/* Content Skeleton */}
      <div className="space-y-2 p-3">
        {/* Title */}
        <div className="h-4 w-3/4 rounded bg-muted/60" />
        
        {/* Subtitle (2 lines) */}
        <div className="space-y-1">
          <div className="h-3 w-full rounded bg-muted/60" />
          <div className="h-3 w-5/6 rounded bg-muted/60" />
        </div>
        
        {/* Time & Date */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-2.5 w-12 rounded bg-muted/60" />
          <div className="h-2.5 w-20 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  )
}
