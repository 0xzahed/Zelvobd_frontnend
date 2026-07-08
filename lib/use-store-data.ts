"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getCategories } from "@/src/api/categoryApi"
import { getProducts } from "@/src/api/productApi"
import { getHomePageBanners } from "@/src/api/bannerApi"
import { mapBanner, mapCategory, mapProduct } from "@/src/api/mainApi"
import type { Category, Product, Slider } from "@/lib/types"

let categoriesCache: Category[] | null = null
let productsCache: Product[] | null = null
let slidersCache: Slider[] | null = null
let youtubeVideosCache: any[] | null = null

let categoriesInFlight: Promise<Category[]> | null = null
let productsInFlight: Promise<Product[]> | null = null
let slidersInFlight: Promise<Slider[]> | null = null
let youtubeVideosInFlight: Promise<any[]> | null = null

import { BASE_URL } from "@/src/api/mainApi"

export function useCategories() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
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

            categoriesCache = mappedCategories
            return mappedCategories
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

export function useProducts(options?: { enabled?: boolean }) {
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled) {
      setProducts([])
      setLoaded(false)
      return
    }

    if (pathname?.startsWith("/dashboard")) {
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
  }, [pathname, enabled])

  return { products, loaded }
}

export function useSliders() {
  const pathname = usePathname()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
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

            slidersCache = homeBanners
            return homeBanners
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

export function useStorefrontYoutubeVideos() {
  const pathname = usePathname()
  const [videos, setVideos] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
      setVideos([])
      setLoaded(true)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        if (youtubeVideosCache) {
          if (!cancelled) setVideos(youtubeVideosCache)
          return
        }

        if (!youtubeVideosInFlight) {
          youtubeVideosInFlight = (async () => {
            const res = await fetch(`${BASE_URL}/youtube-videos`)
            const data = await res.json()
            const fetchedVideos = data?.data || []
            youtubeVideosCache = fetchedVideos
            return fetchedVideos
          })().finally(() => {
            youtubeVideosInFlight = null
          })
        }

        const nextVideos = await youtubeVideosInFlight
        if (!cancelled) setVideos(nextVideos)
      } catch {
        if (!cancelled) setVideos([])
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [pathname])

  return { videos, loaded }
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
