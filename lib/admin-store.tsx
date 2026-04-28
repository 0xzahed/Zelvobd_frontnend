"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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
import { fileFromUrl, handleApiError } from "@/lib/api-utils"

type AdminStore = {
  categories: Category[]
  loadCategories: () => Promise<void>
  loadSubCategoriesByCategory: (categoryId: string) => Promise<void>
  addCategory: (c: Category) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addSubCategory: (categoryId: string, sub: SubCategory) => void
  updateSubCategory: (categoryId: string, subId: string, data: Partial<SubCategory>) => void
  deleteSubCategory: (categoryId: string, subId: string) => void
  products: Product[]
  loadProducts: () => Promise<void>
  addProduct: (p: Product) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  copyProduct: (id: string) => void
  sliders: Slider[]
  loadSliders: () => Promise<void>
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

  const loadCategories = useCallback(async () => {
    try {
      const categoriesRes = await getCategories({ limit: 100 })
      const categoryList: Category[] = (categoriesRes?.data?.categories || []).map(mapCategory)

      setCategories((prev) => {
        const previousSubCategoriesByCategoryId = new Map<string, Category["subCategories"]>()
        for (const category of prev) {
          previousSubCategoriesByCategoryId.set(category.id, category.subCategories || [])
        }

        return categoryList.map((category) => ({
          ...category,
          subCategories: previousSubCategoriesByCategoryId.get(category.id) || [],
        }))
      })
    } catch (error) {
      handleApiError(error, "Failed to load categories")
    }
  }, [])

  const loadSubCategoriesByCategory = useCallback(async (categoryId: string) => {
    if (!categoryId) return

    try {
      const subCategoriesRes = await getSubCategories({ limit: 100, categoryId })
      const subCategoryList: any[] = (subCategoriesRes?.data?.subCategories || []).map(mapSubCategory)

      const mappedSubCategories: Category["subCategories"] = subCategoryList.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        image: sub.image,
      }))

      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                subCategories: mappedSubCategories,
              }
            : category,
        ),
      )
    } catch (error) {
      handleApiError(error, "Failed to load sub-categories")
    }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const productsRes = await getProducts({ limit: 100 })
      setProducts((productsRes?.data?.products || []).map(mapProduct))
    } catch (error) {
      handleApiError(error, "Failed to load products")
    }
  }, [])

  const loadSliders = useCallback(async () => {
    try {
      const bannersRes = await getBanners()
      setSliders((bannersRes?.data || []).map(mapBanner))
    } catch (error) {
      handleApiError(error, "Failed to load sliders")
    }
  }, [])

  const runApiAction = (action: () => Promise<void>) => {
    void (async () => {
      try {
        await action()
      } catch (error) {
        handleApiError(error)
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
      await loadCategories()
      notify.success({ title: "Success", message: `Category "${c.name}" added.` })
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
      await loadCategories()
      notify.success({ title: "Updated", message: "Category changes saved." })
    })
  }

  const deleteCategory = (id: string) => {
    runApiAction(async () => {
      await deleteCategoryApi(id)
      await loadCategories()
      notify.success({ title: "Deleted", message: "Category removed." })
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
      await loadSubCategoriesByCategory(categoryId)
      notify.success({ title: "Success", message: `Sub-category "${sub.name}" added.` })
    })
  }

  const updateSubCategory = (categoryId: string, subId: string, data: Partial<SubCategory>) => {
    runApiAction(async () => {
      const formData = new FormData()
      if (data.name) formData.append("title", data.name)
      if (data.image) {
        const file = await fileFromUrl(data.image, "subcategory-image")
        if (file) formData.append("image", file)
      }
      await updateSubCategoryApi(subId, formData)
      if (categoryId) {
        await loadSubCategoriesByCategory(categoryId)
      } else {
        await loadCategories()
      }
      notify.success({ title: "Updated", message: "Sub-category changes saved." })
    })
  }

  const deleteSubCategory = (categoryId: string, subId: string) => {
    runApiAction(async () => {
      await deleteSubCategoryApi(subId)
      if (categoryId) {
        await loadSubCategoriesByCategory(categoryId)
      } else {
        await loadCategories()
      }
      notify.success({ title: "Deleted", message: "Sub-category removed." })
    })
  }

  const addProduct = (p: Product) => {
    runApiAction(async () => {
      const formData = await buildProductFormData(p, categories)
      await createProductApi(formData)
      await loadProducts()
      notify.success({ title: "Success", message: `Product "${p.name}" added.` })
    })
  }

  const updateProduct = (id: string, p: Partial<Product>) => {
    runApiAction(async () => {
      const current = products.find((item) => item.id === id)
      if (!current) throw new Error("Product not found")

      const merged = { ...current, ...p }
      const formData = await buildProductFormData(merged, categories)
      await updateProductApi(id, formData)
      await loadProducts()
      notify.success({ title: "Updated", message: "Product changes saved." })
    })
  }

  const deleteProduct = (id: string) => {
    runApiAction(async () => {
      await deleteProductApi(id)
      await loadProducts()
      notify.success({ title: "Deleted", message: "Product removed." })
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
      await loadProducts()
      notify.success({ title: "Success", message: "Product duplicated." })
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
      await loadSliders()
      notify.success({ title: "Success", message: "Banner added to slider." })
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
      await loadSliders()
      notify.success({ title: "Updated", message: "Banner changes saved." })
    })
  }

  const deleteSlider = (id: string) => {
    runApiAction(async () => {
      await deleteBannerApi(id)
      await loadSliders()
      notify.success({ title: "Deleted", message: "Banner removed." })
    })
  }

  const resetAll = () => {
    void (async () => {
      await loadCategories()
      await loadProducts()
      await loadSliders()
    })()
  }

  const value = useMemo(
    () => ({
      categories,
      loadCategories,
      loadSubCategoriesByCategory,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubCategory,
      updateSubCategory,
      deleteSubCategory,
      products,
      loadProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      copyProduct,
      sliders,
      loadSliders,
      addSlider,
      updateSlider,
      deleteSlider,
      resetAll,
    }),
    [
      categories,
      products,
      sliders,
      loadCategories,
      loadSubCategoriesByCategory,
      loadProducts,
      loadSliders,
    ],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

/**
 * INTERNAL HELPERS (Should eventually move to lib/api-utils.ts if used outside)
 */

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
