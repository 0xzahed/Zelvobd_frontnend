import { requestWithAdminAuth } from "@/src/api/_shared/requestWithAdminAuth"

export const updateAdmin = async (id: string, body: Record<string, unknown>) => {
  return requestWithAdminAuth({
    path: `/admins/${id}`,
    method: "PATCH",
    body: body || {},
  })
}
