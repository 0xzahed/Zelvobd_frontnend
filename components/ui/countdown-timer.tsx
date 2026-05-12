"use client"

import { useEffect, useMemo, useState } from "react"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function CountdownTimer({
  days = 0,
  hours = 0,
  minutes = 0,
  compact = false,
}: {
  days?: number
  hours?: number
  minutes?: number
  compact?: boolean
}) {
  const endTime = useMemo(() => {
    const base = Date.now()
    return base + days * 86400000 + hours * 3600000 + minutes * 60000
  }, [days, hours, minutes])

  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = Math.max(0, endTime - now)
  const d = Math.floor(remaining / 86400000)
  const h = Math.floor((remaining % 86400000) / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)

  const boxCls = compact
    ? "grid h-7 min-w-7 place-items-center rounded border border-border/70 bg-white px-1.5 text-xs font-bold text-foreground shadow-sm"
    : "grid h-9 min-w-9 place-items-center rounded-md bg-foreground px-2 text-sm font-bold text-white"

  const sepCls = compact ? "text-xs font-bold text-foreground" : "text-base font-bold text-foreground"
  const gapCls = compact ? "gap-1" : "gap-1.5"

  return (
    <div className={`flex items-center ${gapCls}`} aria-live="polite">
      <span className={boxCls}>{pad(d)}</span>
      <span className={sepCls}>:</span>
      <span className={boxCls}>{pad(h)}</span>
      <span className={sepCls}>:</span>
      <span className={boxCls}>{pad(m)}</span>
      <span className={sepCls}>:</span>
      <span className={boxCls}>{pad(s)}</span>
    </div>
  )
}
