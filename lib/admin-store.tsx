"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { notify } from "@/lib/notify"
import type { Category, Product, ProductVariant, Slider, SubCategory } from "@/lib/types"
import {
  createCategory as createCategoryApi,
  createSubCategory as createSubCategoryApi,
  deleteCategory as deleteCategoryApi,
  deleteSubCategory as deleteSubCategoryApi,
  getCategories,
  getSubCategories,
  updateCategory as updateCategoryApi,
  updateSubCategory as updateSubCategoryApi,
} from "@/src/api/categoryApi"
import { getProducts } from "@/src/api/products/getProducts"
import { createProduct as createProductApi } from "@/src/api/products/createProduct"
import { updateProduct as updateProductApi } from "@/src/api/products/updateProduct"
import { deleteProduct as deleteProductApi } from "@/src/api/products/deleteProduct"
import { copyProduct as copyProductApi } from "@/src/api/products/copyProduct"
import { getBanners } from "@/src/api/banner/getBanners"
import { createBanner as createBannerApi } from "@/src/api/banner/createBanner"
import { updateBanner as updateBannerApi } from "@/src/api/banner/updateBanner"
import { deleteBanner as deleteBannerApi } from "@/src/api/banner/deleteBanner"
import { mapBanner, mapCategory, mapProduct, mapSubCategory } from "@/src/api/_shared/mappers"

type AdminStore = {
  categories: Category[]
  addCategory: (c: Category) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addSubCategory: (categoryId: string, sub: SubCategory) => void
  updateSubCategory: (categoryId: string, subId: string, data: Partial<SubCategory>) => void
  deleteSubCategory: (categoryId: string, subId: string) => void
  products: Product[]
  addProduct: (p: Product) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  copyProduct: (id: string) => void
  sliders: Slider[]
  addSlider: (s: Slider) => void
  updateSlider: (id: string, s: Partial<Slider>) => void
  deleteSlider: (id: string) => void
  resetAll: () => void
}

