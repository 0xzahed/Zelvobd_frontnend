"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Battery,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HardDrive,
  ListChecks,
  Maximize2,
  Minus,
  Monitor,
  Plus,
  Share2,
  Smartphone,
  Weight,
  Wifi,
  X,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { useCart } from "@/contexts/cart-context"
import { ProductCard } from "@/components/ui/product-card"

function colorToHex(name: string): string {
  const key = name.toLowerCase()
  const map: Record<string, string> = {
    black: "#111827",
    "black titanium": "#1f2937",
    white: "#F3F4F6",
    "white titanium": "#E5E7EB",
    silver: "#C0C4CC",
    gold: "#E9C687",
    "rose gold": "#E6B8A2",
    blue: "#2563EB",
    "blue titanium": "#4A5A70",
    "midnight blue": "#1E3A5F",
    "natural titanium": "#A9A299",
    "desert titanium": "#C8B5A3",
    red: "#DC2626",
    green: "#16A34A",
    pink: "#F472B6",
    purple: "#8B5CF6",
    gray: "#6B7280",
    grey: "#6B7280",
    brown: "#8B5E3C",
    beige: "#D6C6A8",
    navy: "#1E3A8A",
    graphite: "#3A3A3A",
    midnight: "#1B1F2A",
  }
  if (map[key]) return map[key]
  for (const k of Object.keys(map)) {
    if (key.includes(k)) return map[k]
  }
  return "#9CA3AF"
}

function featureIcon(feature: string): LucideIcon {
  const f = feature.toLowerCase()
  if (/(screen|display|inch|amoled|oled|lcd|retina|hz)/.test(f)) return Monitor
  if (/(battery|mah|wh)/.test(f)) return Battery
  if (/(storage|gb|tb|rom|ssd|memory card)/.test(f)) return HardDrive
  if (/(camera|mp|lens|mega ?pixel|photo|video)/.test(f)) return Camera
  if (/(chip|processor|cpu|gpu|snapdragon|bionic|tensor|dimensity|ram)/.test(f)) return Cpu
  if (/(weight|grams|kg|light)/.test(f)) return Weight
  if (/(charge|fast|watt|\bw\b)/.test(f)) return Zap
  if (/(5g|4g|wifi|wi-fi|bluetooth|connectivity|nfc)/.test(f)) return Wifi
  return Smartphone
}

