"use client"

import { useEffect, useState } from "react"
import { getCategories } from "@/src/api/category/getCategories"
import { getProducts } from "@/src/api/products/getProducts"
import { getHomePageBanners } from "@/src/api/banner/getHomePageBanners"
import { getBanners } from "@/src/api/banner/getBanners"
import { mapBanner, mapCategory, mapProduct } from "@/src/api/_shared/mappers"
import type { Category, Product, Slider } from "@/lib/types"

const categoryFromProduct = (products: Product[]): Category[] => {
  const map = new Map<string, Category>()

  products.forEach((product) => {
    const categorySlug = product.categorySlug || "uncategorized"
    const categoryName = categorySlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")

    if (!map.has(categorySlug)) {
      map.set(categorySlug, {
        id: `derived-${categorySlug}`,
        name: categoryName,
        slug: categorySlug,
        image: product.images?.[0] || "/placeholder.svg",
        subCategories: [],
      })
    }
  })

  return Array.from(map.values())
}

const fallbackSliders = (): Slider[] => [
  {
    id: "fallback-1",
    title: "Welcome to EcoMerce",
    subtitle: "New arrivals are available now",
    cta: "Shop now",
    link: "/",
    image: "/placeholder.svg",
    bg: "#EAF0FF",
  },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const categoryRes = await getCategories({ limit: 100 })
        const mappedCategories = (categoryRes?.data?.categories || []).map(mapCategory)

        if (mappedCategories.length > 0) {
          setCategories(mappedCategories)
        } else {
          const productRes = await getProducts({ limit: 100 })
          const mappedProducts = (productRes?.data?.products || []).map(mapProduct)
          setCategories(categoryFromProduct(mappedProducts))
        }
      } catch {
        setCategories([])
      } finally {
        setLoaded(true)
      }
    }

    void load()
  }, [])

  return { categories, loaded }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProducts({ limit: 100 })
        setProducts((res?.data?.products || []).map(mapProduct))
      } catch {
        setProducts([])
      } finally {
        setLoaded(true)
      }
    }

    void load()
  }, [])

  return { products, loaded }
}

export function useSliders() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const homeBannerRes = await getHomePageBanners()
        const homeBanners = (homeBannerRes?.data || []).map(mapBanner)

        if (homeBanners.length > 0) {
          setSliders(homeBanners)
        } else {
          const allBannerRes = await getBanners()
          const allBanners = (allBannerRes?.data || []).map(mapBanner)
          setSliders(allBanners.length > 0 ? allBanners : fallbackSliders())
        }
      } catch {
        setSliders(fallbackSliders())
      } finally {
        setLoaded(true)
      }
    }

    void load()
  }, [])

  return { sliders, loaded }
}

export function getStaticCategories(): Category[] {
  return []
}

export function getStaticProducts(): Product[] {
  return []
}

export function getStaticSliders(): Slider[] {
  return []
}
