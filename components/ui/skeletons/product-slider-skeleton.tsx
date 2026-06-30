import { ChevronRight } from "lucide-react"
import { ProductCardSkeleton } from "./product-card-skeleton"

export function ProductSliderSkeleton({ title, highlight }: { title: string; highlight?: string }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground md:text-xl">
          {title}{" "}
          {highlight && (
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
            >
              {highlight}
            </span>
          )}
        </h2>
        <div className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground md:text-xs">
          See All <ChevronRight className="h-3 w-3" />
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-1 overflow-x-hidden pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]"
            >
              <ProductCardSkeleton compact={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
