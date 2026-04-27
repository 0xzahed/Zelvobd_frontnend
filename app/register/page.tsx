"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("Passwords do not match.")
    if (!accepted) return setError("Please accept the terms to continue.")
    login(email, name)
    router.push("/")
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#306FD7] text-lg font-bold text-white">
              E
            </span>
            <span className="text-2xl font-bold text-foreground">EcoMerce</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start shopping in seconds</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-card p-6 shadow-card">
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+8801700000000" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Create password" />
          <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Confirm password" />

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="font-medium text-[#306FD7]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-[#306FD7]">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-xs text-[#FF3B3B]">{error}</p>}

          <button
            type="submit"
            className="h-11 w-full rounded-full bg-[#306FD7] text-sm font-semibold text-white shadow-sm"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#306FD7]">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
