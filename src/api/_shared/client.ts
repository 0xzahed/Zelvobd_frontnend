import { notify } from "@/lib/notify"

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1"

export const getAccessToken = (): string | null =>
  typeof window === "undefined" ? null : localStorage.getItem("admin_access_token")

export const authHeaders = (): Record<string, string> => {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const handleApiError = (err: unknown, fallback = "Something went wrong"): void => {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>
    const message = (e.message as string) || (e.error as string) || fallback
    notify.error(message)
  } else if (typeof err === "string") {
    notify.error(err)
  } else {
    notify.error(fallback)
  }
}