function WhatsAppFab({ number }: { number: string }) {
  const href = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=Hi%20EcoMerce%2C%20I%20have%20a%20question`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#22C55E] text-white shadow-[0_8px_20px_rgba(34,197,94,0.4)] md:bottom-6"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M19.11 17.2c-.26-.13-1.52-.75-1.76-.83s-.41-.13-.58.13-.67.83-.82 1-.3.2-.56.07a7.1 7.1 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.45-1.8c-.15-.26 0-.4.11-.53s.26-.3.4-.44a1.7 1.7 0 0 0 .26-.44.48.48 0 0 0 0-.46c-.07-.13-.58-1.4-.8-1.92s-.42-.44-.58-.45h-.5a1 1 0 0 0-.7.33 2.92 2.92 0 0 0-.91 2.17 5.07 5.07 0 0 0 1.06 2.7 11.6 11.6 0 0 0 4.44 3.92 14.9 14.9 0 0 0 1.48.55 3.56 3.56 0 0 0 1.63.1 2.67 2.67 0 0 0 1.76-1.24 2.16 2.16 0 0 0 .15-1.24c-.06-.1-.24-.17-.5-.3zM16 6a10 10 0 0 0-8.36 15.5L6 26l4.64-1.6A10 10 0 1 0 16 6zm0 18.26a8.24 8.24 0 0 1-4.23-1.16l-.3-.18-2.75.95.93-2.69-.2-.3a8.26 8.26 0 1 1 6.55 3.38z" />
      </svg>
    </a>
  )
}

const VISIBLE_THUMBS = 4

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter()
  const { addItem } = useCart()

  const gallery =
    product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  const [imgIdx, setImgIdx] = useState(0)
  const [color, setColor] = useState<string | undefined>(product.colors?.[0])
  const [storage, setStorage] = useState<string | undefined>(product.storage?.[0])
  const [qty, setQty] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const variantScrollRef = useRef<HTMLDivElement>(null)

  const colorList = product.colors ?? []
  const hasColors = colorList.length > 0

  // Link color ↔ image by index
  const pickImage = (i: number) => {
    setImgIdx(i)
    if (hasColors) {
      const mapped = colorList[i % colorList.length]
      if (mapped) setColor(mapped)
    }
  }
  const pickColor = (c: string) => {
    setColor(c)
    const idx = colorList.indexOf(c)
    if (idx >= 0 && idx < gallery.length) setImgIdx(idx)
  }

  const handleAdd = () => {
    addItem({ productId: product.id, quantity: qty, color, storage })
  }
  const handleBuy = () => {
    addItem({ productId: product.id, quantity: qty, color, storage })
    router.push("/cart")
  }

  // Scroll the thumbnail row left/right by one "page" worth of thumbnails.
  const scrollThumbs = (dir: "left" | "right") => {
    const el = variantScrollRef.current
    if (!el) return
    const delta = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" })
  }

  // Mouse drag-to-scroll for the thumbnail row (desktop).
  const dragState = useRef<{ active: boolean; startX: number; startLeft: number; moved: boolean }>({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  })
  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = variantScrollRef.current
    if (!el) return
    dragState.current = {
      active: true,
      startX: e.pageX,
      startLeft: el.scrollLeft,
      moved: false,
    }
  }
  const onDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = variantScrollRef.current
    const s = dragState.current
    if (!el || !s.active) return
    const dx = e.pageX - s.startX
    if (Math.abs(dx) > 4) s.moved = true
    el.scrollLeft = s.startLeft - dx
  }
  const onDragEnd = () => {
    dragState.current.active = false
  }

  return (
    <div className="pb-28 md:pb-8">
      {/* Mobile sub-header */}
      <div className="-mx-4 flex items-center justify-between bg-background px-4 py-2 md:hidden">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button aria-label="Share" className="grid h-9 w-9 place-items-center rounded-full bg-card">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 py-3 md:grid-cols-2 md:gap-10 md:py-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
            <Image
              src={gallery[imgIdx] || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="View image"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-foreground shadow-md transition hover:bg-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Thumbnails — horizontally scrollable: arrow buttons on desktop, drag/swipe everywhere */}
          <div className="group relative">
            <div
              ref={variantScrollRef}
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              className="-mx-1 flex cursor-grab gap-3 overflow-x-auto px-1 pb-1 snap-x scroll-smooth select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {gallery.map((src, i) => {
                const selected = imgIdx === i
                return (
                  <button
                    key={i}
                    onClick={() => {
                      // Don't treat a drag as a click
                      if (dragState.current.moved) return
                      pickImage(i)
                    }}
                    aria-label={`View image ${i + 1}`}
                    className={cx(
                      "relative aspect-square shrink-0 snap-start overflow-hidden rounded-md bg-white transition",
                      "w-[calc((100%-3rem)/4.3)]",
                      selected ? "border-2 border-[#3B6CF4]" : "border border-border/50",
                    )}
                  >
                    <Image
                      src={src || "/placeholder.svg"}
                      alt=""
                      fill
                      className="object-cover p-2"
                      draggable={false}
                    />
                  </button>
                )
              })}
            </div>

            {/* Desktop arrow controls */}
            {gallery.length > VISIBLE_THUMBS && (
              <>
                <button
                  type="button"
                  onClick={() => scrollThumbs("left")}
                  aria-label="Scroll thumbnails left"
                  className="absolute left-0 top-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-white text-foreground shadow-sm transition hover:bg-card md:grid"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollThumbs("right")}
                  aria-label="Scroll thumbnails right"
                  className="absolute right-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-border/60 bg-white text-foreground shadow-sm transition hover:bg-card md:grid"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info — flat on page background, no inner cards */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-pretty text-sm font-medium leading-snug text-foreground md:text-base">
              {product.name}
            </h1>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground md:text-base">{formatBDT(product.price)}</span>
                {product.cutPrice > product.price && (
                  <span className="text-[11px] text-muted-foreground line-through md:text-xs">
                    {formatBDT(product.cutPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                  className="grid h-7 w-7 place-items-center rounded-full border border-border/70 bg-card text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase"
                  className="grid h-7 w-7 place-items-center rounded-full border border-border/70 bg-card text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {product.brand && (
              <p className="text-xs text-muted-foreground">
                by{" "}
                <Link href="#" className="font-medium text-[#3B6CF4]">
                  {product.brand}
                </Link>
              </p>
            )}
          </div>

          {/* Colors — 2-column pills, outlined style */}
          {hasColors && (
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Color</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {colorList.map((c) => {
                  const selected = color === c
                  return (
                    <button
                      key={c}
                      onClick={() => pickColor(c)}
                      aria-pressed={selected}
                      className={cx(
                        "flex items-center gap-2 rounded-full border bg-transparent px-2 py-1.5 text-left transition",
                        selected
                          ? "border-[#3B6CF4] text-[#3B6CF4]"
                          : "border-border/60 text-foreground hover:border-border",
                      )}
                    >
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-border/40"
                        style={{ backgroundColor: colorToHex(c) }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-xs">{c}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Storage — outline-only pills */}
          {product.storage && product.storage.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Storage</p>
              <div className="flex flex-wrap gap-2">
                {product.storage.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStorage(s)}
                    className={cx(
                      "rounded-full border bg-transparent px-3 py-1 text-xs transition",
                      storage === s
                        ? "border-[#3B6CF4] text-[#3B6CF4]"
                        : "border-border/60 text-foreground hover:border-border",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Snapshot — heading gets an icon */}
          {product.features.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <ListChecks className="h-4 w-4 text-[#3B6CF4]" strokeWidth={1.75} />
                A Snapshot View
              </h3>
              <ul className="space-y-2">
                {product.features.map((f, i) => {
                  const Icon = featureIcon(f)
                  return (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/90 md:text-sm">
                      <Icon className="h-4 w-4 shrink-0 text-[#3B6CF4]" strokeWidth={1.75} />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-border/40 pt-3">
              <h3 className="mb-2 text-xs font-medium text-foreground">Description</h3>
              <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{product.description}</p>
            </div>
          )}

          {/* Desktop buttons */}
          <div className="hidden gap-3 md:flex">
            <button
              onClick={handleBuy}
              className="h-11 flex-1 rounded-full border border-[#3B6CF4] bg-white text-sm font-semibold text-[#3B6CF4]"
            >
              Buy Now
            </button>
            <button
              onClick={handleAdd}
              className="h-11 flex-1 rounded-full bg-[#3B6CF4] text-sm font-semibold text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-6 space-y-3 md:mt-10">
          <h2 className="text-sm font-semibold text-foreground md:text-lg">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-border/40 bg-card p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden">
        <button
          onClick={handleBuy}
          className="h-11 flex-1 rounded-full border border-[#3B6CF4] bg-white text-sm font-semibold text-[#3B6CF4]"
        >
          Buy Now
        </button>
        <button
          onClick={handleAdd}
          className="h-11 flex-1 rounded-full bg-[#3B6CF4] text-sm font-semibold text-white"
        >
          Add to Cart
        </button>
      </div>

      <WhatsAppFab number={product.whatsapp} />

      {/* Zoom Modal */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div
            className="relative max-h-full w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[imgIdx] || "/placeholder.svg"}
              alt={product.name}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => pickImage(i)}
                  className={cx(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white",
                    imgIdx === i ? "border-[#3B6CF4]" : "border-white/30",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
