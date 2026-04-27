import { requestWithAdminAuth } from "@/src/api/_shared/requestWithAdminAuth"

export const deleteAdmin = async (id: string) => {
  return requestWithAdminAuth({
    path: `/admins/${id}`,
    method: "DELETE",
  })
}
