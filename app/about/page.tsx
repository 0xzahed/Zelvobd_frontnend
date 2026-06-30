"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { Store, Truck, Headset, ShieldCheck } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Store,
      title: "Wide Product Range",
      desc: "From electronics to fashion, we offer a curated selection of quality products at competitive prices.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "We deliver across Bangladesh within 24 hours to 3 days, ensuring your orders reach you quickly.",
    },
    {
      icon: Headset,
      title: "Dedicated Support",
      desc: "Our friendly support team is always ready to help you with any questions or concerns.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      desc: "Shop with confidence. We ensure secure payments and authentic products on every order.",
    },
  ]

  return (
    <AppShell>
      <BackHeader title="About Us" />

      <div className="mx-auto max-w-md space-y-6 py-2 pb-8">
        {/* Hero */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Zelvobd</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your trusted online shopping destination in Bangladesh. We are committed to bringing you the best products with a seamless shopping experience.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-card p-4 text-center transition hover:shadow-sm"
            >
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">Our Mission</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            To make online shopping accessible, reliable, and enjoyable for everyone in Bangladesh. We strive to connect customers with quality products while providing exceptional service every step of the way.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">Why Choose Us?</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Authentic products from trusted brands</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Competitive prices with regular offers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Easy returns and refunds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Cash on delivery available</span>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
