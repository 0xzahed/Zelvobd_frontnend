export function CartSkeleton() {
  return (
    <div className="py-4 md:py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center">
        <div className="h-10 w-10 rounded-full bg-muted/60" />
        <div className="mx-auto h-5 w-16 rounded bg-muted/60" />
        <div className="h-10 w-10 rounded-full bg-muted/60" />
      </div>

      <div className="grid gap-6 pb-24 md:grid-cols-[1fr_340px] md:pb-0">
        {/* Left column: Cart Items */}
        <div className="space-y-3">
          {/* Select All Bar */}
          <div className="flex h-10 items-center justify-between rounded-xl border border-border/60 bg-card px-3">
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="h-3 w-16 rounded bg-muted/60" />
          </div>
          
          {/* Item 1 */}
          <div className="flex gap-3 rounded-2xl bg-card p-3">
            <div className="mt-1 h-4 w-4 shrink-0 rounded bg-muted/60" />
            <div className="h-24 w-24 shrink-0 rounded-[8px] bg-muted/60" />
            <div className="flex flex-1 flex-col justify-center space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/4 rounded bg-muted/60" />
              <div className="h-4 w-1/3 rounded bg-muted/60" />
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-3 rounded-2xl bg-card p-3">
            <div className="mt-1 h-4 w-4 shrink-0 rounded bg-muted/60" />
            <div className="h-24 w-24 shrink-0 rounded-[8px] bg-muted/60" />
            <div className="flex flex-1 flex-col justify-center space-y-2">
              <div className="h-4 w-2/3 rounded bg-muted/60" />
              <div className="h-3 w-1/3 rounded bg-muted/60" />
              <div className="h-4 w-1/4 rounded bg-muted/60" />
            </div>
          </div>
        </div>

        {/* Right column: Checkout Box */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
            <div className="h-5 w-32 rounded bg-muted/60" />
            <div className="space-y-2">
              <div className="flex justify-between"><div className="h-3 w-16 rounded bg-muted/60" /><div className="h-3 w-12 rounded bg-muted/60" /></div>
              <div className="flex justify-between"><div className="h-3 w-20 rounded bg-muted/60" /><div className="h-3 w-10 rounded bg-muted/60" /></div>
              <div className="my-2 h-px w-full bg-muted/60" />
              <div className="flex justify-between"><div className="h-4 w-12 rounded bg-muted/60" /><div className="h-4 w-16 rounded bg-muted/60" /></div>
            </div>
            <div className="h-10 w-full rounded-xl bg-muted/60 mt-4" />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
             <div className="h-8 w-full rounded-lg bg-muted/60" />
             <div className="h-8 w-full rounded-lg bg-muted/60" />
             <div className="h-8 w-full rounded-lg bg-muted/60" />
             <div className="h-20 w-full rounded-lg bg-muted/60" />
             <div className="h-10 w-full rounded-full bg-muted/60 mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
