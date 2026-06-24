"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

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

const STORAGE_KEY = "zelvobd_footer"

const DEFAULT_FOOTER: FooterSettings = {
  brandName: "Zelvobd",
  brandTagline: "Everyday essentials and the latest tech, delivered fast with care.",
  supportEmail: "support@zelvobd.app",
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

const ICON_OPTIONS: Array<FooterSocial["icon"]> = ["", "facebook", "instagram", "twitter", "youtube"]

function mergeFooter(base: FooterSettings, patch: Partial<FooterSettings>) {
  return {
    ...base,
    ...patch,
    navGroups: Array.isArray(patch.navGroups) ? patch.navGroups : base.navGroups,
    socials: Array.isArray(patch.socials) ? patch.socials : base.socials,
  }
}

export default function AdminFooterPage() {
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER)
  const [saved, setSaved] = useState(false)

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

  function update<K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) {
    setFooter((prev) => ({ ...prev, [key]: value }))
  }

  function updateGroupTitle(groupIndex: number, value: string) {
    setFooter((prev) => {
      const navGroups = [...prev.navGroups]
      navGroups[groupIndex] = { ...navGroups[groupIndex], title: value }
      return { ...prev, navGroups }
    })
  }

  function updateGroupLink(groupIndex: number, linkIndex: number, field: keyof FooterNavLink, value: string) {
    setFooter((prev) => {
      const navGroups = [...prev.navGroups]
      const links = [...navGroups[groupIndex].links]
      links[linkIndex] = { ...links[linkIndex], [field]: value }
      navGroups[groupIndex] = { ...navGroups[groupIndex], links }
      return { ...prev, navGroups }
    })
  }

  function addGroup() {
    setFooter((prev) => ({
      ...prev,
      navGroups: [...prev.navGroups, { title: "New Group", links: [{ label: "New link", href: "#" }] }],
    }))
  }

  function removeGroup(groupIndex: number) {
    setFooter((prev) => ({
      ...prev,
      navGroups: prev.navGroups.filter((_, index) => index !== groupIndex),
    }))
  }

  function addLink(groupIndex: number) {
    setFooter((prev) => {
      const navGroups = [...prev.navGroups]
      const links = [...navGroups[groupIndex].links, { label: "New link", href: "#" }]
      navGroups[groupIndex] = { ...navGroups[groupIndex], links }
      return { ...prev, navGroups }
    })
  }

  function removeLink(groupIndex: number, linkIndex: number) {
    setFooter((prev) => {
      const navGroups = [...prev.navGroups]
      const links = navGroups[groupIndex].links.filter((_, index) => index !== linkIndex)
      navGroups[groupIndex] = { ...navGroups[groupIndex], links }
      return { ...prev, navGroups }
    })
  }

  function updateSocial(index: number, field: keyof FooterSocial, value: string) {
    setFooter((prev) => {
      const socials = [...prev.socials]
      socials[index] = { ...socials[index], [field]: value } as FooterSocial
      return { ...prev, socials }
    })
  }

  function addSocial() {
    setFooter((prev) => ({
      ...prev,
      socials: [...prev.socials, { label: "New social", href: "#", icon: "facebook" }],
    }))
  }

  function removeSocial(index: number) {
    setFooter((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }))
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(footer))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function reset() {
    setFooter(DEFAULT_FOOTER)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Footer</h1>
          <p className="text-sm text-muted-foreground">Edit footer content (frontend-only).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="h-11 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground"
          >
            Reset
          </button>
          <button
            onClick={save}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card"
          >
            {saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </header>

      <section className="grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card md:grid-cols-2">
        <Field label="Brand name">
          <input value={footer.brandName} onChange={(e) => update("brandName", e.target.value)} className="input" />
        </Field>
        <Field label="Tagline" full>
          <input value={footer.brandTagline} onChange={(e) => update("brandTagline", e.target.value)} className="input" />
        </Field>
        <Field label="Support email">
          <input value={footer.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} className="input" />
        </Field>
        <Field label="Support phone">
          <input value={footer.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} className="input" />
        </Field>
        <Field label="Support address" full>
          <input value={footer.supportAddress} onChange={(e) => update("supportAddress", e.target.value)} className="input" />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Navigation groups</h2>
            <p className="text-sm text-muted-foreground">Edit footer link columns.</p>
          </div>
          <button
            onClick={addGroup}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add group
          </button>
        </div>

        <div className="space-y-5">
          {footer.navGroups.map((group, groupIndex) => (
            <div key={`${group.title}-${groupIndex}`} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  value={group.title}
                  onChange={(e) => updateGroupTitle(groupIndex, e.target.value)}
                  className="input flex-1"
                />
                <button
                  onClick={() => removeGroup(groupIndex)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {group.links.map((link, linkIndex) => (
                  <div key={`${groupIndex}-${linkIndex}`} className="flex flex-wrap gap-2">
                    <input
                      value={link.label}
                      onChange={(e) => updateGroupLink(groupIndex, linkIndex, "label", e.target.value)}
                      className="input flex-1"
                      placeholder="Label"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateGroupLink(groupIndex, linkIndex, "href", e.target.value)}
                      className="input flex-1"
                      placeholder="/path"
                    />
                    <button
                      onClick={() => removeLink(groupIndex, linkIndex)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addLink(groupIndex)}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <Plus className="h-4 w-4" /> Add link
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Social links</h2>
            <p className="text-sm text-muted-foreground">Manage footer social icons.</p>
          </div>
          <button
            onClick={addSocial}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add social
          </button>
        </div>

        <div className="space-y-3">
          {footer.socials.map((social, index) => (
            <div key={`${social.label}-${index}`} className="flex flex-wrap gap-2">
              <input
                value={social.label}
                onChange={(e) => updateSocial(index, "label", e.target.value)}
                className="input flex-1"
                placeholder="Label"
              />
              <input
                value={social.href}
                onChange={(e) => updateSocial(index, "href", e.target.value)}
                className="input flex-1"
                placeholder="https://..."
              />
              <select
                value={social.icon}
                onChange={(e) => updateSocial(index, "icon", e.target.value)}
                className="input w-40"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon || "none"} value={icon}>
                    {icon || "none"}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeSocial(index)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        :global(.input) {
          height: 2.75rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0 0.875rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  )
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
