"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Lottie ships with browser-only code; load it on the client only.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type LottieIconProps = {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  ariaLabel?: string
}

/**
 * Renders a Lottie animation from a JSON URL (e.g. a file in /public).
 * Designed as a drop-in replacement for an <Icon /> sized via className.
 */
export function LottieIcon({
  src,
  className,
  loop = true,
  autoplay = true,
  ariaLabel,
}: LottieIconProps) {
  const [data, setData] = useState<unknown | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  if (!data) {
    // Reserve space so layout doesn't jump while the JSON is loading.
    return <span className={className} aria-hidden="true" />
  }

  return (
    <span className={className} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel}>
      <Lottie
        animationData={data}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </span>
  )
}
