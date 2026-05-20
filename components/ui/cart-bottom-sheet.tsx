"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { formatBDT } from "@/lib/format"
import { useProducts } from "@/lib/use-store-data"

export function CartBottomSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items } = useCart()
  const { products } = useProducts({ enabled: open })

  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [open])

  const enriched = items.map((item) => {
    const p = products.find((prod) => prod.id === item.productId)
    return p ? { ...item, product: p } : null
  }).filter(Boolean) as Array<{ productId: string; quantity: number; color?: string; storage?: string; product: Product }>

  const subtotal = enriched.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const itemCount = enriched.reduce((s, i) => s + i.quantity, 0)
  if (!open) return null

  return <div className="fixed inset-0 z-60" role="dialog" aria-modal="true" aria-label="Cart quick view"><button aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" /><div className="absolute bottom-0 left-0 right-0 flex max-h-[50dvh] flex-col rounded-t-3xl bg-card"><div className="flex flex-col items-center pt-3"><div className="h-1 w-10 rounded-full bg-foreground/15" /></div><div className="px-5 pb-3 pt-3 text-center"><h2 className="text-lg font-bold text-foreground">Cart ({itemCount})</h2></div><div className="min-h-0 flex-1 overflow-y-auto px-5">{enriched.length===0?<div className="flex h-full min-h-30 flex-col items-center justify-center gap-2 py-6 text-center"><div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary"><ShoppingBag className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">Your cart is empty</p></div>:<ul className="divide-y divide-border">{enriched.map((item)=>{const p=item.product;return <li key={`${p.id}-${item.color}-${item.storage}`} className="flex items-center gap-3 py-2.5"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={p.images?.[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" /></div><p className="line-clamp-1 min-w-0 flex-1 text-sm font-medium text-foreground">{p.name}</p><span className="shrink-0 text-sm font-semibold text-foreground">×{item.quantity}</span></li>})}</ul>}</div><div className="border-t border-border/60 px-5 py-3"><div className="flex items-center justify-between pb-3"><span className="text-sm text-muted-foreground">Total</span><span className="text-base font-bold text-foreground">{formatBDT(subtotal)}</span></div><Link href="/cart" onClick={onClose} className="block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-white">View Cart</Link></div></div></div>
}
