"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="grid min-h-dvh place-items-center bg-background px-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Critical error</p>
            <h1 className="mt-2 text-xl font-bold text-foreground">Application failed to render</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please retry. If the issue persists, contact support.
            </p>

            <div className="mt-5">
              <button
                onClick={reset}
                className="h-10 rounded-full bg-[#306FD7] px-5 text-sm font-semibold text-white"
              >
                Reload app
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/80">{error?.message || "Unknown error"}</p>
          </div>
        </div>
      </body>
    </html>
  )
}
