"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"
import { formatBDT } from "@/lib/format"
import { useProducts } from "@/lib/use-store-data"

export default function CheckoutPage() {
  const router = useRouter()
  const { items } = useCart()
  const { products } = useProducts()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", deliveryAddress: "", notes: "" })

  const { subtotal, total } = useMemo(() => {
    const enriched = items.map((i) => products.find((p) => p.id === i.productId)).filter(Boolean) as Product[]
    const amounts = items.map((i, idx) => (enriched[idx] ? enriched[idx].price * i.quantity : 0))
    const s = amounts.reduce((a, b) => a + b, 0)
    return { subtotal: s, total: s + (s === 0 ? 0 : 15) }
  }, [items, products])

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); if (submitting || done) return; setSubmitting(true); setTimeout(() => { setSubmitting(false); setDone(true); const trackCode = generateTrackingCode(); setTimeout(() => router.push(`/checkout/success?code=${encodeURIComponent(trackCode)}&phone=${encodeURIComponent(form.phone)}`), 900) }, 900) }

  return <AppShell><div className="py-4 md:py-8"><div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center"><button onClick={() => router.back()} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-card"><ArrowLeft className="h-4 w-4" /></button><h1 className="text-center text-base font-semibold text-foreground md:text-lg">Checkout</h1><span /></div><form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_360px]"><div className="space-y-4"><Section title="Contact"><TextInput label="Full Name" value={form.name} onChange={(v) => update("name", v)} required /><TextInput label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} required type="tel" placeholder="+880 1XXXXXXXXX" /><TextInput label="Email (optional)" value={form.email} onChange={(v) => update("email", v)} type="email" /></Section><Section title="Delivery"><TextArea label="Address" value={form.address} onChange={(v) => update("address", v)} required placeholder="House, road, area" /><TextArea label="Delivery Address" value={form.deliveryAddress} onChange={(v) => update("deliveryAddress", v)} required placeholder="City, district, postal code" /><TextArea label="Order Notes (optional)" value={form.notes} onChange={(v) => update("notes", v)} placeholder="Any special instructions?" /></Section></div><aside className="space-y-4 md:sticky md:top-20 md:self-start"><div className="space-y-3 rounded-2xl bg-card p-4"><h3 className="text-sm font-semibold text-foreground">Order Summary</h3><div className="flex justify-between text-sm"><span className="text-muted-foreground">Sub Total</span><span className="font-medium text-foreground">{formatBDT(subtotal)}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping &amp; Tax</span><span className="font-medium text-foreground">{formatBDT(subtotal === 0 ? 0 : 15)}</span></div><div className="flex justify-between border-t border-border/60 pt-3"><span className="text-base font-semibold text-foreground">Total</span><span className="text-base font-bold text-foreground">{formatBDT(total)}</span></div></div><button type="submit" disabled={submitting || done || items.length === 0} className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-[#306FD7] text-sm font-semibold text-white disabled:opacity-60">{done ? <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#306FD7]"><Check className="h-4 w-4" strokeWidth={3} /></span>Submitted</span> : submitting ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Placing order...</span> : "Submit Order"}</button></aside></form></div></AppShell>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-3 rounded-2xl bg-card p-4"><h3 className="text-sm font-semibold text-foreground">{title}</h3><div className="space-y-3">{children}</div></section> }
function TextInput({ label, value, onChange, required, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string }) { return <label className="block text-sm"><span className="mb-1 block text-xs font-medium text-foreground">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} required={required} type={type} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#306FD7]" /></label> }
function TextArea({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) { return <label className="block text-sm"><span className="mb-1 block text-xs font-medium text-foreground">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#306FD7]" /></label> }
function generateTrackingCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = "EC"; for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s }
