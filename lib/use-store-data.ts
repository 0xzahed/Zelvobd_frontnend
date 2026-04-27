"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getCategories } from "@/src/api/categoryApi"
import { getProducts } from "@/src/api/products/getProducts"
import { getHomePageBanners } from "@/src/api/banner/getHomePageBanners"
import { getBanners } from "@/src/api/banner/getBanners"
import { mapBanner, mapCategory, mapProduct } from "@/src/api/_shared/mappers"
import type { Category, Product, Slider } from "@/lib/types"

let categoriesCache: Category[] | null = null
let productsCache: Product[] | null = null
let slidersCache: Slider[] | null = null

let categoriesInFlight: Promise<Category[]> | null = null
let productsInFlight: Promise<Product[]> | null = null
let slidersInFlight: Promise<Slider[]> | null = null

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

export function useCategories() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setCategories([])
      setLoaded(true)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        if (categoriesCache) {
          if (!cancelled) setCategories(categoriesCache)
          return
        }

        if (!categoriesInFlight) {
          categoriesInFlight = (async () => {
            const categoryRes = await getCategories({ limit: 100 })
            const mappedCategories = (categoryRes?.data?.categories || []).map(mapCategory)

            if (mappedCategories.length > 0) {
              categoriesCache = mappedCategories
              return mappedCategories
            }

            const productRes = await getProducts({ limit: 100 })
            const mappedProducts = (productRes?.data?.products || []).map(mapProduct)
            const derivedCategories = categoryFromProduct(mappedProducts)
            categoriesCache = derivedCategories
            return derivedCategories
          })().finally(() => {
            categoriesInFlight = null
          })
        }

        const nextCategories = await categoriesInFlight
        if (!cancelled) setCategories(nextCategories)
      } catch {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [pathname])

  return { categories, loaded }
}

export function useProducts() {
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setProducts([])
      setLoaded(true)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        if (productsCache) {
          if (!cancelled) setProducts(productsCache)
          return
        }

        if (!productsInFlight) {
          productsInFlight = (async () => {
            const res = await getProducts({ limit: 100 })
            const mapped = (res?.data?.products || []).map(mapProduct)
            productsCache = mapped
            return mapped
          })().finally(() => {
            productsInFlight = null
          })
        }

        const nextProducts = await productsInFlight
        if (!cancelled) setProducts(nextProducts)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [pathname])

  return { products, loaded }
}

export function useSliders() {
  const pathname = usePathname()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setSliders([])
      setLoaded(true)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        if (slidersCache) {
          if (!cancelled) setSliders(slidersCache)
          return
        }

        if (!slidersInFlight) {
          slidersInFlight = (async () => {
            const homeBannerRes = await getHomePageBanners()
            const homeBanners = (homeBannerRes?.data || []).map(mapBanner)

            if (homeBanners.length > 0) {
              slidersCache = homeBanners
              return homeBanners
            }

            const allBannerRes = await getBanners()
            const allBanners = (allBannerRes?.data || []).map(mapBanner)
            slidersCache = allBanners
            return allBanners
          })().finally(() => {
            slidersInFlight = null
          })
        }

        const nextSliders = await slidersInFlight
        if (!cancelled) setSliders(nextSliders)
      } catch {
        if (!cancelled) setSliders([])
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [pathname])

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
