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
    ? "grid h-5 min-w-5 place-items-center rounded bg-foreground px-1 text-[10px] font-bold text-white"
    : "grid h-8 min-w-8 place-items-center rounded-md bg-foreground px-1.5 text-xs font-bold text-white"

  const sepCls = compact ? "text-[10px] font-bold text-foreground" : "font-bold text-foreground"
  const gapCls = compact ? "gap-0.5" : "gap-1"

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
