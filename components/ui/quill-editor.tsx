"use client"

import { useEffect, useRef } from "react"
import Quill from "quill"

type QuillEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  ["link", "blockquote", "code-block"],
  ["clean"],
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
    const quill = new Quill(hostRef.current, {
      theme: "snow",
      placeholder: placeholder || "",
      modules: {
        toolbar: TOOLBAR,
      },
    })
    quillRef.current = quill

    quill.on("text-change", () => {
      const html = quill.root.innerHTML
      currentRef.current = html
      onChange(html)
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
    <label className="block text-sm">
      <span className="mb-1 block text-foreground">
        {label} {required && <span className="text-[#FF3B3B]">*</span>}
      </span>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div ref={hostRef} className="min-h-[160px]" />
      </div>
      {required && (
        <input
          tabIndex={-1}
          readOnly
          required
          value={getPlainText(value)}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      )}
    </label>
  )
}
