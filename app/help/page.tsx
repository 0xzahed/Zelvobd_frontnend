"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, MessageCircle, Phone, MessageSquareText } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
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
  const [open, setOpen] = useState<number | null>(null)

  return (
    <AppShell>
      <BackHeader title="Help Center" />
      <div className="mx-auto max-w-md space-y-5 py-4 md:py-6">

        <div className="px-1 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Need assistance? Our support team is always ready to help you.
          </p>
        </div>

        {/* Hero Avatar */}
        <div className="flex flex-col items-center gap-4 px-1">
          <div className="relative h-64 w-64 overflow-hidden rounded-[18px] bg-transparent">
            <Image
              src="/call-icon.png"
              alt="Customer Service"
              fill
              className="object-contain p-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <section className="space-y-3 px-1">
          <Link
            href="/chat"
            className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-border/70 bg-transparent px-3 py-3 text-foreground transition hover:bg-muted/20 active:scale-[0.98]"
          >
            <MessageSquareText className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">Live Chat</span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            {/* Chat (WhatsApp style) */}
            <a
              href="https://wa.me/8801790939394"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white transition hover:opacity-95 active:scale-[0.98]"
            >
              <FaWhatsapp className="h-10 w-10 shrink-0" />
              <span className="text-lg font-semibold">Chat</span>
            </a>
            {/* Call */}
            <a
              href="tel:+8801790939394"
              className="flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-4 py-3 text-white transition hover:opacity-95 active:scale-[0.98]"
            >
              <Phone className="h-8 w-8 shrink-0" />
              <span className="text-lg font-semibold">Call</span>
            </a>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Frequently Asked Questions</h2>
          </div>
          <ul className="space-y-1">
            {faqs.map((f, i) => (
              <li key={i} className="overflow-hidden bg-transparent">
                <button
                  onClick={() => setOpen((v) => (v === i ? null : i))}
                  className="flex w-full items-center justify-between gap-3 rounded-none px-1 py-4 text-left transition-colors hover:bg-muted/20"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-medium text-foreground">{f.q}</span>
                  <ChevronDown
                    className={cx(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
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
                    <p className="px-1 pb-4 text-sm leading-relaxed text-muted-foreground">
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
