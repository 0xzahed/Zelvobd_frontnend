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
  const message =
    err && typeof err === "object"
      ? ((err as Record<string, unknown>).message as string) ||
        ((err as Record<string, unknown>).error as string) ||
        fallback
      : typeof err === "string"
        ? err
        : fallback

  // Keep this module server-safe; only load toast helper in the browser.
  if (typeof window !== "undefined") {
    import("@/lib/notify")
      .then(({ notify }) => notify.error(message))
      .catch(() => console.error(message))
    return
  }

  if (err && typeof err === "object") {
    console.error(message)
  } else if (typeof err === "string") {
    console.error(err)
  } else {
    console.error(fallback)
  }
}
