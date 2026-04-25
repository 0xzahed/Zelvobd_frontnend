"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { notify } from "@/lib/notify"

export default function AdminLoginPage() {
  const router = useRouter()
  const { loginAdmin } = useAuth()
  const [email, setEmail] = useState("admin@ecomerce.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await loginAdmin(email, password)
      notify.success({
        title: "Welcome back",
        message: "You are signed in to the admin panel.",
        success: true,
      })
      router.push("/admin")
    } catch (error) {
      notify.error({
        title: "Invalid credentials",
        message:
          (error as { message?: string })?.message ||
          "Email or password is incorrect. Please try again.",
        error: String((error as { message?: string })?.message || "auth_failed"),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0B1020]">
      {/* Ambient background gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #3B6CF4, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-0 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #5B84F9, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: brand / highlights */}
        <div className="hidden text-white lg:flex lg:flex-col lg:gap-10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#3B6CF4] to-[#5B84F9] shadow-lg shadow-[#3B6CF4]/30">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">EcoMerce</div>
              <div className="text-xs text-white/50">Admin Console</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <Sparkles className="h-3 w-3 text-[#5B84F9]" />
              Secure admin access
            </div>
            <h2 className="text-balance text-4xl font-semibold leading-tight">
              Manage your store{" "}
              <span className="bg-gradient-to-r from-[#5B84F9] to-[#A5C0FF] bg-clip-text text-transparent">
                beautifully.
              </span>
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-white/60">
              Control your catalog, orders, sliders and customers from one place.
              Everything is synced in real-time to your storefront.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-4">
            {[
              {
                icon: TrendingUp,
                label: "Real-time analytics",
                hint: "Track sales and revenue live",
              },
              {
                icon: ShieldCheck,
                label: "Role-based access",
                hint: "Admin, Editor and Viewer roles",
              },
            ].map((f) => (
              <li
                key={f.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <f.icon className="mb-2 h-4 w-4 text-[#5B84F9]" />
                <div className="text-sm font-medium text-white">{f.label}</div>
                <div className="mt-0.5 text-[11px] text-white/50">{f.hint}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: login card */}
        <div className="mx-auto w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#3B6CF4] to-[#5B84F9] shadow-lg shadow-[#3B6CF4]/30 lg:hidden">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Sign in to Admin
                  </h1>
                  <p className="mt-0.5 text-xs text-white/50">
                    Enter your credentials to continue
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Email address
                </label>
                <div className="group flex h-11 items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 ring-1 ring-white/10 transition focus-within:bg-white/[0.06] focus-within:ring-[#3B6CF4]">
                  <Mail className="h-4 w-4 text-white/40 transition group-focus-within:text-[#5B84F9]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      notify.info({
                        title: "Contact administrator",
                        message: "Please ask your super-admin to reset the password.",
                      })
                    }
                    className="text-[11px] text-[#5B84F9] hover:text-[#A5C0FF]"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="group flex h-11 items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 ring-1 ring-white/10 transition focus-within:bg-white/[0.06] focus-within:ring-[#3B6CF4]">
                  <Lock className="h-4 w-4 text-white/40 transition group-focus-within:text-[#5B84F9]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="grid h-7 w-7 place-items-center rounded-md text-white/50 hover:bg-white/5 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
                <span
                  className={`relative h-4 w-4 rounded border transition ${
                    remember
                      ? "border-[#3B6CF4] bg-[#3B6CF4]"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {remember && (
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute inset-0 h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                Keep me signed in on this device
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B6CF4] to-[#5B84F9] text-sm font-semibold text-white shadow-lg shadow-[#3B6CF4]/30 transition hover:shadow-xl hover:shadow-[#3B6CF4]/40 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Admin"
                )}
              </button>

              <div className="flex items-center gap-3 text-[11px] text-white/40">
                <span className="h-px flex-1 bg-white/10" />
                Demo credentials pre-filled
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/50">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <code className="rounded bg-white/5 px-1.5 py-0.5 text-white/70">
                    admin@ecomerce.com
                  </code>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <code className="rounded bg-white/5 px-1.5 py-0.5 text-white/70">
                    admin123
                  </code>
                </div>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} EcoMerce · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
