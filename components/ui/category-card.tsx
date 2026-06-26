"use client"

import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex w-full flex-col items-center gap-2 transition hover:-translate-y-0.5"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-full bg-[#F3F4F6] p-3">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 28vw, 10vw"
            className="object-contain"
          />
        </div>
      </div>
      <span className="shrink-0 truncate text-center text-xs font-medium text-muted-foreground">
        {category.name}
      </span>
    </Link>
  )
}

export function SubCategoryCard({ subCategory, categorySlug }: { subCategory: any; categorySlug: string }) {
  return (
    <Link
      href={`/category/${categorySlug}/${subCategory.slug}`}
      className="flex w-full flex-col items-center gap-2 transition hover:-translate-y-0.5"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-full bg-[#F3F4F6] p-3">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            src={subCategory.image || "/placeholder.svg"}
            alt={subCategory.name}
            fill
            sizes="(max-width: 768px) 28vw, 10vw"
            className="object-contain"
          />
        </div>
      </div>
      <span className="shrink-0 truncate text-center text-xs font-medium text-muted-foreground">
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
      className="flex w-full flex-col items-center gap-2 transition hover:-translate-y-0.5"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-full bg-[#F3F4F6] p-3">
        <div className="grid h-10 w-10 grid-cols-2 grid-rows-2 place-items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      </div>
      <span className="shrink-0 truncate text-center text-xs font-medium text-muted-foreground">
        More
      </span>
    </Link>
  )
}
