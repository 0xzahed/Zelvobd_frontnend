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
      <style>{`
        .shiny-text {
          background: linear-gradient(
            90deg,
            currentColor 0%,
            currentColor 40%,
            #ffffff 50%,
            currentColor 60%,
            currentColor 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  )
}
