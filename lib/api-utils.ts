import { notify } from "@/lib/notify"

export const BASE_API =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1"

/**
 * Converts a relative backend path to an absolute URL
 */
export const toAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.svg"
  if (path.startsWith("data:") || path.startsWith("http")) return path
  const host = BASE_API.replace(/\/api\/v1$/, "")
  return `${host}${path.startsWith("/") ? "" : "/"}${path}`
}

/**
 * Extracts a clean error message from an API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    const message =
      (typeof maybe.message === "string" && maybe.message.trim() ? maybe.message : "") ||
      (typeof maybe.error === "string" && maybe.error.trim() ? maybe.error : "")

    if (message) {
      const normalized = message.toLowerCase()
      if (
        normalized.includes("unique constraint failed") &&
        (normalized.includes("title") || normalized.includes("category"))
      ) {
        return "This item already exists. Please use a different name."
      }
      return message
    }
  }
  return "An unexpected error occurred. Please try again."
}

/**
 * Common API error handler with notification
 */
export const handleApiError = (error: unknown, title = "Request failed") => {
  const message = getErrorMessage(error)
  notify.error({ title, message })
  return message
}

/**
 * Converts a URL or DataURL to a File object for FormData uploads
 */
export const fileFromUrl = async (url: string, fallbackName: string): Promise<File | null> => {
  if (!url) return null
  try {
    if (url.startsWith("data:")) {
      const [header, base64] = url.split(",")
      const mimeMatch = header.match(/:(.*?);/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png"
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const ext = mimeType.split("/")[1] || "png"
      return new File([blob], `${fallbackName}.${ext}`, { type: mimeType })
    }

    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const ext = blob.type.split("/")[1] || "png"
    return new File([blob], `${fallbackName}.${ext}`, { type: blob.type })
  } catch (error) {
    console.error("Error converting URL to file:", error)
    return null
  }
}
