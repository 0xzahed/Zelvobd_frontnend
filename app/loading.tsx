export default function GlobalLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Loading...</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait while we prepare your page.</p>
        </div>
      </div>
    </div>
  )
}
