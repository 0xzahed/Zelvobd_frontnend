"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Quill from "quill"
import { adminFetch, BASE_URL } from "@/src/api/mainApi"
import { notify } from "@/lib/notify"

import LucideIconBlot from "./quill/quill-icon-blot"
import { LucideIconModal } from "./quill/lucide-icon-modal"
import "./quill/quill-custom.css"

type QuillEditorProps = {
  label?: string
  value?: string
  deltaValue?: any
  onChange?: (html: string, delta?: any) => void
  placeholder?: string
  required?: boolean
  readOnly?: boolean
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

const stripDuplicateListPrefixes = (html: string) => {
  if (typeof window === "undefined" || !html) return html
  const doc = new DOMParser().parseFromString(html, "text/html")
  const listItems = Array.from(doc.querySelectorAll("li"))
  const prefixPattern = /^\s*(?:(?:\d+[.)])|[-*•])\s+/

  listItems.forEach((li) => {
    const walker = doc.createTreeWalker(li, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode() as Text | null
    let shouldRemove = false

    while (node) {
      const original = node.textContent ?? ""
      if (original.trim().length > 0) {
        let cleaned = original
        while (prefixPattern.test(cleaned)) {
          cleaned = cleaned.replace(prefixPattern, "")
        }
        cleaned = cleaned.replace(/^\s+/, "")
        if (cleaned !== original) node.textContent = cleaned
        if (!cleaned.trim()) shouldRemove = true
        break
      }
      node = walker.nextNode() as Text | null
    }

    if (!node) {
      shouldRemove = true
    }

    if (shouldRemove && li.parentElement?.children.length && li.parentElement.children.length > 1) {
      li.remove()
    }
  })

  return doc.body.innerHTML
}

export function QuillEditor({
  label,
  value,
  deltaValue,
  onChange,
  placeholder,
  required,
  readOnly = false,
}: QuillEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)
  const currentRef = useRef<string>("")
  const currentDeltaRef = useRef<string>("")
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
      readOnly: readOnly,
      modules: {
        toolbar: readOnly ? false : {
          container: TOOLBAR,
          handlers: {
            image: imageHandler,
            lucideIcon: lucideIconHandler,
          },
        },
        clipboard: {
          matchVisual: false,
        },
      },
      formats: FORMATS,
    })
    quillRef.current = quill

    if (!readOnly) {
      // Set custom SVG for the lucideIcon toolbar button
      const customIconButton = document.querySelector('.ql-lucideIcon')
      if (customIconButton) {
        customIconButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`
        customIconButton.setAttribute('title', 'Insert Lucide Icon')
      }
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML
      const delta = quill.getContents()
      currentRef.current = html
      currentDeltaRef.current = JSON.stringify(delta)
      if (onChange) onChange(html, delta)
    })
  }, [onChange, placeholder, imageHandler, lucideIconHandler])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    let parsedDelta = deltaValue
    if (typeof deltaValue === "string") {
      try {
        parsedDelta = JSON.parse(deltaValue)
      } catch (e) {
        console.error("Failed to parse deltaValue", e)
      }
    }

    const serializedDelta = parsedDelta ? JSON.stringify(parsedDelta) : ""
    
    // If we have a deltaValue, always use it and ignore HTML value to prevent overwriting
    // rich formats that don't survive HTML serialization
    if (serializedDelta) {
      if (serializedDelta !== currentDeltaRef.current) {
        try {
          quill.setContents(parsedDelta, "silent")
          console.log("SETTING DELTA IN QUILL", parsedDelta)
        } catch (e) {
          console.error("Failed to setContents on quill", e)
        }
        currentRef.current = quill.root.innerHTML
        currentDeltaRef.current = serializedDelta
      }
      return // Stop here if we are managing via delta
    }

    // Fallback to HTML value if no delta is provided
    if (value === currentRef.current) return

    const normalized = stripDuplicateListPrefixes(value || "")
    const convertedDelta = quill.clipboard.convert({ html: normalized })
    quill.setContents(convertedDelta, "silent")
    currentRef.current = quill.root.innerHTML
    currentDeltaRef.current = JSON.stringify(quill.getContents())
  }, [value, deltaValue])

  const handleIconInsert = (svgHtml: string) => {
    const quill = quillRef.current
    if (quill) {
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, "lucideIcon", svgHtml)
      quill.setSelection(range.index + 1, 0)
    }
  }

  return (
    <div className="relative text-sm">
      {label && (
        <label className="mb-1 block text-foreground">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <div
        className={
          readOnly
            ? "quill-readonly-container" 
            : "relative w-full overflow-hidden rounded-lg border border-border/80 bg-background shadow-sm transition-shadow focus-within:border-primary/40 focus-within:shadow-md"
        }
      >
        <div ref={hostRef} className={readOnly ? "ql-editor-readonly border-none! [&>.ql-editor]:p-0!" : "min-h-72 w-full"} />
        {required && !readOnly && (
          <input
            tabIndex={-1}
            readOnly
            required
            value={getPlainText(value || "")}
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
