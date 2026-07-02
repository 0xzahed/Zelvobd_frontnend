"use client"

import { cn } from "@/lib/utils"

interface ShinyTextProps {
  text: string
  className?: string
  disabled?: boolean
}

export function ShinyText({ text, className, disabled = false }: ShinyTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block",
        disabled ? "" : "shiny-text",
        className
      )}
    >
      {text}
    </span>
  )
}
