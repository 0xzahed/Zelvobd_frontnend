"use client"

import { toast } from "sonner"

/**
 * Central notification helper. Accepts a message (or a backend-style
 * response object with `message`/`error`/`success`) and shows a toast
 * in the top-right corner.
 */
type BackendLike =
  | string
  | {
      message?: string
      error?: string
      success?: boolean | string
      title?: string
      description?: string
    }

function extract(payload: BackendLike) {
  if (typeof payload === "string") {
    return { message: payload, type: "info" as const }
  }
  const message =
    payload.message ||
    payload.error ||
    payload.description ||
    (typeof payload.success === "string" ? payload.success : "") ||
    "Something happened"
  let type: "success" | "error" | "info" | "warning" = "info"
  if (payload.error) type = "error"
  else if (payload.success) type = "success"
  return { message, type, title: payload.title }
}

export const notify = {
  success(payload: BackendLike) {
    const { message, title } = extract(payload)
    toast.success(title || message, { description: title ? message : undefined })
  },
  error(payload: BackendLike) {
    const { message, title } = extract(payload)
    toast.error(title || message, { description: title ? message : undefined })
  },
  info(payload: BackendLike) {
    const { message, title } = extract(payload)
    toast(title || message, { description: title ? message : undefined })
  },
  warning(payload: BackendLike) {
    const { message, title } = extract(payload)
    toast.warning(title || message, { description: title ? message : undefined })
  },
  /**
   * Automatically picks the right variant from a backend-style response.
   * Great for:  const res = await fetch(...); notify.fromResponse(await res.json())
   */
  fromResponse(payload: BackendLike) {
    const { message, type, title } = extract(payload)
    const args = [title || message, title ? { description: message } : undefined] as const
    if (type === "error") toast.error(...args)
    else if (type === "success") toast.success(...args)
    else if (type === "warning") toast.warning(...args)
    else toast(...args)
  },
}

export { toast }
