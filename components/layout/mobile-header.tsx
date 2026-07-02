"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search } from "lucide-react"
export function MobileHeader() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  if (pathname?.startsWith("/product/")) {
    return null
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setQuery("")
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white md:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          {/* Logo */}
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

          {/* Search Bar - Always Open, 50% width */}
          <form
            onSubmit={onSearchSubmit}
            className="flex h-10 w-1/2 items-center gap-2 rounded-full border border-border bg-card px-3"
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
          </form>
        </div>
      </header>
    </>
  )
}
