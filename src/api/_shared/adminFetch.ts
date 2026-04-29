import { getAccessToken } from "./client"
import { refreshAdminToken } from "../authApi"

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

export const adminFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAccessToken()
  const headers = new Headers(init?.headers)

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const newInit = { ...init, headers }
  let response = await fetch(input, newInit)

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const payload = await refreshAdminToken()
        isRefreshing = false
        onRefreshed(payload?.data?.accessToken || "")
      } catch (err) {
        isRefreshing = false
        onRefreshed("")
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_access_token")
          localStorage.removeItem("admin_refresh_token")
          window.location.href = "/login"
        }
      }
    }

    const newAccessToken = await new Promise<string>((resolve) => {
      addRefreshSubscriber((token) => resolve(token))
    })

    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`)
      response = await fetch(input, { ...init, headers })
    }
  }

  return response
}
