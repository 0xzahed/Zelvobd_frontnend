import { requestWithAdminAuth } from "@/src/api/_shared/requestWithAdminAuth"

export const createAdmin = async (body: Record<string, unknown>) => {
  return requestWithAdminAuth({
    path: "/admins",
    method: "POST",
    body: body || {},
  })
}
