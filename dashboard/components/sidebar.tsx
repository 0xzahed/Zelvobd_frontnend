"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  TrendingUp,
  Truck,
  Sparkles,
  Youtube,
  CircleDollarSign,
  Gauge,
  Users,
  MessageSquare,
  ShieldCheck,
  Settings2,
  ChevronRight,
  X,
  Image,
  Layout,
} from "lucide-react"
import { cx } from "@/lib/format"
import { useState, useMemo } from "react"

type NavChild = { href: string; label: string }
type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  exact?: boolean
  children?: NavChild[]
  badge?: string
}

type Section = {
  title: string
  items: NavItem[]
}

const MENU: Section[] = [
  {
    title: "Menu",
    items: [{ label: "Overview", icon: LayoutDashboard, href: "/admin", exact: true }],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Categories",
        icon: FolderTree,
        children: [
          { href: "/admin/categories", label: "Category" },
          { href: "/admin/categories/sub", label: "Sub Category" },
          { href: "/admin/category-banners", label: "Category Banners" },
        ],
      },
      { label: "Products", icon: Package, href: "/admin/products" },
      { label: "Trending Products", icon: TrendingUp, href: "/admin/trending" },
      { label: "Free Delivery", icon: Truck, href: "/admin/free-delivery" },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        label: "Sliders",
        icon: Sparkles,
        children: [{ href: "/admin/sliders", label: "Sliders List" }],
      },
      { label: "Landing Pages", icon: Layout, href: "/admin/landing-pages" },
      { label: "YouTube Videos", icon: Youtube, href: "/admin/youtube" },
      { label: "Promos", icon: CircleDollarSign, href: "/admin/promos" },
      { label: "Flash Sale", icon: Gauge, href: "/admin/flash-sale", badge: "HOT" },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Orders",
        icon: ShoppingBag,
        children: [
          { href: "/admin/orders/pending", label: "Pending" },
          { href: "/admin/orders/processing", label: "Processing" },
          { href: "/admin/orders/hold", label: "Hold" },
          { href: "/admin/orders/pickup", label: "Pickup" },
          { href: "/admin/orders/delivered", label: "Delivered" },
          { href: "/admin/orders/cancelled", label: "Cancelled" },
        ],
      },
      { label: "Customers", icon: Users, href: "/admin/customers" },
    ],
  },
  {
    title: "Support",
    items: [{ label: "Live Chat", icon: MessageSquare, href: "/admin/chat" }],
  },
  {
    title: "System",
    items: [
      { label: "Admins", icon: ShieldCheck, href: "/admin/admins" },
      { label: "Footer", icon: Settings2, href: "/admin/footer" },
    ],
  },
]

function matchHref(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function findBestChild(pathname: string, children: NavChild[]) {
  const sorted = [...children].sort((a, b) => b.href.length - a.href.length)
  return sorted.find((child) => matchHref(pathname, child.href))
}

function isChildActive(pathname: string, href: string, children?: NavChild[]) {
  if (!children) return matchHref(pathname, href)
  const best = findBestChild(pathname, children)
  return best?.href === href
}

function isGroupActive(pathname: string, item: NavItem) {
  if (!item.children) return false
  return !!findBestChild(pathname, item.children)
}

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const initialOpenGroups = useMemo(() => {
    const set: Record<string, boolean> = {}
    for (const section of MENU) {
      for (const item of section.items) {
        if (item.children && isGroupActive(pathname, item)) {
          set[item.label] = true
        }
      }
    }
    return set
  }, [pathname])

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu backdrop"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-border/40 bg-surface-elevated transition-transform duration-300 ease-out md:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              Z
            </div>
            <span className="text-lg font-bold text-foreground">Zelvobd</span>
          </Link>
          <button onClick={onClose} className="md:hidden" aria-label="Close menu">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {MENU.map((section) => (
            <div key={section.title} className="mt-4 first:mt-1">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon

                  if (!item.children) {
                    const active = item.exact
                      ? pathname === item.href
                      : !!item.href && isChildActive(pathname, item.href)
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href!}
                          onClick={onClose}
                          className={cx(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                            active
                              ? "bg-secondary text-primary"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          )}
                        >
                          <Icon className={cx("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                          <span className={cx("flex-1", active ? "text-foreground" : "")}>{item.label}</span>
                          {item.badge && (
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  }

                  const groupActive = isGroupActive(pathname, item)
                  const isOpen = openGroups[item.label] ?? initialOpenGroups[item.label] ?? false
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isOpen}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                          groupActive
                            ? "bg-secondary text-primary"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        <Icon className={cx("h-[18px] w-[18px] shrink-0", groupActive ? "text-primary" : "text-muted-foreground")} />
                        <span className={cx("flex-1 text-left", groupActive ? "text-foreground" : "")}>{item.label}</span>
                        <ChevronRight
                          className={cx(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isOpen ? "rotate-90" : "",
                          )}
                        />
                      </button>
                      <div
                        className={cx(
                          "grid transition-all duration-200 ease-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <ul className="ml-4 overflow-hidden border-l border-border/40 pl-2.5">
                          {item.children.map((child) => {
                            const active = isChildActive(pathname, child.href, item.children)
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={cx(
                                    "my-0.5 flex items-center rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                                    active
                                      ? "bg-secondary/80 font-medium text-primary"
                                      : "text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Admin user */}
        <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">Admin</p>
            <p className="truncate text-[11px] text-muted-foreground">admin@gmail.com</p>
          </div>
        </div>
      </aside>
    </>
  )
}
