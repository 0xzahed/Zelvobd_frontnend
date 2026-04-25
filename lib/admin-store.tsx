"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { notify } from "@/lib/notify"
import type { Category, Product, Slider, SubCategory } from "@/lib/types"
import { getCategories } from "@/src/api/category/getCategories"
import { createCategory as createCategoryApi } from "@/src/api/category/createCategory"
import { updateCategory as updateCategoryApi } from "@/src/api/category/updateCategory"
import { deleteCategory as deleteCategoryApi } from "@/src/api/category/deleteCategory"
import { createSubCategory as createSubCategoryApi } from "@/src/api/subCategory/createSubCategory"
import { updateSubCategory as updateSubCategoryApi } from "@/src/api/subCategory/updateSubCategory"
import { deleteSubCategory as deleteSubCategoryApi } from "@/src/api/subCategory/deleteSubCategory"
import { getProducts } from "@/src/api/products/getProducts"
import { deleteProduct as deleteProductApi } from "@/src/api/products/deleteProduct"
import { copyProduct as copyProductApi } from "@/src/api/products/copyProduct"
import { getBanners } from "@/src/api/banner/getBanners"
import { createBanner as createBannerApi } from "@/src/api/banner/createBanner"
import { updateBanner as updateBannerApi } from "@/src/api/banner/updateBanner"
import { deleteBanner as deleteBannerApi } from "@/src/api/banner/deleteBanner"
import { mapBanner, mapCategory, mapProduct } from "@/src/api/_shared/mappers"

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
    const [categoriesRes, productsRes, bannersRes] = await Promise.all([
      getCategories({ limit: 100 }),
      getProducts({ limit: 200 }),
      getBanners(),
    ])

    setCategories((categoriesRes?.data?.categories || []).map(mapCategory))
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

  const addCategory = (c: Category) => {
    void (async () => {
      const formData = new FormData()
      formData.append("title", c.name)
      if (c.image?.startsWith("http")) formData.append("image", c.image)
      await createCategoryApi(formData)
      await reloadAll()
      notify.success({ title: "Category added", message: `"${c.name}" was added successfully.` })
    })()
  }

  const updateCategory = (id: string, c: Partial<Category>) => {
    void (async () => {
      const formData = new FormData()
      if (c.name) formData.append("title", c.name)
      if (c.image?.startsWith("http")) formData.append("image", c.image)
      await updateCategoryApi(id, formData)
      await reloadAll()
      notify.success({ title: "Category updated", message: "Your changes have been saved." })
    })()
  }

  const deleteCategory = (id: string) => {
    void (async () => {
      await deleteCategoryApi(id)
      await reloadAll()
      notify.success({ title: "Category deleted", message: "Category was removed." })
    })()
  }

  const addSubCategory = (categoryId: string, sub: SubCategory) => {
    void (async () => {
      const formData = new FormData()
      formData.append("categoryId", categoryId)
      formData.append("title", sub.name)
      if (sub.image?.startsWith("http")) formData.append("image", sub.image)
      await createSubCategoryApi(formData)
      await reloadAll()
      notify.success({ title: "Sub-category added", message: `"${sub.name}" is now available.` })
    })()
  }

  const updateSubCategory = (_categoryId: string, subId: string, data: Partial<SubCategory>) => {
    void (async () => {
      const formData = new FormData()
      if (data.name) formData.append("title", data.name)
      if (data.image?.startsWith("http")) formData.append("image", data.image)
      await updateSubCategoryApi(subId, formData)
      await reloadAll()
      notify.success({ title: "Sub-category updated", message: "Your changes have been saved." })
    })()
  }

  const deleteSubCategory = (_categoryId: string, subId: string) => {
    void (async () => {
      await deleteSubCategoryApi(subId)
      await reloadAll()
      notify.success({ title: "Sub-category deleted", message: "The sub-category was removed." })
    })()
  }

  const addProduct = (p: Product) => {
    setProducts((prev) => [p, ...prev])
    notify.success({ title: "Product updated in UI", message: "Connect product multipart payload to save on backend." })
  }

  const updateProduct = (id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...p } : item)))
    notify.success({ title: "Product updated in UI", message: "Connect product multipart payload to save on backend." })
  }

  const deleteProduct = (id: string) => {
    void (async () => {
      await deleteProductApi(id)
      await reloadAll()
      notify.success({ title: "Product deleted", message: "Product was removed." })
    })()
  }

  const copyProduct = (id: string) => {
    void (async () => {
      await copyProductApi(id)
      await reloadAll()
      notify.success({ title: "Product duplicated", message: "Copied product successfully." })
    })()
  }

  const addSlider = (s: Slider) => {
    void (async () => {
      const formData = new FormData()
      formData.append("title", s.title)
      formData.append("url", s.link)
      formData.append("inHomePage", "true")
      if (s.image?.startsWith("http")) formData.append("image", s.image)
      await createBannerApi(formData)
      await reloadAll()
      notify.success({ title: "Banner added", message: `"${s.title}" is now in the slider.` })
    })()
  }

  const updateSlider = (id: string, s: Partial<Slider>) => {
    void (async () => {
      const formData = new FormData()
      if (s.title) formData.append("title", s.title)
      if (s.link) formData.append("url", s.link)
      if (s.image?.startsWith("http")) formData.append("image", s.image)
      await updateBannerApi(id, formData)
      await reloadAll()
      notify.success({ title: "Banner updated", message: "Your changes have been saved." })
    })()
  }

  const deleteSlider = (id: string) => {
    void (async () => {
      await deleteBannerApi(id)
      await reloadAll()
      notify.success({ title: "Banner deleted", message: "Banner was removed." })
    })()
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

export function useAdminStore() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdminStore must be used within AdminDataProvider")
  return ctx
}
