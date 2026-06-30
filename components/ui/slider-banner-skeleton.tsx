export function SliderBannerSkeleton() {
  return (
    <div className="relative aspect-2/1 w-full overflow-hidden rounded-xl bg-muted/60 md:aspect-16/5 animate-pulse">
      {/* Optional: Add a subtle loading shimmer effect inside */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  )
}
