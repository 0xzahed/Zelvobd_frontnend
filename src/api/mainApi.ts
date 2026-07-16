import type { Category, Product, Slider } from "@/lib/types"
import { refreshAdminToken } from "@/src/api/authApi"

// ─── client.ts ───

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1"

export const getAccessToken = (): string | null =>
  typeof window === "undefined" ? null : localStorage.getItem("admin_access_token")

export const authHeaders = (): Record<string, string> => {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const handleApiError = (err: unknown, fallback = "Something went wrong"): void => {
  const message =
    err && typeof err === "object"
      ? ((err as Record<string, unknown>).message as string) ||
        ((err as Record<string, unknown>).error as string) ||
        fallback
      : typeof err === "string"
        ? err
        : fallback

  if (typeof window !== "undefined") {
    import("@/lib/notify")
      .then(({ notify }) => notify.error(message))
      .catch(() => console.error(message))
    return
  }

  if (err && typeof err === "object") {
    console.error(message)
  } else if (typeof err === "string") {
    console.error(err)
  } else {
    console.error(fallback)
  }
}

// ─── adminFetch.ts ───

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

export const adminFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAccessToken()
  const headers = new Headers(init?.headers)

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const newInit = { ...init, headers }
  let response = await fetch(input, newInit)

  if (response.status === 401) {
    let newAccessToken = ""

    if (!isRefreshing) {
      isRefreshing = true

      const tokenPromise = new Promise<string>((resolve) => {
        addRefreshSubscriber(resolve)
      })

      try {
        const payload = await refreshAdminToken()
        isRefreshing = false
        onRefreshed(payload?.data?.accessToken || "")
        newAccessToken = await tokenPromise
      } catch (err) {
        isRefreshing = false
        onRefreshed("")

        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_access_token")
          localStorage.removeItem("admin_refresh_token")
          window.location.href = "/login"
        }
        return response
      }
    } else {
      newAccessToken = await new Promise<string>((resolve) => {
        addRefreshSubscriber(resolve)
      })
    }

    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`)
      response = await fetch(input, { ...init, headers })
    }
  }

  return response
}

// ─── requestWithAdminAuth.ts ───

type RequestOptions = {
  path: string
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
}

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const executeRequest = async ({ path, method, body }: RequestOptions) => {
  const headers: Record<string, string> = {
    ...authHeaders(),
  }

  const hasBody = body !== undefined
  if (hasBody) {
    headers["Content-Type"] = "application/json"
  }

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  })
}

export const requestWithAdminAuth = async (options: RequestOptions) => {
  let response = await executeRequest(options)
  let payload = await parseJsonSafe(response)

  if (response.status === 401) {
    try {
      await refreshAdminToken()
      response = await executeRequest(options)
      payload = await parseJsonSafe(response)
    } catch {
      // Preserve original failure handling below.
    }
  }

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}

// ─── mappers.ts ───

export const toAbsoluteUploadUrl = (path: string | null | undefined): string => {
  if (!path) return ""
  if (path.startsWith("http") || path.startsWith("blob") || path.startsWith("data")) return path

  const correctedPath = path.replace(/^\/uploads\//, "/upload/")

  const root = BASE_URL.replace(/\/api\/v1$/, "")
  return `${root}${correctedPath}`
}

const uniqueNonEmpty = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((v) => (v || "").trim()).filter(Boolean)))

const toStringSafe = (value: unknown): string => String(value ?? "").trim()

const pickVariantList = (product: any): any[] => {
  const candidates = [
    product?.variants,
    product?.productVariants,
    product?.variantList,
    product?.variantOptions,
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate
  }
  if (product?.firstVariant) return [product.firstVariant]
  return []
}

export const mapCategory = (category: any): Category => ({
  id: category.id,
  name: category.title,
  slug: category.slug,
  image: toAbsoluteUploadUrl(category.imageUrl),
  createdAt: category.createdAt,
  subCategories: (category.subCategories || []).map((sub: any) => ({
    id: sub.id,
    name: sub.title,
    slug: sub.slug,
    image: toAbsoluteUploadUrl(sub.imageUrl),
  })),
})

export const mapSubCategory = (subCategory: any) => ({
  id: subCategory.id,
  categoryId: subCategory.categoryId,
  categoryName: subCategory.category?.title || "",
  name: subCategory.title,
  slug: subCategory.slug,
  image: toAbsoluteUploadUrl(subCategory.imageUrl),
})

export const mapProduct = (product: any): Product => {
  const rawVariants = pickVariantList(product)

  const firstVariant = product.firstVariant || rawVariants[0]
  const isFlashSale = Boolean(product.isFlashSale)
  const price = isFlashSale && firstVariant?.flashSalePrice != null ? Number(firstVariant.flashSalePrice) : Number(firstVariant?.discountedPrice || 0)
  const cutPrice = isFlashSale && firstVariant?.flashSalePrice != null ? Number(firstVariant?.discountedPrice || 0) : Number(firstVariant?.actualPrice || 0)

  const imageCandidates = uniqueNonEmpty([
    ...rawVariants.map((v: any) => toAbsoluteUploadUrl(v.imageUrl)),
    toAbsoluteUploadUrl(firstVariant?.imageUrl),
    toAbsoluteUploadUrl(product.imageUrl),
    toAbsoluteUploadUrl(product.thumbnailUrl),
    toAbsoluteUploadUrl(product.coverImageUrl),
  ])

  return {
    id: product.id,
    name: product.title,
    slug: product.slug || "",
    brand: toStringSafe(product.brand),
    descriptionDelta: product.descriptionDelta ?? undefined,
    categoryId: product.category?.id || undefined,
    subCategoryId: product.subCategory?.id || undefined,
    categorySlug: product.category?.slug || "",
    subCategorySlug: product.subCategory?.slug || "",
    categoryName: product.category?.title || "",
    subCategoryName: product.subCategory?.title || "",
    price,
    cutPrice,
    discount: cutPrice > price ? Math.round((1 - price / cutPrice) * 100) : 0,
    reviews: 0,
    images: imageCandidates,
    features: [],
    description: product.descriptionHtml || "",
    extraDescriptionDelta: product.extraDescriptionDelta ?? undefined,
    extraDescription: product.extraDescriptionHtml || undefined,
    isTrending: Boolean(product.isTrending),
    isFlashSale,
    flashSaleEndsAt: product.flashSaleEndsAt || undefined,
    isFreeDelivery: Boolean(product.isFreeDelivery),
    stock: Boolean(product.stock),
    availability: Boolean(product.availability),
    whatsapp: "+8801700000000",
    weight: product.weight || undefined,
    video: product.videoUrl ? toAbsoluteUploadUrl(product.videoUrl) : undefined,
    material: product.material || undefined,
    rating: typeof product.rating === "number" ? product.rating : undefined,
    status: product.status || undefined,
    createdAt: product.createdAt || undefined,
    variantLabel: product.variantLabel || undefined,
    specifications: Array.isArray(product.specifications)
      ? product.specifications
      : (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : []),
    variants: rawVariants.map((variant: any) => ({
      id: String(variant.id || variant._id || ""),
      color: toStringSafe(variant.color ?? variant.colorName),
      colorCode: variant.colorCode || undefined,
      size: toStringSafe(variant.size ?? variant.storage ?? variant.capacity),
      actualPrice: Number(variant.actualPrice || 0),
      discountedPrice: Number(variant.discountedPrice || 0),
      flashSalePrice: variant.flashSalePrice != null ? Number(variant.flashSalePrice) : undefined,
      image: toAbsoluteUploadUrl(variant.imageUrl || variant.image),
      barcodeUrl: toAbsoluteUploadUrl(variant.barcodeUrl || variant.barcode),
    })),
  }
}

export const mapBanner = (banner: any): Slider => {
  const hasUrl = Boolean(banner.url && banner.url.trim().length > 0);
  const link = hasUrl ? banner.url : banner.category?.slug ? `/${banner.category.slug}` : "/";

  return {
    id: banner.id,
    title: banner.title || "",
    subtitle: banner.subTitle || "",
    cta: "Shop now",
    link,
    external: hasUrl,
    image: toAbsoluteUploadUrl(banner.imageUrl),
    bg: "var(--secondary)",
    categoryId: banner.categoryId || undefined,
    inHomePage: Boolean(banner.inHomePage),
    createdAt: banner.createdAt || undefined,
  };
};
