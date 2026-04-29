import Link from "next/link"
import type { SubCategory } from "@/lib/types"

export function SubCategoryTile({
  categorySlug,
  sub,
}: {
  categorySlug: string
  sub: SubCategory
}) {
  return (
    <Link
      href={`/category/${categorySlug}/${sub.slug}`}
      className="flex aspect-square flex-col items-center justify-between overflow-hidden rounded-lg bg-card p-1.5 transition hover:-translate-y-0.5 md:rounded-md md:p-1"
    >
      <div className="relative w-full flex-1 overflow-hidden rounded-md bg-muted">
        {sub.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sub.image || "/placeholder.svg"}
            alt={sub.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
      <span className="mt-1 line-clamp-1 w-full px-1 text-center text-[11px] leading-tight text-foreground md:text-[10px]">
        {sub.name}
      </span>
    </Link>
  )
}
