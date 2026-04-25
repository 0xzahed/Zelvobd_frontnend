"use client"

import { useState } from "react"
import { ChevronDown, Mail, MessageCircle, Phone, Search } from "lucide-react"
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
    a: "Open the Notifications page — we send you tracking updates at every step. You can also contact support for real-time help.",
  },
  {
    q: "What is your return policy?",
    a: "Most products can be returned within 7 days of delivery, unused and in original packaging. Some items (like innerwear and cosmetics) are non-returnable for hygiene reasons.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, COD is available for orders under ৳30,000 in most areas. You can also pay via bKash, Nagad, or card.",
  },
  {
    q: "How do I apply a promo code?",
    a: "Add items to your cart, open Cart, and enter your promo code in the ticket field. Tap the arrow to apply.",
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <AppShell>
      <BackHeader title="Help Center" />
      <div className="space-y-5 py-4 md:py-6">
        <div className="flex h-11 items-center gap-2 rounded-full bg-card px-4 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search help articles..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <section className="grid grid-cols-3 gap-3">
          <QuickAction icon={MessageCircle} label="Live Chat" />
          <QuickAction icon={Phone} label="Call Us" />
          <QuickAction icon={Mail} label="Email" />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground md:text-xl">Frequently Asked</h2>
          <ul className="space-y-2">
            {faqs.map((f, i) => (
              <li key={i} className="overflow-hidden rounded-2xl bg-card shadow-card">
                <button
                  onClick={() => setOpen((v) => (v === i ? null : i))}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={cx(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      open === i && "rotate-180",
                    )}
                  />
                </button>
                {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  )
}

function QuickAction({ icon: Icon, label }: { icon: typeof Search; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-[#EEF0FB] text-[#3B6CF4]">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  )
}
