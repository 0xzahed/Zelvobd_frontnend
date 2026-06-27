"use client"

import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex w-full flex-col items-center gap-1.5"
    >
      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#F3F4F6] transition-all duration-200 group-hover:-translate-y-1 group-hover:bg-[#E8EAF0] sm:h-[76px] sm:w-[76px]">
        <div className="relative h-[48px] w-[48px] sm:h-[54px] sm:w-[54px]">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            sizes="76px"
            className="object-cover rounded-full"
          />
        </div>
      </div>
      <span className="w-full truncate text-center text-[11px] font-semibold leading-tight text-[#374151] sm:text-xs">
        {category.name}
      </span>
    </Link>
  )
}

export function SubCategoryCard({ subCategory, categorySlug }: { subCategory: any; categorySlug: string }) {
  return (
    <Link
      href={`/category/${categorySlug}/${subCategory.slug}`}
      className="group flex w-full flex-col items-center gap-2"
    >
      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#f5f5f7] transition-transform duration-200 group-active:scale-95 sm:h-[76px] sm:w-[76px]">
        <div className="relative h-[46px] w-[46px] sm:h-[52px] sm:w-[52px]">
          <Image
            src={subCategory.image || "/placeholder.svg"}
            alt={subCategory.name}
            fill
            sizes="76px"
            className="object-contain"
          />
        </div>
      </div>
      <span className="w-full max-w-[76px] truncate text-center text-[11px] font-semibold leading-tight text-[#374151] sm:max-w-[84px] sm:text-xs">
        {subCategory.name}
      </span>
    </Link>
  )
}

export function MoreCategoriesCard({ extras: _extras }: { extras: Category[] }) {
  return (
    <Link
      href="/categories"
      aria-label="See more categories"
      className="group flex w-full flex-col items-center gap-2"
    >
      <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#f5f5f7] transition-transform duration-200 group-active:scale-95 sm:h-[76px] sm:w-[76px]">
        <div className="grid h-8 w-8 grid-cols-2 grid-rows-2 place-items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#374151]" />
          <span className="h-2 w-2 rounded-full bg-[#374151]" />
          <span className="h-2 w-2 rounded-full bg-[#374151]" />
          <span className="h-2 w-2 rounded-full bg-[#374151]" />
        </div>
      </div>
      <span className="w-full max-w-[76px] truncate text-center text-[11px] font-semibold leading-tight text-[#374151] sm:max-w-[84px] sm:text-xs">
        More
      </span>
    </Link>
  )
}
