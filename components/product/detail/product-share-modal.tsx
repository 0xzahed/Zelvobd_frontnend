"use client"

import { useState } from "react"
import { Share2, Download, X } from "lucide-react"

export function ProductShareModal({ 
  productName, 
  variantColor, 
  barcodeUrl 
}: { 
  productName: string
  variantColor?: string
  barcodeUrl?: string 
}) {
  const [open, setOpen] = useState(false)

  if (!barcodeUrl) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(barcodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const safeName = productName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const safeColor = variantColor ? `-${variantColor.replace(/[^a-z0-9]/gi, '-').toLowerCase()}` : ''
      link.download = `${safeName}${safeColor}-barcode.png`
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download barcode", error)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share"
        className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card text-foreground hover:bg-secondary"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 text-lg font-semibold text-foreground text-center">Share Product Barcode</h3>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-full bg-white p-4 rounded-md flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={barcodeUrl} alt="Product Barcode" className="max-w-full h-auto object-contain" />
              </div>
              <button
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Download Barcode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
