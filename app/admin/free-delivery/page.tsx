"use client"

import { Loader2 } from "lucide-react"
import { useFreeDeliveryAdmin } from "@/src/hooks/api/useFreeDelivery"
import { FreeDeliverySettings } from "@/components/admin/free-delivery/free-delivery-settings"
import { FreeDeliveryProducts } from "@/components/admin/free-delivery/free-delivery-products"

export default function AdminFreeDeliveryPage() {
  const { data: adminData, isLoading, error } = useFreeDeliveryAdmin()

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !adminData) {
    return (
      <div className="flex h-100 flex-col items-center justify-center text-destructive">
        <p className="font-semibold text-lg">Error loading Free Delivery configurations.</p>
        <p className="text-sm">Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Free Delivery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your global free delivery campaign and its eligible products.
        </p>
      </div>

      <div className="grid gap-6">
        <FreeDeliverySettings adminData={adminData} />
        <FreeDeliveryProducts adminData={adminData} />
      </div>
    </div>
  )
}
