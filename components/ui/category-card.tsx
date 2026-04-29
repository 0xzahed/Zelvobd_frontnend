"use client"

import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex aspect-square w-full flex-col overflow-hidden rounded-md bg-card p-1.5 shadow-sm transition hover:-translate-y-0.5 md:rounded-sm md:p-1"
    >
      <div className="relative w-full flex-1 overflow-hidden rounded-sm">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 33vw, 12vw"
          className="object-cover"
        />
      </div>
      <span className="mt-1 shrink-0 truncate px-1 text-center text-xs font-medium leading-tight text-foreground md:text-[11px]">
        {category.name}
      </span>
    </Link>
  )
}

export function MoreCategoriesCard({ extras: _extras }: { extras: Category[] }) {
  return (
    <Link
      href="/categories"
      aria-label="See more categories"
      className="flex aspect-square w-full flex-col overflow-hidden rounded-md bg-card p-1.5 shadow-sm transition hover:-translate-y-0.5 md:rounded-sm md:p-1"
    >
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-sm bg-card">
        <div className="grid h-12 w-12 grid-cols-2 grid-rows-2 place-items-center gap-1.5 rounded-full bg-secondary p-3 md:h-14 md:w-14 md:gap-2">
          <span className="h-2 w-2 rounded-full bg-primary md:h-2.5 md:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-primary md:h-2.5 md:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-primary md:h-2.5 md:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-primary md:h-2.5 md:w-2.5" />
        </div>
      </div>
      <span className="mt-1 shrink-0 truncate px-1 text-center text-xs font-medium leading-tight text-foreground md:text-[11px]">
        More
      </span>
    </Link>
  )
}
