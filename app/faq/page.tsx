"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"

export default function FAQPage() {
  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse products, add items to your cart, and proceed to checkout. Fill in your delivery details and confirm your order. Our team will contact you shortly.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Cash on Delivery (COD) and online payment options including bKash, Nagad, and card payments.",
    },
    {
      q: "How long does delivery take?",
      a: "Delivery usually takes 24 hours to 3 days depending on your location in Bangladesh.",
    },
    {
      q: "Can I return a product?",
      a: "Yes, we have an easy return policy. If you receive a damaged or wrong product, contact us within 48 hours for a replacement or refund.",
    },
    {
      q: "How do I track my order?",
      a: "Once your order is confirmed, our team will contact you with updates. You can also reach out to us via phone or Facebook for order status.",
    },
    {
      q: "Do you deliver outside Bangladesh?",
      a: "Currently, we only deliver within Bangladesh. We hope to expand internationally in the future.",
    },
  ]

  return (
    <AppShell>
      <BackHeader title="FAQ" />

      <div className="mx-auto max-w-md space-y-4 py-2 pb-8">
        <p className="text-sm text-muted-foreground">
          Find answers to commonly asked questions below.
        </p>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {i + 1}. {q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
