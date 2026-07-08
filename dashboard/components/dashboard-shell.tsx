"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardSidebar } from "./sidebar"

const PAGE_TITLES: { match: string | RegExp; title: string }[] = [
  { match: "/dashboard/products/new", title: "New Product" },
  { match: /^\/dashboard\/products\/[^/]+$/, title: "Edit Product" },
  { match: "/dashboard/products", title: "Products" },
  { match: "/dashboard/categories/sub", title: "Sub Categories" },
  { match: "/dashboard/categories", title: "Categories" },
  { match: "/dashboard/category-banners", title: "Category Banners" },
  { match: "/dashboard/trending", title: "Trending Products" },
  { match: "/dashboard/free-delivery", title: "Free Delivery" },
  { match: "/dashboard/sliders", title: "Banners" },
  { match: "/dashboard/youtube", title: "YouTube Videos" },
  { match: "/dashboard/promos", title: "Promo Codes" },
  { match: "/dashboard/flash-sale", title: "Flash Sales" },
  { match: "/dashboard/orders/pending", title: "Pending Orders" },
  { match: "/dashboard/orders/processing", title: "Processing Orders" },
  { match: "/dashboard/orders/hold", title: "Hold Orders" },
  { match: "/dashboard/orders/pickup", title: "Pickup Orders" },
  { match: "/dashboard/orders/delivered", title: "Delivered Orders" },
  { match: "/dashboard/orders/cancelled", title: "Cancelled Orders" },
  { match: "/dashboard/customers", title: "Customers" },
  { match: "/dashboard/chat", title: "Live Chat" },
  { match: "/dashboard/admins", title: "Admins" },
  { match: "/dashboard/footer", title: "Footer" },
  { match: "/dashboard/notifications", title: "Notifications" },
  { match: "/dashboard", title: "Dashboard Overview" },
]

function getPageTitle(pathname: string) {
  for (const entry of PAGE_TITLES) {
    if (typeof entry.match === "string") {
      if (pathname === entry.match || pathname.startsWith(entry.match + "/")) return entry.title
    } else if (entry.match.test(pathname)) {
      return entry.title
    }
  }
  return "Dashboard"
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, authLoading } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      router.replace("/login")
    }
  }, [authLoading, isAdmin, pathname, router])

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])

  if (authLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Checking admin session...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface px-4 text-sm text-muted-foreground">
        Redirecting to login...
      </div>
    )
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-surface">
      <DashboardSidebar open={open} onClose={() => setOpen(false)} />

      {/* Top bar */}
      <header className="sticky top-0 z-20 ml-0 flex h-16 items-center justify-between border-b border-border/40 bg-surface-elevated px-4 md:ml-[250px] md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
        </div>

      </header>

      {/* Main */}
      <main className="ml-0 min-h-[calc(100dvh-4rem)] p-4 md:ml-[250px] md:p-6">
        <div className="mx-auto max-w-[1600px]">{children}</div>
      </main>
    </div>
  )
}
