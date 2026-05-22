"use client"

import { useEffect, useState } from "react"

type Settings = {
  storeName: string
  supportEmail: string
  currency: string
  freeDeliveryThreshold: number
  deliveryFee: number
  announcement: string
  floatingIconImages: string[]
  floatingIconIntervalSec: number
}

const defaults: Settings = {
  storeName: "EcoMerce",
  supportEmail: "support@ecomerce.app",
  currency: "USD",
  freeDeliveryThreshold: 50,
  deliveryFee: 4.99,
  announcement: "Free delivery for orders over $50",
  floatingIconImages: ["/placeholder-user.jpg", "/demo-product-2.jpg", "/demo-product-3.jpg"],
  floatingIconIntervalSec: 3,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ecomerce_settings")
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) })
    } catch {
      // noop
    }
  }, [])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function save() {
    localStorage.setItem("ecomerce_settings", JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function reset() {
    setSettings(defaults)
    localStorage.removeItem("ecomerce_settings")
  }

  async function addFloatingImages(files: File[]) {
    if (files.length === 0) return
    const results = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result ?? ""))
            reader.onerror = () => resolve("")
            reader.readAsDataURL(file)
          })
      )
    )
    const images = results.filter(Boolean)
    if (images.length === 0) return
    setSettings((prev) => ({
      ...prev,
      floatingIconImages: [...prev.floatingIconImages, ...images],
    }))
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">General store configuration.</p>
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
        <Field label="Store name">
          <input
            value={settings.storeName}
            onChange={(e) => update("storeName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Support email">
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => update("supportEmail", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Currency">
          <select
            value={settings.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="input"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="BDT">BDT (৳)</option>
          </select>
        </Field>
        <Field label="Delivery fee">
          <input
            type="number"
            step="0.01"
            value={settings.deliveryFee}
            onChange={(e) => update("deliveryFee", Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Free delivery threshold">
          <input
            type="number"
            step="0.01"
            value={settings.freeDeliveryThreshold}
            onChange={(e) => update("freeDeliveryThreshold", Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Announcement banner" full>
          <input
            value={settings.announcement}
            onChange={(e) => update("announcement", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Floating icon images" full>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? [])
                void addFloatingImages(files)
                e.currentTarget.value = ""
              }}
              className="input"
            />
            {settings.floatingIconImages.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {settings.floatingIconImages.map((src, index) => (
                  <div key={`${src}-${index}`} className="relative h-14 w-14">
                    <img
                      src={src}
                      alt={`Floating icon ${index + 1}`}
                      className="h-14 w-14 rounded-full border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          floatingIconImages: prev.floatingIconImages.filter((_, i) => i !== index),
                        }))
                      }
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-xs font-semibold text-white"
                      aria-label="Remove image"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No images added yet.</p>
            )}
          </div>
        </Field>

        <Field label="Floating icon change interval (seconds)" full>
          <input
            type="number"
            min={1}
            step={0.5}
            value={settings.floatingIconIntervalSec}
            onChange={(e) => update("floatingIconIntervalSec", Number(e.target.value) || 1)}
            className="input"
          />
        </Field>
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
