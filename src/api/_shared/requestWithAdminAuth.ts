import { BASE_URL, authHeaders } from "@/src/api/_shared/client"
import { refreshToken } from "@/src/api/auth/refreshToken"

type RequestOptions = {
  path: string
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
}

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const executeRequest = async ({ path, method, body }: RequestOptions) => {
  const headers: Record<string, string> = {
    ...authHeaders(),
  }

  const hasBody = body !== undefined
  if (hasBody) {
    headers["Content-Type"] = "application/json"
  }

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  })
}

export const requestWithAdminAuth = async (options: RequestOptions) => {
  let response = await executeRequest(options)
  let payload = await parseJsonSafe(response)

  if (response.status === 401) {
    try {
      await refreshToken()
      response = await executeRequest(options)
      payload = await parseJsonSafe(response)
    } catch {
      // Preserve original failure handling below.
    }
  }

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
