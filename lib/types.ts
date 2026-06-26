export type ProductVariant = {
  id: string
  color: string
  colorCode?: string
  size: string
  actualPrice: number
  discountedPrice: number
  flashSalePrice?: number
  image?: string
  barcodeUrl?: string
}

export type Product = {
  id: string
  name: string
  brand: string
  descriptionDelta?: any
  categoryId?: string
  subCategoryId?: string
  categorySlug?: string
  subCategorySlug?: string
  categoryName?: string
  subCategoryName?: string
  price: number
  cutPrice: number
  discount: number
  rating: number
  reviews: number
  images: string[]
  features: string[]
  description: string
  extraDescriptionDelta?: any
  extraDescription?: string
  isTrending: boolean
  isFlashSale: boolean
  flashSaleEndsAt?: string
  isFreeDelivery?: boolean
  stock: boolean
  availability: boolean
  whatsapp: string
  weight?: string
  video?: string
  material?: string
  variants?: ProductVariant[]
  slug?: string
  status?: string
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
  categoryId?: string
  inHomePage?: boolean
  createdAt?: string
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
  bg?: string
}
