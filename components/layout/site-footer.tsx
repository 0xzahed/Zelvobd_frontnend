"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { getFooterPublic } from "@/src/api/footerApi"
type FooterNavLink = { label: string; href: string }
type FooterNavGroup = { title: string; links: FooterNavLink[] }
type FooterSocial = { label: string; href: string; icon?: string }

type FooterSettings = {
  brandName: string
  brandTagline: string
  logoUrl?: string
  supportEmail: string
  supportPhone: string
  supportAddress: string
  navGroups: FooterNavGroup[]
  socials: FooterSocial[]
}

const STORAGE_KEY = "zelvobd_footer"

const DEFAULT_FOOTER: FooterSettings = {
  brandName: "ZELVO BD",
  brandTagline: "All Types of Home & Kitchen Appliances Available",
  logoUrl: "/logo.png",
  supportEmail: "support@zelvobd.com",
  supportPhone: "+8801994040246",
  supportAddress: "136/137, Mudi Market, 2nd Floor, Kachabazar, Dhaka New Market, Dhaka - 1205",
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
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ],
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/share/17t5znWx2J", icon: "facebook" },
    { label: "Instagram", href: "https://www.instagram.com/zelvobd/", icon: "instagram" },
    { label: "Twitter", href: "https://twitter.com/zelvobd", icon: "twitter" },
    { label: "YouTube", href: "https://www.youtube.com/@zelvobd", icon: "youtube" },
  ],
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
}

function mergeFooter(base: FooterSettings, patch: Partial<FooterSettings>) {
  const logoUrl = patch.logoUrl && patch.logoUrl.trim() !== "" ? patch.logoUrl : base.logoUrl
  return {
    ...base,
    ...patch,
    logoUrl,
    navGroups: Array.isArray(patch.navGroups) ? patch.navGroups : base.navGroups,
    socials: Array.isArray(patch.socials) ? patch.socials : base.socials,
  }
}

export function SiteFooter() {
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER)

  useEffect(() => {
    getFooterPublic()
      .then((data) => setFooter(mergeFooter(DEFAULT_FOOTER, data as Partial<FooterSettings>)))
      .catch(() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) return
          const parsed = JSON.parse(raw) as Partial<FooterSettings>
          setFooter(mergeFooter(DEFAULT_FOOTER, parsed))
        } catch {
          // noop
        }
      })
  }, [])

  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center p-1 bg-white rounded-full w-fit">
              <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt={footer.brandName}
                width={120}
                height={32}
                className="h-10 w-auto object-contain"
              />
            </Link>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              {footer.brandTagline}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>{footer.supportEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{footer.supportPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
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
                        className="text-sm text-slate-400 transition hover:text-primary"
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
                const NamedIcon = icon && socialIcons[icon] ? socialIcons[icon] : null
                const isUrlIcon = icon && /^https?:\/\//i.test(icon)
                const fallback = label?.trim()?.[0] ?? "S"
                return (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-primary hover:text-primary"
                  >
                    {NamedIcon ? (
                      <NamedIcon className="h-4 w-4" />
                    ) : isUrlIcon ? (
                      <Image src={icon!} alt={label} width={36} height={36} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <span className="text-xs font-semibold">{fallback}</span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800">
          <p className="mt-4 text-center text-xs tracking-wide text-slate-500">
            © {new Date().getFullYear()} — <a href="https://motionbooster.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">MotionBooster</a>. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center">
            <a
              href="https://www.motionbooster.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-300"
            >
              <span>Developed By Motionbooster</span>
              <Image
                src="/mb/Motion Booster White Logo-footer.svg"
                alt="Motionbooster"
                width={80}
                height={20}
                className="h-4 w-auto object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
