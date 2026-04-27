import { requestWithAdminAuth } from "@/src/api/_shared/requestWithAdminAuth"

export const getAdmins = async () => {
  return requestWithAdminAuth({
    path: "/admins",
    method: "GET",
  })
}
