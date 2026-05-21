"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

type FooterNavLink = { label: string; href: string }
type FooterNavGroup = { title: string; links: FooterNavLink[] }
type FooterSocial = { label: string; href: string; icon?: "facebook" | "instagram" | "twitter" | "youtube" | "" }

type FooterSettings = {
  brandName: string
  brandTagline: string
  supportEmail: string
  supportPhone: string
  supportAddress: string
  navGroups: FooterNavGroup[]
  socials: FooterSocial[]
}

const STORAGE_KEY = "ecomerce_footer"

const DEFAULT_FOOTER: FooterSettings = {
  brandName: "EcoMerce",
  brandTagline: "Everyday essentials and the latest tech, delivered fast with care.",
  supportEmail: "support@ecomerce.app",
  supportPhone: "+880 1700 000 000",
  supportAddress: "Dhaka, Bangladesh",
  navGroups: [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/search" },
        { label: "Categories", href: "/categories" },
        { label: "Offers", href: "/offers" },
        { label: "Flash Sale", href: "/offers" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Help & Support", href: "/support" },
        { label: "More", href: "/more" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ],
  socials: [
    { label: "Facebook", href: "#", icon: "facebook" },
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "Twitter", href: "#", icon: "twitter" },
    { label: "YouTube", href: "#", icon: "youtube" },
  ],
}

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
}

function mergeFooter(base: FooterSettings, patch: Partial<FooterSettings>) {
  return {
    ...base,
    ...patch,
    navGroups: Array.isArray(patch.navGroups) ? patch.navGroups : base.navGroups,
    socials: Array.isArray(patch.socials) ? patch.socials : base.socials,
  }
}

export function SiteFooter() {
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<FooterSettings>
      setFooter(mergeFooter(DEFAULT_FOOTER, parsed))
    } catch {
      // noop
    }
  }, [])

  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo1.png"
                alt={footer.brandName}
                width={150}
                height={50}
                className="h-auto w-auto max-w-[150px] object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              {footer.brandTagline}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-300" />
                <span>{footer.supportEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-300" />
                <span>{footer.supportPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-300" />
                <span>{footer.supportAddress}</span>
              </li>
            </ul>
          </div>

          {/* Nav groups */}
          <div className="grid grid-cols-2 gap-6 md:col-span-6 md:grid-cols-3">
            {footer.navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-semibold text-slate-100">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-slate-400 transition hover:text-amber-300"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Socials */}
          <div className="md:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Follow us</h3>
            <div className="flex gap-2">
              {footer.socials.map(({ label, href, icon }) => {
                const Icon = icon ? socialIcons[icon] : null
                const fallback = label?.trim()?.[0] ?? "S"
                return (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-amber-300 hover:text-amber-300"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs font-semibold">{fallback}</span>}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2" aria-label={`${footer.brandName} home`}>
              <Image
                src="/logo1.png"
                alt={footer.brandName}
                width={110}
                height={36}
                className="h-auto w-auto max-w-[110px] object-contain brightness-0 invert"
              />
            </Link>
          </div>

          <p className="mt-4 text-center text-xs tracking-wide text-slate-500">
            © {new Date().getFullYear()} — {footer.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
