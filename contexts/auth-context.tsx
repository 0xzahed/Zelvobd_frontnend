"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { login } from "@/src/api/auth/login"
import { logout } from "@/src/api/auth/logout"
import { refreshToken } from "@/src/api/auth/refreshToken"
import { tokenStore } from "@/src/api/_shared/token-store"

type User = { name: string; email: string }

type AuthContextType = {
  user: User | null
  isAdmin: boolean
  authLoading: boolean
  login: (email: string, name?: string) => void
  logout: () => void
  loginAdmin: (email: string, password: string) => Promise<void>
  logoutAdmin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const hydrate = async () => {
      try {
        const u = localStorage.getItem("ecomerce_user")
        if (u) setUser(JSON.parse(u))

        const hasAccess = Boolean(tokenStore.getAccessToken())
        const hasRefresh = Boolean(tokenStore.getRefreshToken())

        if (hasAccess || hasRefresh) {
          setIsAdmin(true)
          if (!hasAccess && hasRefresh) {
            await refreshToken()
          }
        }
      } catch {
        tokenStore.clearTokens()
        setIsAdmin(false)
      } finally {
        setAuthLoading(false)
      }
    }

    void hydrate()
  }, [])

  const loginUser = (email: string, name = "Shopper") => {
    const u = { email, name }
    setUser(u)
    localStorage.setItem("ecomerce_user", JSON.stringify(u))
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem("ecomerce_user")
  }

  const loginAdmin = async (email: string, password: string) => {
    await login({ email, password })
    setIsAdmin(true)
  }

  const logoutAdmin = async () => {
    try {
      await logout()
    } finally {
      tokenStore.clearTokens()
      setIsAdmin(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      authLoading,
      login: loginUser,
      logout: logoutUser,
      loginAdmin,
      logoutAdmin,
    }),
    [user, isAdmin, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
