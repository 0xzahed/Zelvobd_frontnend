import { cx } from "@/lib/format"

type ScaleLoaderProps = {
  className?: string
  /** Optional rounded variant shortcut */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

/**
 * ScaleLoader — the single loading skeleton used across the app.
 * Uses a gentle scale + opacity pulse (see .animate-scale-pulse in globals.css).
 * Compose multiple of these to build list/card skeletons.
 *
 * Example:
 *   <ScaleLoader className="h-40 w-full" rounded="2xl" />
 */
export function ScaleLoader({ className, rounded = "xl" }: ScaleLoaderProps) {
  const radius = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    "2xl": "rounded-3xl",
    full: "rounded-full",
  }[rounded]

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cx(
        "block bg-[#E5E9F2] animate-scale-pulse",
        radius,
        className,
      )}
    />
  )
}

/** Convenience composite — a product-card-sized skeleton block. */
export function ScaleLoaderCard({ className }: { className?: string }) {
  return (
    <div className={cx("space-y-2", className)}>
      <ScaleLoader className="h-40 w-full" rounded="2xl" />
      <ScaleLoader className="h-3 w-3/4" rounded="sm" />
      <ScaleLoader className="h-3 w-1/2" rounded="sm" />
    </div>
  )
}
