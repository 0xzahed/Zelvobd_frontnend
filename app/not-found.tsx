"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="mb-6 text-[120px] font-extrabold leading-none tracking-tighter text-primary/10 sm:text-[180px]">
        404
      </h1>

      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Page Not Found</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  )
}
