"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login(email, email.split("@")[0] || "Shopper")
    router.push("/")
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#306FD7] text-lg font-bold text-white">
              E
            </span>
            <span className="text-2xl font-bold text-foreground">EcoMerce</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue shopping</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Email or Phone</label>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Password</label>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border" />
              Remember me
            </label>
            <Link href="#" className="font-medium text-[#306FD7]">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-full bg-[#306FD7] text-sm font-semibold text-white shadow-sm"
          >
            Login
          </button>

          <div className="relative py-2 text-center">
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border" />
            <span className="relative bg-card px-3 text-xs text-muted-foreground">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
            >
              Google
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
            >
              Facebook
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#306FD7]">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
