"use client"

import { useEffect } from "react"

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Something went wrong</p>
        <h1 className="mt-2 text-xl font-bold text-foreground">We could not load this page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. You can try again now.
        </p>

        <div className="mt-5">
          <button
            onClick={reset}
            className="h-10 rounded-full bg-[#306FD7] px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
