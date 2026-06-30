"use client"

import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react"

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+880 19940-40246",
      href: "tel:+8801994040246",
    },
    {
      icon: MessageCircle,
      label: "Facebook",
      value: "Message us on Facebook",
      href: "https://www.facebook.com/share/17t5znWx2J/",
      external: true,
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Bangladesh",
      href: null,
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Everyday: 10:00 AM - 10:00 PM",
      href: null,
    },
  ]

  return (
    <AppShell>
      <BackHeader title="Contact Us" />

      <div className="mx-auto max-w-md space-y-6 py-2 pb-8">
        {/* Intro */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Have questions or need help? Reach out to us anytime. We are here to assist you with your orders and inquiries.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-3">
          {contactInfo.map(({ icon: Icon, label, value, href, external }) => {
            const content = (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                </div>
              </div>
            )

            if (href) {
              return (
                <Link
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  {content}
                </Link>
              )
            }

            return <div key={label}>{content}</div>
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://wa.me/8801994040246"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <a
            href="tel:+8801994040246"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(45deg,#052F84,#7BA4F7)] py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </div>
    </AppShell>
  )
}
