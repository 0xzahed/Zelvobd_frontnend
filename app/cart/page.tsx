"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Minus, Pencil, Plus, ShoppingBag, Ticket, Trash2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { AppShell } from "@/components/layout/app-shell"
import { useCart } from "@/contexts/cart-context"
import { formatBDT } from "@/lib/format"
import { useProducts } from "@/lib/use-store-data"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const { products } = useProducts()

  const enriched = items.map((item) => {
    const p = products.find((prod) => prod.id === item.productId)
    return p ? { ...item, product: p } : null
  }).filter(Boolean) as Array<{ productId: string; quantity: number; color?: string; storage?: string; product: Product }>

  const subtotal = enriched.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shippingTax = subtotal === 0 ? 0 : 15
  const total = subtotal + shippingTax

  return <AppShell><div className="py-4 md:py-8"><div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center"><button onClick={() => router.back()} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-card"><ArrowLeft className="h-4 w-4" /></button><h1 className="text-center text-base font-semibold text-foreground md:text-lg">Cart</h1><button onClick={clearCart} aria-label="Delete all" className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground"><Trash2 className="h-4 w-4" /></button></div>{enriched.length===0?<div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-10 text-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#EEF0FB] text-[#3B6CF4]"><ShoppingBag className="h-7 w-7" /></div><h2 className="text-base font-semibold text-foreground">Your cart is empty</h2><p className="text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p><Link href="/" className="mt-2 rounded-full bg-[#3B6CF4] px-5 py-2.5 text-sm font-semibold text-white">Continue Shopping</Link></div>:<div className="grid gap-6 md:grid-cols-[1fr_380px]"><ul className="space-y-3">{enriched.map((item)=>{const p=item.product;const imgQuery=encodeURIComponent(`${p.name} product photo`);return <li key={`${p.id}-${item.color}-${item.storage}`} className="rounded-2xl bg-card p-3"><div className="flex gap-3"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F7F8FC]"><Image src={p.images?.[0] || `/placeholder.svg?height=200&width=200&query=${imgQuery}`} alt={p.name} fill className="object-cover" /></div><div className="flex min-w-0 flex-1 flex-col"><Link href={`/product/${p.id}`} className="line-clamp-1 text-base font-semibold text-foreground">{p.name}</Link><p className="text-sm font-medium text-[#3B6CF4]">{p.brand}</p><p className="mt-1 text-base font-bold text-foreground">{formatBDT(p.price)}</p></div></div><div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3"><button className="inline-flex items-center gap-1 text-sm font-medium text-[#3B6CF4]"><Pencil className="h-3.5 w-3.5" /> Edit</button><div className="flex items-center gap-3"><button onClick={() => updateQuantity(p.id, item.quantity - 1, item.color, item.storage)} className="grid h-7 w-7 place-items-center rounded-full border border-border text-foreground"><Minus className="h-3 w-3" /></button><span className="w-4 text-center text-sm font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(p.id, item.quantity + 1, item.color, item.storage)} className="grid h-7 w-7 place-items-center rounded-full border border-[#3B6CF4] text-[#3B6CF4]"><Plus className="h-3 w-3" /></button></div><button onClick={() => removeItem(p.id, item.color, item.storage)} className="grid h-8 w-8 place-items-center rounded-full text-foreground/60 hover:bg-foreground/5"><Trash2 className="h-4 w-4" /></button></div></li>})}</ul><div className="space-y-4 md:sticky md:top-20 md:self-start"><div className="flex items-center gap-2 rounded-full bg-card px-4 py-2"><Ticket className="h-4 w-4 text-muted-foreground" /><input placeholder="Enter Promo Code" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /><button className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground"><ChevronRight className="h-4 w-4" /></button></div><div className="space-y-3 px-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Sub Total</span><span className="font-medium text-foreground">{formatBDT(subtotal)}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping &amp; Tax</span><span className="font-medium text-foreground">{formatBDT(shippingTax)}</span></div><div className="flex justify-between pt-1"><span className="text-base font-semibold text-foreground">Total</span><span className="text-base font-bold text-foreground">{formatBDT(total)}</span></div></div><Link href="/checkout" className="block w-full rounded-full bg-[#3B6CF4] py-3.5 text-center text-sm font-semibold text-white">Checkout</Link></div></div>}</div></AppShell>
}
