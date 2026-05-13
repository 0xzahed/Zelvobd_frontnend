"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, MessageCircle, MessagesSquare, Phone } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { cx } from "@/lib/format"

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched same-day if placed before 4 PM. Inside Dhaka: 1–2 days. Outside Dhaka: 2–4 days.",
  },
  {
    q: "When is shipping free?",
    a: "We offer free shipping on every order above ৳500, across all 64 districts in Bangladesh.",
  },
  {
    q: "How do I track my order?",
    a: "Open the My Orders page — enter your order link or code in the track field for real-time updates.",
  },
  {
    q: "What is your return policy?",
    a: "Most products can be returned within 7 days of delivery, unused and in original packaging.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, COD is available for orders in most areas. You can also pay via bKash, Nagad, or card.",
  },
  {
    q: "How do I apply a promo code?",
    a: "Add items to your cart, and enter your promo code in the ticket field on the Cart page.",
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <AppShell>
      <BackHeader title="Help Center" />
      <div className="space-y-6 py-4 md:py-8">
        <section className="grid grid-cols-3 gap-3 px-1">
          <Link href="/chat" className="contents">
            <QuickAction icon={MessageCircle} label="Live Chat" />
          </Link>
          <QuickAction icon={MessagesSquare} label="WhatsApp" />
          <QuickAction icon={Phone} label="Call Us" />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-foreground md:text-xl">Frequently Asked Questions</h2>
          </div>
          <ul className="space-y-2.5">
            {faqs.map((f, i) => (
              <li key={i} className="overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm">
                <button
                  onClick={() => setOpen((v) => (v === i ? null : i))}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={cx(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      open === i && "rotate-180",
                    )}
                  />
                </button>
                <div 
                  className={cx(
                    "grid transition-all duration-300 ease-in-out",
                    open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  )
}

function QuickAction({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-primary/[0.02]">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-bold text-foreground">{label}</span>
    </button>
  )
}
