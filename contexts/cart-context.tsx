"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"

export type AppliedPromo = {
  code: string
  discountAmount: number
  discountType: "AMOUNT" | "PERCENT"
}

type CartContextType = {
  items: CartItem[]
  appliedPromo: AppliedPromo | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color?: string, storage?: string) => void
  updateQuantity: (productId: string, quantity: number, color?: string, storage?: string) => void
  applyPromo: (promo: AppliedPromo) => void
  removePromo: () => void
  clearCart: () => void
  totalCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = "ecomerce_cart"
const PROMO_STORAGE_KEY = "ecomerce_promo"

function sameKey(a: CartItem, color?: string, storage?: string) {
  return a.color === color && a.storage === storage
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(STORAGE_KEY)
      if (rawCart) setItems(JSON.parse(rawCart))
      
      const rawPromo = localStorage.getItem(PROMO_STORAGE_KEY)
      if (rawPromo) setAppliedPromo(JSON.parse(rawPromo))
    } catch (e) {
      console.log("[v0] cart hydrate error", e)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo))
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY)
      }
    } catch (e) {
      console.log("[v0] cart persist error", e)
    }
  }, [items, appliedPromo, hydrated])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && sameKey(p, item.color, item.storage))
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity }
        return next
      }
      return [...prev, item]
    })
  }

  const removeItem = (productId: string, color?: string, storage?: string) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && sameKey(p, color, storage))))
  }

  const updateQuantity = (productId: string, quantity: number, color?: string, storage?: string) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId && sameKey(p, color, storage) ? { ...p, quantity: Math.max(0, quantity) } : p,
        )
        .filter((p) => p.quantity > 0),
    )
  }

  const applyPromo = (promo: AppliedPromo) => {
    setAppliedPromo(promo)
  }

  const removePromo = () => {
    setAppliedPromo(null)
  }

  const clearCart = () => {
    setItems([])
    setAppliedPromo(null)
  }

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, appliedPromo, addItem, removeItem, updateQuantity, applyPromo, removePromo, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
