"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  loginAdmin as loginAdminApi,
  logoutAdmin as logoutAdminApi,
  refreshAdminToken,
} from "@/src/api/authApi"

type AdminUser = {
  id: string
  email: string
}

type AuthContextType = {
  admin: AdminUser | null
  isAdmin: boolean
  authLoading: boolean
  loginAdmin: (email: string, password: string) => Promise<void>
  refreshAdminSession: () => Promise<void>
  logoutAdmin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)
const ADMIN_PROFILE_STORAGE_KEY = "admin_profile"
const ACCESS_TOKEN_STORAGE_KEY = "admin_access_token"
const REFRESH_TOKEN_STORAGE_KEY = "admin_refresh_token"

const readStoredAdminProfile = (): AdminUser | null => {
  if (typeof window === "undefined") return null

  const rawValue = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AdminUser>
    if (typeof parsedValue?.id === "string" && typeof parsedValue?.email === "string") {
      return {
        id: parsedValue.id,
        email: parsedValue.email,
      }
    }
  } catch {
    localStorage.removeItem(ADMIN_PROFILE_STORAGE_KEY)
  }

  return null
}

const clearAdminAuthStorage = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(ADMIN_PROFILE_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const refreshAdminSession = async () => {
    const payload = await refreshAdminToken()
    const adminData = payload?.data?.admin

    if (!adminData?.id || !adminData?.email) {
      throw new Error("Invalid refresh-token response")
    }

    const nextAdmin = {
      id: String(adminData.id),
      email: String(adminData.email),
    }

    setAdmin(nextAdmin)
    setIsAdmin(true)
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(nextAdmin))
    }
  }

  useEffect(() => {
    const hydrate = async () => {
      try {
        const hasAccessToken =
          typeof window !== "undefined" && Boolean(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
        const hasRefreshToken =
          typeof window !== "undefined" && Boolean(localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY))
        const storedAdmin = readStoredAdminProfile()

        if (!hasAccessToken && !hasRefreshToken) {
          setIsAdmin(false)
          setAdmin(null)
          return
        }

        if (hasAccessToken && storedAdmin) {
          setAdmin(storedAdmin)
          setIsAdmin(true)
          return
        }

        if (hasRefreshToken) {
          await refreshAdminSession()
          return
        }
      } catch {
        clearAdminAuthStorage()
        setAdmin(null)
        setIsAdmin(false)
      } finally {
        setAuthLoading(false)
      }
    }

    void hydrate()
  }, [])

  const loginAdmin = async (email: string, password: string) => {
    const payload = await loginAdminApi({ email, password })
    const adminData = payload?.data?.admin

    if (!adminData?.id || !adminData?.email) {
      clearAdminAuthStorage()
      throw new Error("Invalid login response")
    }

    const nextAdmin = {
      id: String(adminData.id),
      email: String(adminData.email),
    }

    setAdmin(nextAdmin)
    setIsAdmin(true)

    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(nextAdmin))
    }
  }

  const logoutAdmin = async () => {
    try {
      await logoutAdminApi()
    } finally {
      clearAdminAuthStorage()
      setAdmin(null)
      setIsAdmin(false)
    }
  }

  const value = useMemo(
    () => ({
      admin,
      isAdmin,
      authLoading,
      loginAdmin,
      refreshAdminSession,
      logoutAdmin,
    }),
    [admin, isAdmin, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
