"use client"

import { AppShell } from "@/components/layout/app-shell"
import { CategoryCard } from "@/components/ui/category-card"
import { BackHeader } from "@/components/layout/back-header"
import { AllProductsSection } from "@/components/home/all-products-section"
import { useCategories } from "@/lib/use-store-data"

export default function CategoriesPage() {
  const { categories } = useCategories()

  return (
    <AppShell>
      <BackHeader title="All Categories" />
      <div className="space-y-6 py-4 md:space-y-8 md:py-6">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8 md:gap-2">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
        <AllProductsSection />
      </div>
    </AppShell>
  )
}
