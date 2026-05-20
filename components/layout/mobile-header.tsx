"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, ShoppingCart } from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"
import { CartBottomSheet } from "@/components/ui/cart-bottom-sheet"
import { useCart } from "@/contexts/cart-context"

export function MobileHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cartOpen, setCartOpen] = useState(false)
  const { totalCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  if (pathname?.startsWith("/product/")) {
    return null
  }

  const openSearch = () => {
    setSearchOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery("")
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    closeSearch()
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] md:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          {/* Logo — hide the wordmark when search is open to prevent layout overflow */}
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-1.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              E
            </span>
            {!searchOpen && <span className="truncate text-lg font-bold text-foreground">EcoMerce</span>}
          </Link>

          {/* Expanding inline search input. Uses min-w-0 so flex can shrink without overflow. */}
          {searchOpen && (
            <form
              onSubmit={onSearchSubmit}
              className="ml-1 flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-card px-3"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => {
                  if (!query.trim()) closeSearch()
                }}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search"
              />
            </form>
          )}

          {/* Right actions */}
          <div className={`flex shrink-0 items-center gap-1 ${searchOpen ? "" : "ml-auto"}`}>
            {!searchOpen && (
              <button
                onClick={openSearch}
                aria-label="Open search"
                className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-card shadow-sm text-foreground hover:bg-card"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            <NotificationBell />
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-card shadow-sm text-foreground hover:bg-card"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartBottomSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
