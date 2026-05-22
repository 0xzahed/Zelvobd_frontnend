"use client"

import { useSliders } from "@/lib/use-store-data"
import { AppShell } from "@/components/layout/app-shell"
import { SliderBanner } from "@/components/ui/slider-banner"
import { CategoriesSection } from "@/components/home/categories-section"
import { FlashSaleSection } from "@/components/home/flash-sale-section"
import { FreeDeliveryBanner } from "@/components/home/free-delivery-banner"
import { TrendingSection } from "@/components/home/trending-section"
import { NewProductsSection } from "@/components/home/new-products-section"
import { CategoryProductsSections } from "@/components/home/category-products-sections"
import { FloatingRotatingIcon } from "@/components/home/floating-rotating-icon"

export default function HomePage() {
  const { sliders, loaded } = useSliders()

  return (
    <AppShell>
      <div className="space-y-5 py-4 md:space-y-8 md:py-6">
        <SliderBanner slides={sliders} />
        <CategoriesSection />
        <FlashSaleSection />
        <FreeDeliveryBanner />
        <TrendingSection />
        <NewProductsSection />
        <CategoryProductsSections />
      </div>
      <FloatingRotatingIcon />
    </AppShell>
  )
}
