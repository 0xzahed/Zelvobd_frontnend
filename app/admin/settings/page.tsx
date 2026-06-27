"use client"

import { useEffect, useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import {
  AdminField,
  AdminInput,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
} from "@/components/admin/admin-ui"

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
  storeName: "Zelvobd",
  supportEmail: "support@zelvobd.app",
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
      const raw = localStorage.getItem("zelvobd_settings")
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) })
    } catch {
      // noop
    }
  }, [])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function save() {
    localStorage.setItem("zelvobd_settings", JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function reset() {
    setSettings(defaults)
    localStorage.removeItem("zelvobd_settings")
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
    <AdminPage>
      <AdminPageHeader
        title="Settings"
        description="General store configuration"
        actions={
          <>
            <AdminSecondaryButton onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </AdminSecondaryButton>
            <AdminPrimaryButton onClick={save}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save changes"}
            </AdminPrimaryButton>
          </>
        }
      />

      <AdminPanel className="grid gap-5 p-6 md:grid-cols-2">
        <AdminField label="Store name">
          <AdminInput
            value={settings.storeName}
            onChange={(e) => update("storeName", e.target.value)}
          />
        </AdminField>
        <AdminField label="Support email">
          <AdminInput
            type="email"
            value={settings.supportEmail}
            onChange={(e) => update("supportEmail", e.target.value)}
          />
        </AdminField>
        <AdminField label="Currency">
          <select
            value={settings.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="admin-input h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="BDT">BDT (৳)</option>
          </select>
        </AdminField>
        <AdminField label="Delivery fee">
          <AdminInput
            type="number"
            step="0.01"
            value={settings.deliveryFee}
            onChange={(e) => update("deliveryFee", Number(e.target.value))}
          />
        </AdminField>
        <AdminField label="Free delivery threshold">
          <AdminInput
            type="number"
            step="0.01"
            value={settings.freeDeliveryThreshold}
            onChange={(e) => update("freeDeliveryThreshold", Number(e.target.value))}
          />
        </AdminField>
        <AdminField label="Announcement banner" full>
          <AdminInput
            value={settings.announcement}
            onChange={(e) => update("announcement", e.target.value)}
          />
        </AdminField>

        <AdminField label="Floating icon images" full>
          <div className="space-y-3">
            <AdminInput
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? [])
                void addFloatingImages(files)
                e.currentTarget.value = ""
              }}
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
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No images added yet.</p>
            )}
          </div>
        </AdminField>

        <AdminField label="Floating icon change interval (seconds)" full>
          <AdminInput
            type="number"
            min={1}
            step={0.5}
            value={settings.floatingIconIntervalSec}
            onChange={(e) => update("floatingIconIntervalSec", Number(e.target.value) || 1)}
          />
        </AdminField>
      </AdminPanel>
    </AdminPage>
  )
}
