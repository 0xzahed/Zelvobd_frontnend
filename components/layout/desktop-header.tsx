"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search, ShoppingCart, X } from "lucide-react"
import { CartBottomSheet } from "@/components/ui/cart-bottom-sheet"
import { useCart } from "@/contexts/cart-context"

type NavLink = {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Flash Sale", href: "/offers" },
  { label: "Trending", href: "/trending" },
  { label: "Free Delivery", href: "/free-delivery" },
  { label: "New", href: "/new-products" },
  { label: "Offers", href: "/offers" },
  { label: "Help", href: "/help" },
]

export function DesktopHeader() {
  const { totalCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const hidden =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/product/") ||
    pathname?.startsWith("/login")

  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

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
      <div className="hidden h-20 w-full md:block" aria-hidden="true" />
      
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/40 bg-background/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-6 transition-all duration-300">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2 transition-transform duration-300 hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Zelvobd" 
              width={140} 
              height={40} 
              className="h-14 w-auto object-contain drop-shadow-sm" 
              priority 
            />
          </Link>

          {/* Primary navigation — replaced by search form when open */}
          {searchOpen ? (
            <form
              onSubmit={onSubmit}
              className="mx-auto flex h-11 w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4"
              role="search"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, and categories..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
              >
                Search
              </button>
            </form>
          ) : (
            <nav className="flex min-w-0 flex-1 items-center justify-center px-4">
              <div className="flex items-center gap-1 rounded-full bg-secondary/50 p-1.5 shadow-inner backdrop-blur-md border border-border/50 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {NAV_LINKS.map(({ label, href }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={label}
                      href={href}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                        active
                          ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                          : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}

          {/* Right side icons */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search products"
              aria-expanded={searchOpen}
              className={`group flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm transition-all duration-300 hover:shadow-md hover:border-border ${
                searchOpen ? "ring-2 ring-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm transition-all duration-300 hover:shadow-md hover:border-border text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
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
