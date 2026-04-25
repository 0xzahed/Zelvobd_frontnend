"use client"

import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex flex-col overflow-hidden rounded-md bg-card p-1.5 shadow-sm transition hover:-translate-y-0.5 md:rounded-sm md:p-1"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm md:rounded-sm">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 33vw, 12vw"
          className="object-cover"
        />
      </div>
      <span className="mt-1.5 truncate px-1 pb-0.5 text-center text-xs font-medium text-foreground md:mt-1 md:text-[11px]">
        {category.name}
      </span>
    </Link>
  )
}

export function MoreCategoriesCard({ extras }: { extras: Category[] }) {
  const tiles = extras.slice(0, 4)
  return (
    <Link
      href="/categories"
      className="flex flex-col overflow-hidden rounded-md bg-card p-1.5 shadow-sm transition hover:-translate-y-0.5 md:rounded-sm md:p-1"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm md:rounded-sm">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
          {tiles.map((c) => (
            <div key={c.id} className="relative overflow-hidden">
              <Image
                src={c.image || "/placeholder.svg"}
                alt={c.name}
                fill
                sizes="6vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <span className="mt-1.5 truncate px-1 pb-0.5 text-center text-xs font-medium text-foreground md:mt-1 md:text-[11px]">
        More
      </span>
    </Link>
  )
}
