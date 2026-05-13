"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, MessageCircle } from "lucide-react"
import Image from "next/image"
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
    a: "Open the Track Your Order page — enter your order link or code in the track field for real-time updates.",
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
      <div className="mx-auto max-w-md space-y-5 py-4 md:py-6">

        {/* Hero Avatar */}
        <div className="flex flex-col items-center gap-3 px-1">
          <div className="relative h-32 w-32 overflow-hidden rounded-[8px] border border-border/20">
            <Image
              src="/call-icon.png"
              alt="Customer Service"
              fill
              className="object-contain p-4"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Need help? We are here for you 24/7
          </p>
        </div>

        {/* Action Buttons */}
        <section className="space-y-3 px-1">
          <div className="grid grid-cols-2 gap-3">
            {/* Chat (WhatsApp style) */}
            <a href="https://wa.me/8801790939394" target="_blank" rel="noopener noreferrer" className="contents">
              <button className="flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-[#25D366] transition active:scale-[0.98]">
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Chat</span>
              </button>
            </a>
            {/* Messenger */}
            <Link href="/chat" className="contents">
              <button className="flex items-center justify-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-blue-500 transition active:scale-[0.98]">
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Messenger</span>
              </button>
            </Link>
          </div>
          {/* Call - full width red pill */}
          <a href="tel:+8801790939394" className="contents">
            <button className="block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]">
              Call
            </button>
          </a>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Frequently Asked Questions</h2>
          </div>
          <ul className="space-y-2.5">
            {faqs.map((f, i) => (
              <li key={i} className="overflow-hidden rounded-[6px] border border-border/30 bg-card shadow-sm">
                <button
                  onClick={() => setOpen((v) => (v === i ? null : i))}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-medium text-foreground">{f.q}</span>
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

