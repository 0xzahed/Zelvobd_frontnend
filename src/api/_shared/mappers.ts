import type { Category, Product, Slider } from "@/lib/types"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1"

const toAbsoluteUploadUrl = (path: string | null | undefined): string => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  const root = BASE_URL.replace(/\/api\/v1$/, "")
  return `${root}${path}`
}

const uniqueNonEmpty = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((v) => (v || "").trim()).filter(Boolean)))

export const mapCategory = (category: any): Category => ({
  id: category.id,
  name: category.title,
  slug: category.slug,
  image: toAbsoluteUploadUrl(category.imageUrl),
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
  const firstVariant = product.firstVariant || product.variants?.[0]
  const isFlashSale = Boolean(product.isFlashSale)
  const price = isFlashSale && firstVariant?.flashSalePrice != null ? Number(firstVariant.flashSalePrice) : Number(firstVariant?.discountedPrice || 0)
  const cutPrice = isFlashSale && firstVariant?.flashSalePrice != null ? Number(firstVariant?.discountedPrice || 0) : Number(firstVariant?.actualPrice || 0)

  const imageCandidates = uniqueNonEmpty([
    ...(product.variants || []).map((v: any) => toAbsoluteUploadUrl(v.imageUrl)),
    toAbsoluteUploadUrl(firstVariant?.imageUrl),
    toAbsoluteUploadUrl(product.imageUrl),
    toAbsoluteUploadUrl(product.thumbnailUrl),
    toAbsoluteUploadUrl(product.coverImageUrl),
  ])

  return {
    id: product.id,
    slugId: product.slugId || 0,
    name: product.title,
    slug: product.slug || "",
    brand: "",
    categoryId: product.category?.id || undefined,
    subCategoryId: product.subCategory?.id || undefined,
    categorySlug: product.category?.slug || "",
    subCategorySlug: product.subCategory?.slug || "",
    categoryName: product.category?.title || "",
    subCategoryName: product.subCategory?.title || "",
    price,
    cutPrice,
    discount: cutPrice > price ? Math.round((1 - price / cutPrice) * 100) : 0,
    rating: 4.5,
    reviews: 0,
    images: imageCandidates,
    features: [],
    description: product.descriptionHtml || "",
    extraDescription: product.extraDescriptionHtml || undefined,
    isTrending: false,
    isFlashSale,
    flashSaleEndsAt: product.flashSaleEndsAt || undefined,
    isFreeDelivery: Boolean(product.isFreeDelivery),
    stock: Boolean(product.stock),
    availability: Boolean(product.availability),
    whatsapp: "+8801700000000",
    weight: product.weight || undefined,
    video: product.videoUrl ? toAbsoluteUploadUrl(product.videoUrl) : undefined,
    material: product.material || undefined,
    status: product.status || undefined,
    createdAt: product.createdAt || undefined,
    variants: (product.variants || []).map((variant: any) => ({
      id: variant.id,
      color: variant.color || "",
      size: variant.size || "",
      actualPrice: Number(variant.actualPrice || 0),
      discountedPrice: Number(variant.discountedPrice || 0),
      flashSalePrice: variant.flashSalePrice != null ? Number(variant.flashSalePrice) : undefined,
      image: toAbsoluteUploadUrl(variant.imageUrl),
    })),
  }
}

export const mapBanner = (banner: any): Slider => ({
  id: banner.id,
  title: banner.title || "",
  subtitle: "",
  cta: "Shop now",
  link: banner.url || "/",
  image: toAbsoluteUploadUrl(banner.imageUrl),
  bg: "var(--secondary)",
})
