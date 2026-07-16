"use client"

import { LayoutGrid, Table } from "lucide-react"
import { cx } from "@/lib/format"

export type ViewMode = "grid" | "table"

export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border/60 bg-card p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cx(
          "grid h-8 w-8 place-items-center rounded-md transition",
          mode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cx(
          "grid h-8 w-8 place-items-center rounded-md transition",
          mode === "table" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Table view"
      >
        <Table className="h-4 w-4" />
      </button>
    </div>
  )
}
