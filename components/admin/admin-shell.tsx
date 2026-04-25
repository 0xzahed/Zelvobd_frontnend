"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronRight,
  FolderTree,
  Gauge,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cx } from "@/lib/format"

type NavChild = { href: string; label: string }
type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  exact?: boolean
  children?: NavChild[]
  section?: string
}

const MENU: NavItem[] = [
  { section: "Menu", label: "Overview", icon: LayoutDashboard, href: "/admin", exact: true },
  {
    section: "Catalog",
    label: "Categories",
    icon: FolderTree,
    children: [
      { href: "/admin/categories", label: "Category list" },
      { href: "/admin/categories/sub", label: "Sub Category" },
    ],
  },
  { section: "Catalog", label: "Products", icon: Package, href: "/admin/products" },
  { section: "Catalog", label: "Trending Products", icon: TrendingUp, href: "/admin/trending" },
  { section: "Catalog", label: "Free Delivery", icon: Truck, href: "/admin/free-delivery" },
  {
    section: "Marketing",
    label: "Sliders",
    icon: Sparkles,
    children: [{ href: "/admin/sliders", label: "Sliders List" }],
  },
  { section: "Marketing", label: "Flash Sale", icon: Gauge, href: "/admin/flash-sale" },
  {
    section: "Sales",
    label: "Orders",
    icon: ShoppingBag,
    children: [
      { href: "/admin/orders/new", label: "New Orders" },
      { href: "/admin/orders/pending", label: "Pending Orders" },
      { href: "/admin/orders/processing", label: "Processing Orders" },
      { href: "/admin/orders/hold", label: "Hold Orders" },
      { href: "/admin/orders/pickup", label: "Pickup Orders" },
      { href: "/admin/orders/delivered", label: "Delivered Orders" },
      { href: "/admin/orders/customer-cancelled", label: "Customer Cancelled" },
      { href: "/admin/orders/cancelled", label: "Cancelled Orders" },
      { href: "/admin/orders/trash", label: "Trash Orders" },
    ],
  },
  { section: "Sales", label: "Customers", icon: Users, href: "/admin/customers" },
  { section: "System", label: "Admins", icon: ShieldCheck, href: "/admin/admins" },
  { section: "System", label: "Settings", icon: Settings, href: "/admin/settings" },
]

function isChildActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function isGroupActive(pathname: string, item: NavItem) {
  if (!item.children) return false
  return item.children.some((c) => isChildActive(pathname, c.href))
}

// Group menu items by section while preserving order
function groupBySection(items: NavItem[]) {
  const groups: { section: string; items: NavItem[] }[] = []
  for (const item of items) {
    const section = item.section ?? "Menu"
    const existing = groups.find((g) => g.section === section)
    if (existing) existing.items.push(item)
    else groups.push({ section, items: [item] })
  }
  return groups
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  // Auto-open the group that contains the active route
  const initialOpenGroups = useMemo(() => {
    const set: Record<string, boolean> = {}
    for (const item of MENU) {
      if (item.children && isGroupActive(pathname, item)) {
        set[item.label] = true
      }
    }
    return set
  }, [pathname])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenGroups)

  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, ...initialOpenGroups }))
  }, [initialOpenGroups])

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (pathname !== "/admin/login" && !isAdmin) {
      router.replace("/admin/login")
    }
  }, [ready, isAdmin, pathname, router])

  if (pathname === "/admin/login") {
    return <div className="min-h-[100dvh] bg-[#0F1020] text-white">{children}</div>
  }

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const sections = groupBySection(MENU)

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FB]">
      {/* Sidebar */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/60 bg-card transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[#3B6CF4] text-xs font-semibold text-white">
              E
            </span>
            <span className="text-sm font-medium text-foreground">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav
          className="overflow-y-auto px-3 pb-8"
          style={{ maxHeight: "calc(100dvh - 4rem)" }}
        >
          {sections.map((group, gi) => (
            <div key={group.section} className={gi === 0 ? "" : "mt-4"}>
              <p className="px-3 pb-2 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon

                  // Leaf link
                  if (!item.children) {
                    const active = item.exact
                      ? pathname === item.href
                      : !!item.href && isChildActive(pathname, item.href)
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href!}
                          onClick={() => setOpen(false)}
                          className={cx(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-normal transition",
                            active
                              ? "bg-[#EEF0FB] text-[#3B6CF4]"
                              : "text-muted-foreground hover:bg-[#F5F7FB] hover:text-foreground",
                          )}
                        >
                          <Icon
                            className={cx(
                              "h-4 w-4 shrink-0",
                              active ? "text-[#3B6CF4]" : "text-muted-foreground",
                            )}
                            strokeWidth={1.75}
                          />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      </li>
                    )
                  }

                  // Group with children
                  const groupActive = isGroupActive(pathname, item)
                  const isOpen = openGroups[item.label] ?? false
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isOpen}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-normal transition",
                          groupActive
                            ? "text-[#3B6CF4]"
                            : "text-muted-foreground hover:bg-[#F5F7FB] hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cx(
                            "h-4 w-4 shrink-0",
                            groupActive ? "text-[#3B6CF4]" : "text-muted-foreground",
                          )}
                          strokeWidth={1.75}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cx(
                            "h-3.5 w-3.5 transition-transform",
                            isOpen ? "rotate-90" : "rotate-0",
                          )}
                          strokeWidth={1.75}
                        />
                      </button>
                      {isOpen && (
                        <ul className="mt-0.5 space-y-0.5 border-l border-border/60 pl-3 ml-[22px]">
                          {item.children.map((child) => {
                            const active = isChildActive(pathname, child.href)
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpen(false)}
                                  className={cx(
                                    "flex items-center rounded-md px-3 py-1.5 text-[13px] font-normal transition",
                                    active
                                      ? "bg-[#EEF0FB] text-[#3B6CF4]"
                                      : "text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 ml-0 flex h-16 items-center border-b border-border/60 bg-card px-4 md:ml-64 md:px-6">
        <button
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-[#F5F7FB] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <main className="ml-0 p-4 md:ml-64 md:p-6">{children}</main>
    </div>
  )
}
