"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Quill from "quill"
import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL } from "@/src/api/_shared/client"
import { notify } from "@/lib/notify"

import LucideIconBlot from "./quill/quill-icon-blot"
import { LucideIconModal } from "./quill/lucide-icon-modal"
import "./quill/quill-custom.css"

type QuillEditorProps = {
  label: string
  value: string
  onChange: (html: string, delta?: any) => void
  placeholder?: string
  required?: boolean
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"]
const FONT_FAMILIES = ["Roboto", "Poppins", "Montserrat", "Open Sans", "Lato"]

const TOOLBAR = [
  [{ font: FONT_FAMILIES }],
  [{ size: FONT_SIZES }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "blockquote", "code-block", "image", "lucideIcon"],
  ["clean"],
]

const FORMATS = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "lucideIcon",
]

const getPlainText = (html: string) => {
  if (typeof window === "undefined") return html
  const doc = new DOMParser().parseFromString(html || "", "text/html")
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim()
}

export function QuillEditor({ label, value, onChange, placeholder, required }: QuillEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)
  const currentRef = useRef<string>("")
  const [isIconModalOpen, setIsIconModalOpen] = useState(false)

  const imageHandler = useCallback(() => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      // Show uploading state (could be improved with a real UI indicator)
      notify.success("Uploading image...")

      try {
        const formData = new FormData()
        formData.append("image", file)

        const res = await adminFetch(`${BASE_URL}/uploads/rich-text`, {
          method: "POST",
          body: formData, // adminFetch handles Content-Type for FormData automatically
        })

        const payload = await res.json()
        if (!res.ok || !payload.data?.url) {
          throw new Error(payload.message || "Upload failed")
        }

        // Convert to absolute URL if needed
        let finalUrl = payload.data.url
        if (finalUrl.startsWith("/")) {
          const root = BASE_URL.replace(/\/api\/v1$/, "")
          finalUrl = `${root}${finalUrl}`
        }

        // Insert the image into the editor
        const quill = quillRef.current
        if (quill) {
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, "image", finalUrl)
          quill.setSelection(range.index + 1, 0)
        }
      } catch (err: any) {
        notify.error(err.message || "Failed to upload image")
      }
    }
  }, [])

  const lucideIconHandler = useCallback(() => {
    setIsIconModalOpen(true)
  }, [])

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return

    // Register Formats & Blots
    const Size = Quill.import("attributors/style/size")
    Size.whitelist = FONT_SIZES
    Quill.register(Size, true)

    const Font = Quill.import("attributors/style/font")
    Font.whitelist = FONT_FAMILIES
    Quill.register(Font, true)

    Quill.register(LucideIconBlot, true)

    // Initialize Quill
    const quill = new Quill(hostRef.current, {
      theme: "snow",
      placeholder: placeholder || "",
      modules: {
        toolbar: {
          container: TOOLBAR,
          handlers: {
            image: imageHandler,
            lucideIcon: lucideIconHandler,
          },
        },
      },
      formats: FORMATS,
    })
    quillRef.current = quill

    // Set custom SVG for the lucideIcon toolbar button
    const customIconButton = document.querySelector('.ql-lucideIcon')
    if (customIconButton) {
      customIconButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`
      customIconButton.setAttribute('title', 'Insert Lucide Icon')
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML
      const delta = quill.getContents()
      currentRef.current = html
      onChange(html, delta)
    })
  }, [onChange, placeholder, imageHandler, lucideIconHandler])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return
    if (value === currentRef.current) return
    quill.clipboard.dangerouslyPasteHTML(value || "")
    currentRef.current = value || ""
  }, [value])

  const handleIconInsert = (svgHtml: string) => {
    const quill = quillRef.current
    if (quill) {
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, "lucideIcon", svgHtml)
      quill.setSelection(range.index + 1, 0)
    }
  }

  return (
    <div className="text-sm">
      {/* Import Google Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
      `}} />

      <label className="mb-1 block text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <div className="relative overflow-hidden rounded-md border border-border bg-background">
        <div ref={hostRef} className="min-h-[250px]" />
        {required && (
          <input
            tabIndex={-1}
            readOnly
            required
            value={getPlainText(value)}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
        )}
      </div>

      <LucideIconModal 
        isOpen={isIconModalOpen} 
        onClose={() => setIsIconModalOpen(false)} 
        onSelectIcon={handleIconInsert} 
      />
    </div>
  )
}
