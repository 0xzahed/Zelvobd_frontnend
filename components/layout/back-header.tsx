"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

export function BackHeader({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between py-3">
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h1 className="text-base font-medium text-foreground md:text-xl">{title}</h1>
      <div className="h-10 w-10">{right}</div>
    </div>
  )
}
