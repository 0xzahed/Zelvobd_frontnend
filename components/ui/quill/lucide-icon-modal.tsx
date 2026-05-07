"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { renderToStaticMarkup } from "react-dom/server"

interface LucideIconModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectIcon: (svgHtml: string) => void
}

// Extract only valid icon components
const allIconNames = Object.keys(LucideIcons).filter((key) => {
  const item = (LucideIcons as any)[key]
  // Must be a valid component (function or forwardRef object), exclude Context/create tools, start with Capital
  return (
    item &&
    (typeof item === "function" || typeof item === "object") &&
    key !== "createLucideIcon" &&
    !key.endsWith("Context") &&
    /^[A-Z]/.test(key)
  )
})

export function LucideIconModal({ isOpen, onClose, onSelectIcon }: LucideIconModalProps) {
  const [search, setSearch] = useState("")

  const filteredIcons = useMemo(() => {
    if (!search) return allIconNames.slice(0, 100) // Show first 100 by default for performance
    const lowerSearch = search.toLowerCase()
    return allIconNames.filter((name) => name.toLowerCase().includes(lowerSearch)).slice(0, 100)
  }, [search])

  if (!isOpen) return null

  const handleSelect = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      // Render the SVG to a raw HTML string. We inject standard classes for styling.
      const svgString = renderToStaticMarkup(
        <IconComponent className="inline-block h-[1em] w-[1em] align-middle text-inherit stroke-current mx-0.5" />
      )
      onSelectIcon(svgString)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Insert Icon</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="border-b border-border p-4">
          <div className="relative flex items-center rounded-lg border border-border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/50">
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <input
              type="text"
              autoFocus
              placeholder="Search icons (e.g. 'shopping', 'arrow', 'star')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredIcons.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No icons found matching "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {filteredIcons.map((name) => {
                const Icon = (LucideIcons as any)[name]
                return (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className="flex flex-col items-center justify-center rounded-lg border border-transparent p-3 hover:border-border hover:bg-muted hover:shadow-sm transition-all"
                    title={name}
                  >
                    <Icon className="h-6 w-6 text-foreground mb-2" />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {name.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
