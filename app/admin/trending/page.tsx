"use client"

import { Loader2 } from "lucide-react"
import { useTrendingAdmin } from "@/src/hooks/api/useTrending"
import { TrendingSettings } from "@/components/admin/trending/trending-settings"
import { TrendingProducts } from "@/components/admin/trending/trending-products"

export default function AdminTrendingPage() {
  const { data: adminData, isLoading, error } = useTrendingAdmin()

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
        <p className="font-semibold text-lg">Error loading Trending configurations.</p>
        <p className="text-sm">Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Trending Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your global trending campaign and its eligible products.
        </p>
      </div>

      <div className="grid gap-6">
        <TrendingSettings adminData={adminData} />
        <TrendingProducts adminData={adminData} />
      </div>
    </div>
  )
}
