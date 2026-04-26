"use client"

import * as React from "react"
import { IoMdArrowDropdown } from "react-icons/io"
import { cn } from "@/lib/utils"

/**
 * Native <select> styled to match the admin panel.
 * - Hides the browser default arrow (`appearance-none`).
 * - Renders a centered `IoMdArrowDropdown` icon, slightly offset from the
 *   right edge so it doesn't sit flush against the border.
 *
 * Drop-in replacement for `<select>` — accepts the same props/children.
 */
export const AdminSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function AdminSelect({ className, children, ...props }, ref) {
  return (
    <div className="relative inline-flex w-full">
      <select
        ref={ref}
        {...props}
        className={cn(
          // Base look — 8px radius to match the rest of admin panel
          "h-10 w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-9 text-sm outline-none transition focus:border-[#306FD7]/60",
          className,
        )}
      >
        {children}
      </select>
      <IoMdArrowDropdown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/70"
      />
    </div>
  )
})
