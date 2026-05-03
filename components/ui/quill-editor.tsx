"use client"

import { useEffect, useRef } from "react"
import Quill from "quill"

type QuillEditorProps = {
  label: string
  value: string
  onChange: (html: string, delta?: any) => void
  placeholder?: string
  required?: boolean
}

const TOOLBAR = [
  [{ size: ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "blockquote", "code-block", "image", "video"],
  ["clean"],
]

const FORMATS = [
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
  "video",
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

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    const Size = Quill.import("attributors/style/size")
    Size.whitelist = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"]
    Quill.register(Size, true)
    const quill = new Quill(hostRef.current, {
      theme: "snow",
      placeholder: placeholder || "",
      modules: {
        toolbar: TOOLBAR,
      },
      formats: FORMATS,
    })
    quillRef.current = quill

    quill.on("text-change", () => {
      const html = quill.root.innerHTML
      const delta = quill.getContents()
      currentRef.current = html
      onChange(html, delta)
    })
  }, [onChange, placeholder])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return
    if (value === currentRef.current) return
    quill.clipboard.dangerouslyPasteHTML(value || "")
    currentRef.current = value || ""
  }, [value])

  return (
    <div className="text-sm">
      <label className="mb-1 block text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <div className="relative overflow-hidden rounded-md border border-border bg-background">
        <div ref={hostRef} className="min-h-40" />
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
    </div>
  )
}
