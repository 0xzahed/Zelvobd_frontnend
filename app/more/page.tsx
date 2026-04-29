"use client"

import Link from "next/link"
import { ChevronRight, HelpCircle, Package } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"

export default function MorePage() {
  const menu = [
    { icon: Package, label: "My Orders", href: "/orders" },
    { icon: HelpCircle, label: "Help & Support", href: "/help" },
  ]

  return (
    <AppShell>
      <div className="space-y-5 py-4 md:py-6">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">More</h1>

        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {menu.map(({ icon: Icon, label, href }) => (
            <li key={label} className="border-b border-border/60 last:border-b-0">
              <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-center text-[11px] text-muted-foreground">EcoMerce v1.0.0</p>
      </div>
    </AppShell>
  )
}
