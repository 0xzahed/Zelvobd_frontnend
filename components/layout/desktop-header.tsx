"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Flame,
  Gift,
  Headphones,
  Home,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  X,
} from "lucide-react"
import { CartBottomSheet } from "@/components/ui/cart-bottom-sheet"
import { useCart } from "@/contexts/cart-context"

type NavLink = {
  label: string
  href: string
  Icon: React.ComponentType<{ className?: string }>
  accent?: string
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Flash Sale", href: "/offers", Icon: Flame, accent: "text-accent" },
  { label: "Trending", href: "/trending", Icon: TrendingUp, accent: "text-primary" },
  { label: "Free Delivery", href: "/free-delivery", Icon: Truck, accent: "text-success" },
  { label: "New", href: "/new-products", Icon: Sparkles, accent: "text-primary" },
  { label: "Offers", href: "/offers", Icon: Gift, accent: "text-warning" },
  { label: "Help", href: "/help", Icon: Headphones },
]

export function DesktopHeader() {
  const { totalCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Hide on admin + product detail / auth pages (same behaviour as the shell).
  const hidden =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/product/") ||
    pathname?.startsWith("/login")

  // Close search panel whenever the route changes.
  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

  // Focus the input when the search panel opens; close on Escape.
  useEffect(() => {
    if (!searchOpen) return
    searchInputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [searchOpen])

  if (hidden) return null

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname?.startsWith(href + "/")
  }

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-border/40 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              E
            </span>
            <span className="text-xl font-bold text-foreground">Zelvobd</span>
          </Link>

          {/* Primary navigation — grows to fill, icons on the right */}
          <nav className="flex min-w-0 flex-1 items-center gap-1">
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV_LINKS.map(({ label, href, Icon, accent }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ${
                      active
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${!active && accent ? accent : ""}`} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Right side icons */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search products"
              aria-expanded={searchOpen}
              className={`grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-card shadow-sm transition ${
                searchOpen
                  ? "bg-white text-primary"
                  : "text-foreground hover:bg-card"
              }`}
            >
              <Search className="h-5 w-5" />
            </button>

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

        {/* Slide-down search panel (appears only when the icon is clicked) */}
        {searchOpen && (
          <div className="border-t border-border/50 bg-background">
            <div className="mx-auto max-w-7xl px-6 py-3">
              <form
                onSubmit={onSubmit}
                className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4"
                role="search"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands, and categories..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search products"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <CartBottomSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
