export type ProductVariant = {
  id: string
  name: string
  price: number
  cutPrice: number
  stock: number
  image?: string
}

export type Product = {
  id: string
  name: string
  brand: string
  categorySlug: string
  subCategorySlug: string
  price: number
  cutPrice: number
  discount: number
  rating: number
  reviews: number
  images: string[]
  colors?: string[]
  storage?: string[]
  features: string[]
  description: string
  /** Additional / long-form product description */
  extraDescription?: string
  isTrending: boolean
  isFlashSale: boolean
  /** When true, this product is shown under the Free Delivery section on home */
  isFreeDelivery?: boolean
  stock: number
  whatsapp: string
  /** Product weight (e.g., "500g", "1.2kg") */
  weight?: string
  /** Optional product video URL (uploaded file blob or direct URL) */
  video?: string
  /** Optional size label (e.g., "XL", "Large") */
  size?: string
  /** Optional quantity descriptor (e.g., "24 PCS") */
  quantity?: string
  /** Optional material */
  material?: string
  /** Optional color */
  color?: string
  /** Product variants — at least one required when defined */
  variants?: ProductVariant[]
  /** Backend product status used in admin overview stats/charts */
  status?: string
  /** Backend product created timestamp */
  createdAt?: string
}

export type SubCategory = {
  id: string
  name: string
  slug: string
  image: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image: string
  subCategories: SubCategory[]
  /** Optional category-specific slider images configured from admin */
  slider?: string[]
}

export type Slider = {
  id: string
  title: string
  subtitle: string
  cta: string
  link: string
  image: string
  bg: string
}

export type Notification = {
  id: string
  type: "order" | "promo" | "success" | "info" | "alert"
  title: string
  description: string
  time: string
  unread: boolean
}

export type CartItem = {
  productId: string
  quantity: number
  color?: string
  storage?: string
}

export type FlashSale = {
  endsInDays: number
  endsInHours: number
  endsInMinutes: number
  productIds: string[]
  /** Optional admin-configured background image for the flash sale card */
  bg?: string
}
