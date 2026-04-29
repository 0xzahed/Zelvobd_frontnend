import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError, fileFromUrl } from "@/lib/api-utils"
import { getProducts } from "@/src/api/products/getProducts"
import { getProductDetails } from "@/src/api/products/getProductDetails"
import { createProduct } from "@/src/api/products/createProduct"
import { updateProduct } from "@/src/api/products/updateProduct"
import { deleteProduct } from "@/src/api/products/deleteProduct"
import { copyProduct } from "@/src/api/products/copyProduct"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product, ProductVariant } from "@/lib/types"

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  details: (id: string) => ["products", id] as const,
}

// Helpers for fallback
const toQuillDelta = (text: string) => ({
  ops: [{ insert: `${text || "N/A"}\n` }],
})

const isHtmlString = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value || "")

const htmlToPlainText = (html: string) =>
  (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()

const toHtml = (text: string) => {
  if (isHtmlString(text)) return text
  const safe = (text || "N/A")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>")

  return `<p>${safe}</p>`
}

const buildProductFormData = async (
  product: Product,
  descriptionDelta: any,
  extraDescriptionDelta: any,
  categoryId: string,
  subCategoryId: string
) => {
  const variants = (product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: "default",
          color: "Default",
          size: "Standard",
          actualPrice: product.price || 0,
          discountedPrice: product.cutPrice || product.price || 0,
          image: product.images?.[0],
        },
      ]) as ProductVariant[]

  const variantPayload = variants.map((variant) => {
    return {
      actualPrice: variant.actualPrice,
      discountedPrice: variant.discountedPrice,
      color: variant.color,
      size: variant.size,
      image: variant.image || product.images?.[0] || "",
    }
  })

  const formData = new FormData()
  const descriptionHtml = toHtml(product.description || "N/A")
  const descriptionPlain = htmlToPlainText(descriptionHtml) || "N/A"
  
  const finalDescriptionDelta = descriptionDelta || toQuillDelta(descriptionPlain)

  formData.append("categoryId", categoryId)
  formData.append("subCategoryId", subCategoryId)
  formData.append("title", product.name?.trim() || "Untitled Product")
  formData.append("descriptionDelta", JSON.stringify(finalDescriptionDelta))
  formData.append("descriptionHtml", descriptionHtml)
  
  if (product.extraDescription?.trim()) {
    const extraHtml = toHtml(product.extraDescription)
    const extraPlain = htmlToPlainText(extraHtml) || "N/A"
    const finalExtraDescriptionDelta = extraDescriptionDelta || toQuillDelta(extraPlain)
    
    formData.append("extraDescriptionDelta", JSON.stringify(finalExtraDescriptionDelta))
    formData.append("extraDescriptionHtml", extraHtml)
  }
  
  formData.append("weight", product.weight?.trim() || "N/A")
  formData.append("material", product.material?.trim() || "N/A")
  formData.append("stock", String(product.stock))
  formData.append("availability", String(product.availability))
  formData.append(
    "variants",
    JSON.stringify(
      variantPayload.map(({ actualPrice, discountedPrice, color, size }) => ({
        actualPrice,
        discountedPrice,
        color,
        size,
      })),
    ),
  )

  for (let i = 0; i < variantPayload.length; i += 1) {
    const variant = variantPayload[i]
    const file = await fileFromUrl(variant.image, `variant-${i + 1}`)
    if (!file) {
      throw new Error("Each variant must have an image")
    }
    formData.append("variantImages", file)
  }

  if (product.video) {
    const videoFile = await fileFromUrl(product.video, "product-video")
    if (videoFile) {
      formData.append("video", videoFile)
    }
  }

  return formData
}

// -- Queries --

export function useProducts(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...PRODUCT_KEYS.all, query],
    queryFn: async () => {
      const res = await getProducts(query || { limit: 100 })
      return (res?.data?.products || []).map(mapProduct)
    },
  })
}

export function useProductDetails(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PRODUCT_KEYS.details(id),
    queryFn: async () => {
      const res = await getProductDetails(id)
      return mapProduct(res?.data)
    },
    ...options,
  })
}

// -- Mutations --

export type CreateProductPayload = {
  product: Product
  descriptionDelta: any
  extraDescriptionDelta: any
  categoryId: string
  subCategoryId: string
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const formData = await buildProductFormData(
        payload.product,
        payload.descriptionDelta,
        payload.extraDescriptionDelta,
        payload.categoryId,
        payload.subCategoryId
      )
      return createProduct(formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      notify.success({ title: "Success", message: `Product "${variables.product.name}" added.` })
    },
    onError: (error) => handleApiError(error),
  })
}

export type UpdateProductPayload = {
  id: string
  product: Product
  descriptionDelta: any
  extraDescriptionDelta: any
  categoryId: string
  subCategoryId: string
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateProductPayload) => {
      const formData = await buildProductFormData(
        payload.product,
        payload.descriptionDelta,
        payload.extraDescriptionDelta,
        payload.categoryId,
        payload.subCategoryId
      )
      return updateProduct(payload.id, formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.details(variables.id) })
      notify.success({ title: "Updated", message: "Product changes saved." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      notify.success({ title: "Deleted", message: "Product removed." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useCopyProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: copyProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      notify.success({ title: "Success", message: "Product duplicated." })
    },
    onError: (error) => handleApiError(error),
  })
}