const AdminContext = createContext<AdminStore | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loaded, setLoaded] = useState(false)

  const reloadAll = async () => {
    const [categoriesRes, subCategoriesRes, productsRes, bannersRes] = await Promise.all([
      getCategories({ limit: 100 }),
      getSubCategories({ limit: 100 }),
      getProducts({ limit: 100 }),
      getBanners(),
    ])

    const categoryList: Category[] = (categoriesRes?.data?.categories || []).map(mapCategory)
    const subCategoryList: Array<{
      id: string
      categoryId: string
      name: string
      slug: string
      image: string
    }> = (subCategoriesRes?.data?.subCategories || []).map(mapSubCategory)

    const subCategoriesByCategoryId = new Map<string, Category["subCategories"]>()

    for (const sub of subCategoryList) {
      const current = subCategoriesByCategoryId.get(sub.categoryId) || []
      current.push({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        image: sub.image,
      })
      subCategoriesByCategoryId.set(sub.categoryId, current)
    }

    setCategories(
      categoryList.map((category) => ({
        ...category,
        subCategories: subCategoriesByCategoryId.get(category.id) || [],
      })),
    )
    setProducts((productsRes?.data?.products || []).map(mapProduct))
    setSliders((bannersRes?.data || []).map(mapBanner))
  }

  useEffect(() => {
    const load = async () => {
      try {
        await reloadAll()
      } finally {
        setLoaded(true)
      }
    }
    void load()
  }, [])

  const runApiAction = (action: () => Promise<void>) => {
    void (async () => {
      try {
        await action()
      } catch (error) {
        notify.error({ title: "Request failed", message: getErrorMessage(error) })
      }
    })()
  }

  const addCategory = (c: Category) => {
    runApiAction(async () => {
      const formData = new FormData()
      formData.append("title", c.name)
      if (c.image) {
        const file = await fileFromUrl(c.image, "category-image")
        if (file) formData.append("image", file)
      }
      await createCategoryApi(formData)
      await reloadAll()
      notify.success({ title: "Category added", message: `"${c.name}" was added successfully.` })
    })
  }

  const updateCategory = (id: string, c: Partial<Category>) => {
    runApiAction(async () => {
      const formData = new FormData()
      if (c.name) formData.append("title", c.name)
      if (c.image) {
        const file = await fileFromUrl(c.image, "category-image")
        if (file) formData.append("image", file)
      }
      await updateCategoryApi(id, formData)
      await reloadAll()
      notify.success({ title: "Category updated", message: "Your changes have been saved." })
    })
  }

  const deleteCategory = (id: string) => {
    runApiAction(async () => {
      await deleteCategoryApi(id)
      await reloadAll()
      notify.success({ title: "Category deleted", message: "Category was removed." })
    })
  }

  const addSubCategory = (categoryId: string, sub: SubCategory) => {
    runApiAction(async () => {
      const formData = new FormData()
      formData.append("categoryId", categoryId)
      formData.append("title", sub.name)
      if (sub.image) {
        const file = await fileFromUrl(sub.image, "subcategory-image")
        if (file) formData.append("image", file)
      }
      await createSubCategoryApi(formData)
      await reloadAll()
      notify.success({ title: "Sub-category added", message: `"${sub.name}" is now available.` })
    })
  }

  const updateSubCategory = (_categoryId: string, subId: string, data: Partial<SubCategory>) => {
    runApiAction(async () => {
      const formData = new FormData()
      if (data.name) formData.append("title", data.name)
      if (data.image) {
        const file = await fileFromUrl(data.image, "subcategory-image")
        if (file) formData.append("image", file)
      }
      await updateSubCategoryApi(subId, formData)
      await reloadAll()
      notify.success({ title: "Sub-category updated", message: "Your changes have been saved." })
    })
  }

  const deleteSubCategory = (_categoryId: string, subId: string) => {
    runApiAction(async () => {
      await deleteSubCategoryApi(subId)
      await reloadAll()
      notify.success({ title: "Sub-category deleted", message: "The sub-category was removed." })
    })
  }

  const addProduct = (p: Product) => {
    runApiAction(async () => {
      const formData = await buildProductFormData(p, categories)
      await createProductApi(formData)
      await reloadAll()
      notify.success({ title: "Product added", message: `"${p.name}" was added successfully.` })
    })
  }

  const updateProduct = (id: string, p: Partial<Product>) => {
    runApiAction(async () => {
      const current = products.find((item) => item.id === id)
      if (!current) throw new Error("Product not found")

      const merged = { ...current, ...p }
      const formData = await buildProductFormData(merged, categories)
      await updateProductApi(id, formData)
      await reloadAll()
      notify.success({ title: "Product updated", message: "Your changes have been saved." })
    })
  }

  const deleteProduct = (id: string) => {
    runApiAction(async () => {
      await deleteProductApi(id)
      await reloadAll()
      notify.success({ title: "Product deleted", message: "Product was removed." })
    })
  }

  const copyProduct = (id: string) => {
    runApiAction(async () => {
      try {
        await copyProductApi(id)
      } catch {
        const source = products.find((item) => item.id === id)
        if (!source) {
          throw new Error("Product not found")
        }

        const copyName = source.name.endsWith(" (Copy)") ? source.name : `${source.name} (Copy)`
        const fallbackCopy: Product = {
          ...source,
          id: `tmp-copy-${Date.now()}`,
          name: copyName,
        }

        const formData = await buildProductFormData(fallbackCopy, categories)
        await createProductApi(formData)
      }
      await reloadAll()
      notify.success({ title: "Product duplicated", message: "Copied product successfully." })
    })
  }

  const addSlider = (s: Slider) => {
    runApiAction(async () => {
      const formData = new FormData()
      formData.append("title", s.title)
      formData.append("url", s.link)
      formData.append("inHomePage", "true")
      if (s.image) {
        const file = await fileFromUrl(s.image, "banner-image")
        if (file) formData.append("image", file)
      }
      await createBannerApi(formData)
      await reloadAll()
      notify.success({ title: "Banner added", message: `"${s.title}" is now in the slider.` })
    })
  }

  const updateSlider = (id: string, s: Partial<Slider>) => {
    runApiAction(async () => {
      const formData = new FormData()
      if (s.title) formData.append("title", s.title)
      if (s.link) formData.append("url", s.link)
      if (s.image) {
        const file = await fileFromUrl(s.image, "banner-image")
        if (file) formData.append("image", file)
      }
      await updateBannerApi(id, formData)
      await reloadAll()
      notify.success({ title: "Banner updated", message: "Your changes have been saved." })
    })
  }

  const deleteSlider = (id: string) => {
    runApiAction(async () => {
      await deleteBannerApi(id)
      await reloadAll()
      notify.success({ title: "Banner deleted", message: "Banner was removed." })
    })
  }

  const resetAll = () => {
    void reloadAll()
  }

  const value = useMemo(
    () => ({
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      copyProduct,
      sliders,
      addSlider,
      updateSlider,
      deleteSlider,
      resetAll,
    }),
    [categories, products, sliders],
  )

  if (!loaded) return null

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

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

