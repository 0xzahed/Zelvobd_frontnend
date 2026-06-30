"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Info,
  Mail,
  Shield,
  FileText,
  MessageCircleQuestion,
  ChevronDown,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { useCategories } from "@/lib/use-store-data"

export default function MorePage() {
  const { categories, loaded } = useCategories()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const menu = [
    { icon: Info, label: "About Us", href: "/about" },
    { icon: Mail, label: "Contact Us", href: "/contact" },
    { icon: MessageCircleQuestion, label: "FAQ", href: "/faq" },
    { icon: Shield, label: "Privacy Policy", href: "/privacy" },
    { icon: FileText, label: "Terms & Conditions", href: "/terms" },
  ]

  const toggleCategory = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <AppShell>
      <div className="space-y-5 py-4 md:py-6">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">More</h1>

        {/* Categories */}
        {loaded && categories.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {categories.map((cat) => {
              const isExpanded = expandedId === cat.id
              return (
                <div key={cat.id} className="border-b border-border/60 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-secondary/50"
                  >
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {/* Sub-categories */}
                  {isExpanded && cat.subCategories.length > 0 && (
                    <div className="space-y-0.5 px-4 pb-3">
                      {cat.subCategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition hover:bg-secondary/50"
                        >
                          <span className="flex-1 text-sm text-muted-foreground">
                            {sub.name}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Menu */}
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

        <p className="text-center text-[11px] text-muted-foreground">Zelvobd v1.0.0</p>
      </div>
    </AppShell>
  )
}
