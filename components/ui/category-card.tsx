"use client"

import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex aspect-square w-full flex-col overflow-hidden rounded-sm bg-card p-px shadow-sm transition hover:-translate-y-0.5"
    >
      <div className="relative w-full flex-1 overflow-hidden rounded-sm">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 28vw, 10vw"
          className="object-cover"
        />
      </div>
      <span className="mt-1 shrink-0 truncate px-1 pb-2 text-center text-xs font-medium leading-tight text-foreground">
        {category.name}
      </span>
    </Link>
  )
}

export function SubCategoryCard({ subCategory, categorySlug }: { subCategory: any; categorySlug: string }) {
  return (
    <Link
      href={`/category/${categorySlug}/${subCategory.slug}`}
      className="flex aspect-square w-full flex-col overflow-hidden rounded-sm bg-card p-px shadow-sm transition hover:-translate-y-0.5"
    >
      <div className="relative w-full flex-1 overflow-hidden rounded-sm">
        <Image
          src={subCategory.image || "/placeholder.svg"}
          alt={subCategory.name}
          fill
          sizes="(max-width: 768px) 28vw, 10vw"
          className="object-cover"
        />
      </div>
      <span className="mt-1 shrink-0 truncate px-1 pb-2 text-center text-xs font-medium leading-tight text-foreground">
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
      className="flex aspect-square w-full flex-col overflow-hidden rounded-sm bg-card p-px shadow-sm transition hover:-translate-y-0.5"
    >
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-sm bg-card">
        <div className="grid h-12 w-12 grid-cols-2 grid-rows-2 place-items-center gap-1 rounded-full bg-secondary p-2 md:h-13 md:w-13">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      </div>
      <span className="mt-px shrink-0 truncate px-px text-center text-[9px] font-medium leading-tight text-foreground">
        More
      </span>
    </Link>
  )
}