const fileFromUrl = async (url: string, fallbackName: string): Promise<File | null> => {
  if (!url) return null
  try {
    // Handle data URLs (base64 images from file uploads)
    if (url.startsWith("data:")) {
      const [header, base64] = url.split(",")
      if (!base64) return null
      const mimeMatch = header.match(/:(.*?);/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const ext = mimeType.includes("png")
        ? "png"
        : mimeType.includes("webp")
          ? "webp"
          : mimeType.includes("jpeg") || mimeType.includes("jpg")
            ? "jpg"
            : "bin"
      return new File([blob], `${fallbackName}.${ext}`, { type: mimeType })
    }

    // Handle regular URLs
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const ext = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
        ? "webp"
        : blob.type.includes("jpeg") || blob.type.includes("jpg")
          ? "jpg"
          : "bin"
    return new File([blob], `${fallbackName}.${ext}`, { type: blob.type || "application/octet-stream" })
  } catch {
    return null
  }
}

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    const message =
      (typeof maybe.message === "string" && maybe.message.trim() ? maybe.message : "") ||
      (typeof maybe.error === "string" && maybe.error.trim() ? maybe.error : "")

    if (message) {
      const normalized = message.toLowerCase()
      if (
        normalized.includes("unique constraint failed") &&
        (normalized.includes("title") || normalized.includes("category"))
      ) {
        return "Category name already exists. Please use a different name."
      }
      return message
    }
  }
  return "Please try again."
}

const resolveVariantColorSize = (product: Product, variant: ProductVariant) => {
  const rawName = variant?.name?.trim() || ""
  const parts = rawName.includes("/") ? rawName.split("/") : []
  const colorCandidate = (parts[0] || product.color || rawName || "Default").trim()
  const sizeCandidate = (parts[1] || product.size || "Standard").trim()

  return {
    color: colorCandidate || "Default",
    size: sizeCandidate || "Standard",
  }
}

const buildProductFormData = async (product: Product, categories: Category[]) => {
  const category = categories.find((c) => c.slug === product.categorySlug)
  const subCategory = category?.subCategories.find((s) => s.slug === product.subCategorySlug)

  if (!category?.id || !subCategory?.id) {
    throw new Error("Category or sub-category is not valid")
  }

  const variants = (product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: "default",
          name: product.color || "Default",
          price: product.price || 0,
          cutPrice: product.cutPrice || product.price || 0,
          stock: product.stock || 0,
          image: product.images?.[0],
        },
      ]) as ProductVariant[]

  const variantPayload = variants.map((variant) => {
    const actualPrice = Math.max(Number(variant.cutPrice || 0), Number(variant.price || 0))
    const discountedPrice = Math.min(Number(variant.price || 0), actualPrice)
    const { color, size } = resolveVariantColorSize(product, variant)

    return {
      actualPrice,
      discountedPrice,
      color,
      size,
      image: variant.image || product.images?.[0] || "",
    }
  })

  const formData = new FormData()
  const descriptionHtml = toHtml(product.description || "N/A")
  const descriptionPlain = htmlToPlainText(descriptionHtml) || "N/A"

  formData.append("categoryId", category.id)
  formData.append("subCategoryId", subCategory.id)
  formData.append("title", product.name?.trim() || "Untitled Product")
  formData.append("descriptionDelta", JSON.stringify(toQuillDelta(descriptionPlain)))
  formData.append("descriptionHtml", descriptionHtml)
  if (product.extraDescription?.trim()) {
    const extraHtml = toHtml(product.extraDescription)
    const extraPlain = htmlToPlainText(extraHtml) || "N/A"
    formData.append("extraDescriptionDelta", JSON.stringify(toQuillDelta(extraPlain)))
    formData.append("extraDescriptionHtml", extraHtml)
  }
  formData.append("weight", product.weight?.trim() || "N/A")
  formData.append("material", product.material?.trim() || "N/A")
  formData.append("stock", String((product.stock || 0) > 0))
  formData.append("availability", "true")
  formData.append("status", (product.status || "PENDING").toUpperCase())
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

export function useAdminStore() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdminStore must be used within AdminDataProvider")
  return ctx
}
