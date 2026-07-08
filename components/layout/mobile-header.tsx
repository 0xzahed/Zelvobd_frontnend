"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

export function MobileHeader() {
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  if (pathname?.startsWith("/product/")) {
    return null
  }

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when opened; close on Escape or click outside
  useEffect(() => {
    if (!searchOpen) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [searchOpen])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setQuery("")
    setSearchOpen(false)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-white md:hidden">
        <div ref={containerRef} className="flex h-14 items-center gap-2 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 text-lg font-bold text-foreground">
            <Image 
              src="/logo.png" 
              alt="Zelvobd" 
              width={100} 
              height={28} 
              className="h-10 w-auto object-contain" 
              priority 
            />
          </Link>

          {searchOpen ? (
            <>
              <form
                onSubmit={onSearchSubmit}
                className="flex h-10 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3"
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>
    </>
  )
}
