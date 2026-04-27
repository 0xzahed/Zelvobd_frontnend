import { requestWithAdminAuth } from "@/src/api/_shared/requestWithAdminAuth"

type AdminPayload = Record<string, unknown>

export const getAdmins = async () => {
  return requestWithAdminAuth({
    path: "/admins",
    method: "GET",
  })
}

export const createAdmin = async (body: AdminPayload) => {
  return requestWithAdminAuth({
    path: "/admins",
    method: "POST",
    body: body || {},
  })
}

export const updateAdmin = async (id: string, body: AdminPayload) => {
  return requestWithAdminAuth({
    path: `/admins/${id}`,
    method: "PATCH",
    body: body || {},
  })
}

export const deleteAdmin = async (id: string) => {
  return requestWithAdminAuth({
    path: `/admins/${id}`,
    method: "DELETE",
  })
}
