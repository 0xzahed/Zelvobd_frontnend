"use client"

import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { WishlistProvider } from "@/contexts/wishlist-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            offset={16}
            gap={10}
            duration={4000}
            toastOptions={{
              classNames: {
                toast:
                  "group rounded-xl border border-border/60 bg-card shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm",
                title: "text-sm font-medium text-foreground",
                description: "text-xs text-muted-foreground",
                actionButton: "bg-[#3B6CF4] text-white",
                cancelButton: "bg-muted text-muted-foreground",
                success: "!border-emerald-200 !bg-emerald-50",
                error: "!border-red-200 !bg-red-50",
                warning: "!border-amber-200 !bg-amber-50",
                info: "!border-blue-200 !bg-blue-50",
              },
            }}
          />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}
