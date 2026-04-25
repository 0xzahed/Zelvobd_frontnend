import { BASE_URL } from "./baseUrl"

const toAbsoluteUploadUrl = (path) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  const root = BASE_URL.replace(/\/api\/v1$/, "")
  return `${root}${path}`
}

export const mapCategory = (category) => ({
  id: category.id,
  name: category.title,
  slug: category.slug,
  image: toAbsoluteUploadUrl(category.imageUrl),
  subCategories: (category.subCategories || []).map((sub) => ({
    id: sub.id,
    name: sub.title,
    slug: sub.slug,
    image: toAbsoluteUploadUrl(sub.imageUrl),
  })),
})

export const mapProduct = (product) => {
  const firstVariant = product.firstVariant || product.variants?.[0]
  const price = Number(firstVariant?.discountedPrice || 0)
  const cutPrice = Number(firstVariant?.actualPrice || 0)

  return {
    id: product.id,
    name: product.title,
    brand: "",
    categorySlug: product.category?.slug || "",
    subCategorySlug: product.subCategory?.slug || "",
    price,
    cutPrice,
    discount: cutPrice > price ? Math.round((1 - price / cutPrice) * 100) : 0,
    rating: 4.5,
    reviews: 0,
    images: (product.variants || [])
      .map((v) => toAbsoluteUploadUrl(v.imageUrl))
      .filter(Boolean),
    features: [],
    description: product.descriptionHtml || "",
    extraDescription: product.extraDescriptionHtml || undefined,
    isTrending: false,
    isFlashSale: false,
    isFreeDelivery: Boolean(product.isFreeDelivery),
    stock: Number(product.stock || 0),
    whatsapp: "+8801700000000",
    weight: product.weight || undefined,
    video: product.videoUrl ? toAbsoluteUploadUrl(product.videoUrl) : undefined,
    size: firstVariant?.size || undefined,
    quantity: undefined,
    material: product.material || undefined,
    color: firstVariant?.color || undefined,
    status: product.status || undefined,
    createdAt: product.createdAt || undefined,
    variants: (product.variants || []).map((variant) => ({
      id: variant.id,
      name: `${variant.color} / ${variant.size}`,
      price: Number(variant.discountedPrice || 0),
      cutPrice: Number(variant.actualPrice || 0),
      stock: Number(product.stock || 0),
      image: toAbsoluteUploadUrl(variant.imageUrl),
    })),
  }
}

export const mapBanner = (banner) => ({
  id: banner.id,
  title: banner.title || "",
  subtitle: "",
  cta: "Shop now",
  link: banner.url || "/",
  image: toAbsoluteUploadUrl(banner.imageUrl),
  bg: "#EAF0FF",
})
