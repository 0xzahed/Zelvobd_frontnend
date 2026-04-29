"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      onClick={onCopy}
      className="mt-2 inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 font-mono text-lg font-bold tracking-wider text-foreground"
      aria-label={`Copy tracking code ${code}`}
    >
      {code}
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}
