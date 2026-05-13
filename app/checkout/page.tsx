"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Link2 } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/lib/use-store-data"
import { TickLottie } from "./success/tick-lottie"

const BD_API_BASE = "https://bdapi.vercel.app/api/v.1"

type District = { id: string; district: string }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { products } = useProducts()
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderCode, setOrderCode] = useState("")
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    union: "",
    notes: "",
  })
  const [districts, setDistricts] = useState<District[]>([])
  const [unions, setUnions] = useState<string[]>([])
  const [districtLoading, setDistrictLoading] = useState(false)
  const [unionLoading, setUnionLoading] = useState(false)

  const enriched = items
    .map((item) => {
      const p = products.find((prod) => prod.id === item.productId)
      return p ? { ...item, product: p } : null
    })
    .filter(Boolean)

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectedDistrict = districts.find((d) => d.district === form.district)

  const onCheckout = () => {
    if (!form.name || !form.phone || !form.address || !form.district) {
      alert("Please fill in all required fields (Name, Phone, Address, District)")
      return
    }

    const code = "EC" + Math.floor(Math.random() * 100000000).toString().padStart(8, "0")
    
    // Save to localStorage for demo purposes
    const subtotal = enriched.reduce((s, i: any) => s + i.product.price * i.quantity, 0)
    const total = subtotal + 15
    const newOrder = {
      code,
      status: "Pending",
      amount: total,
      phone: form.phone,
      createdAt: new Date().toISOString(),
    }
    const existingRaw = typeof window !== "undefined" ? localStorage.getItem("customer_orders") : null
    const existing = existingRaw ? JSON.parse(existingRaw) : []
    if (typeof window !== "undefined") {
      localStorage.setItem("customer_orders", JSON.stringify([newOrder, ...existing]))
    }

    setOrderCode(code)
    setIsSuccess(true)
    clearCart()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    let cancelled = false
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true)
        const res = await fetch(`${BD_API_BASE}/district`)
        const json = await res.json()
        const rows = Array.isArray(json?.data) ? json.data : []
        const list: District[] = rows
          .filter((item: { id?: string; name?: string }) => item?.id && item?.name)
          .map((item: { id: string; name: string }) => ({ id: item.id, district: item.name }))
          .sort((a, b) => a.district.localeCompare(b.district))
        if (!cancelled) setDistricts(list)
      } catch {
        if (!cancelled) setDistricts([])
      } finally {
        if (!cancelled) setDistrictLoading(false)
      }
    }
    void loadDistricts()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadUnions = async () => {
      if (!selectedDistrict) {
        setUnions([])
        return
      }
      try {
        setUnionLoading(true)
        const upRes = await fetch(`${BD_API_BASE}/upazilla/${encodeURIComponent(selectedDistrict.id)}`)
        const upJson = await upRes.json()
        const upazillas: { id: string }[] = Array.isArray(upJson?.data) ? upJson.data : []
        const results = await Promise.all(
          upazillas.map((u) =>
            fetch(`${BD_API_BASE}/union/${encodeURIComponent(u.id)}`)
              .then((r) => r.json())
              .then((j) => (Array.isArray(j?.data) ? j.data : []))
              .catch(() => [])
          )
        )
        const list: string[] = results
          .flat()
          .map((item: { name?: string }) => item?.name)
          .filter((v): v is string => Boolean(v))
          .sort((a, b) => a.localeCompare(b))
        if (!cancelled) setUnions(list)
      } catch {
        if (!cancelled) setUnions([])
      } finally {
        if (!cancelled) setUnionLoading(false)
      }
    }
    void loadUnions()
    return () => {
      cancelled = true
    }
  }, [selectedDistrict])

  if (isSuccess) {
    const orderLink = typeof window !== "undefined" ? `${window.location.origin}/orders?code=${orderCode}` : ""

    return (
      <AppShell>
        <div className="mx-auto flex min-h-[calc(100dvh-140px)] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
          {/* Animated success tick */}
          <div className="relative grid h-24 w-24 place-items-center rounded-full bg-success">
            <TickLottie />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground md:text-2xl">অর্ডার সফল হয়েছে!</h1>
            <p className="text-sm text-muted-foreground">
              আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
            </p>
          </div>

          <div className="w-full rounded-[6px] border border-border/30 bg-card p-5">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Link2 className="h-4 w-4" />
              Order Link
            </div>
            <div className="mt-3 overflow-hidden rounded-[6px] bg-muted/50 p-3">
              <a
                href={orderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-xs font-medium text-primary hover:underline"
              >
                {orderLink}
              </a>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Click the link to track your order
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="block w-full rounded-[6px] bg-primary py-3.5 text-center text-sm font-semibold text-white"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="py-4 md:py-8">
        <div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center text-base font-semibold text-foreground md:text-lg">
            Checkout
          </h1>
          <div />
        </div>

        {enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-10 text-center">
            <h2 className="text-base font-semibold text-foreground">Your cart is empty</h2>
            <Link
              href="/"
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="space-y-6">
              <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 md:p-6">
                <h3 className="text-base font-semibold text-foreground">Information</h3>
                <div className="grid gap-4">
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Full Name"
                    className="h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="Phone Number"
                    className="h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    placeholder="Address"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select
                      value={form.district}
                      onChange={(e) => {
                        const district = e.target.value
                        setForm((prev) => ({ ...prev, district, union: "" }))
                      }}
                      className="h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">
                        {districtLoading ? "Loading districts..." : "Select District"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.district}>
                          {d.district}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.union}
                      onChange={(e) => updateForm("union", e.target.value)}
                      disabled={!form.district || unionLoading}
                      className="h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:ring-1 focus:ring-primary"
                    >
                      <option value="">
                        {!form.district
                          ? "Select District First"
                          : unionLoading
                            ? "Loading unions..."
                            : "Select Union"}
                      </option>
                      {unions.map((union) => (
                        <option key={union} value={union}>
                          {union}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    placeholder="Order Notes (optional)"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="block w-full rounded-full bg-primary py-4 text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
