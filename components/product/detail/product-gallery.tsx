"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cx } from "@/lib/format"

const VISIBLE_THUMBS = 4

interface ProductGalleryProps {
  images: string[]
  productName: string
  activeImageIndex: number
  onImageChange: (index: number) => void
}

export function ProductGallery({ images, productName, activeImageIndex, onImageChange }: ProductGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false)
  const variantScrollRef = useRef<HTMLDivElement>(null)

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

  const scrollThumbs = (dir: "left" | "right") => {
    const el = variantScrollRef.current
    if (!el) return
    const delta = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" })
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="View image"
        className="relative block w-full aspect-square overflow-hidden rounded-lg bg-white"
      >
        <Image
          src={images[activeImageIndex] || "/placeholder.svg"}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="group relative">
          <div
            ref={variantScrollRef}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            className="-mx-1 flex cursor-grab gap-3 overflow-x-auto px-1 pb-1 snap-x scroll-smooth select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => {
              const selected = activeImageIndex === i
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (dragState.current.moved) return
                    onImageChange(i)
                  }}
                  aria-label={`View image ${i + 1}`}
                  className={cx(
                    "relative aspect-square shrink-0 snap-start overflow-hidden rounded-md bg-white transition",
                    "w-[calc((100%-3rem)/4.3)]",
                    selected ? "border-2 border-primary" : "border border-border/50",
                  )}
                >
                  <Image src={src || "/placeholder.svg"} alt="" fill className="object-cover p-2" draggable={false} />
                </button>
              )
            })}
          </div>

          {images.length > VISIBLE_THUMBS && (
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
      )}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative flex flex-col items-center w-full max-w-[min(100%,75vh)]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomOpen(false)}
              aria-label="Close"
              className="absolute -top-12 right-0 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-foreground transition hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-white shadow-2xl">
              <Image
                src={images[activeImageIndex] || "/placeholder.svg"}
                alt={productName}
                fill
                className="object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto w-full pb-1 snap-x">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => onImageChange(i)}
                    className={cx(
                      "relative h-16 w-16 shrink-0 snap-center overflow-hidden rounded-md border bg-white transition",
                      activeImageIndex === i ? "border-primary border-2" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={src || "/placeholder.svg"} alt="" fill className="object-cover p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
