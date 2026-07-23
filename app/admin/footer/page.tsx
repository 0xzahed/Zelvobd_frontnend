"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Plus, Trash2, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ImagePlus, Loader2, Lock, Save } from "lucide-react"
import { useFooter, useUpdateFooter } from "@/src/hooks/api/useFooter"
import { uploadFooterImage } from "@/src/api/footerApi"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { toAbsoluteUploadUrl } from "@/src/api/mainApi"
import { useAuth } from "@/contexts/auth-context"
import { updateAdmin } from "@/src/api/adminApi"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"

type NavLink = { label: string; href: string }
type NavGroup = { title: string; links: NavLink[] }
type Social = { label: string; href: string; icon?: string }

type FooterForm = {
  brandName: string
  brandTagline: string
  logoUrl: string
  supportEmail: string
  supportPhone: string
  supportAddress: string
  navGroups: NavGroup[]
  socials: Social[]
}

const emptyFooter: FooterForm = {
  brandName: "",
  brandTagline: "",
  logoUrl: "",
  supportEmail: "",
  supportPhone: "",
  supportAddress: "",
  navGroups: [],
  socials: [],
}

const NAMED_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
}

function isImageUrl(val: string) {
  return /^https?:\/\//i.test(val) || /^\/upload\//i.test(val)
}

export default function DashboardFooterPage() {
  const { data: footerData, isLoading } = useFooter()
  const updateMutation = useUpdateFooter()
  const [form, setForm] = useState<FooterForm>(emptyFooter)
  const [uploading, setUploading] = useState(false)
  const [socialUploadIdx, setSocialUploadIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const socialFileInputRef = useRef<HTMLInputElement>(null)
  const { admin } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  const handlePasswordChange = async () => {
    if (!admin?.id) return
    if (newPassword.length < 8) {
      notify.error({ title: "Password too short", message: "Password must be at least 8 characters." })
      return
    }
    if (newPassword !== confirmPassword) {
      notify.error({ title: "Passwords don't match", message: "New password and confirm password must match." })
      return
    }
    setSavingPassword(true)
    try {
      await updateAdmin(admin.id, { password: newPassword })
      notify.success({ title: "Password updated", message: "Your password has been changed." })
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingPassword(false)
    }
  }

  useEffect(() => {
    if (footerData) {
      setForm({
        brandName: footerData.brandName || "",
        brandTagline: footerData.brandTagline || "",
        logoUrl: footerData.logoUrl || "",
        supportEmail: footerData.supportEmail || "",
        supportPhone: footerData.supportPhone || "",
        supportAddress: footerData.supportAddress || "",
        navGroups: footerData.navGroups || [],
        socials: footerData.socials || [],
      })
    }
  }, [footerData])

  const update = (patch: Partial<FooterForm>) => setForm((prev) => ({ ...prev, ...patch }))

  const addNavGroup = () => update({ navGroups: [...form.navGroups, { title: "", links: [{ label: "", href: "" }] }] })
  const updateNavGroup = (i: number, patch: Partial<NavGroup>) => {
    const groups = [...form.navGroups]; groups[i] = { ...groups[i], ...patch }; update({ navGroups: groups })
  }
  const removeNavGroup = (i: number) => update({ navGroups: form.navGroups.filter((_, idx) => idx !== i) })
  const addNavLink = (gi: number) => {
    const groups = [...form.navGroups]; groups[gi] = { ...groups[gi], links: [...groups[gi].links, { label: "", href: "" }] }; update({ navGroups: groups })
  }
  const updateNavLink = (gi: number, li: number, patch: Partial<NavLink>) => {
    const groups = [...form.navGroups]; const links = [...groups[gi].links]; links[li] = { ...links[li], ...patch }; groups[gi] = { ...groups[gi], links }; update({ navGroups: groups })
  }
  const removeNavLink = (gi: number, li: number) => {
    const groups = [...form.navGroups]; groups[gi] = { ...groups[gi], links: groups[gi].links.filter((_, idx) => idx !== li) }; update({ navGroups: groups })
  }
  const addSocial = () => update({ socials: [...form.socials, { label: "", href: "", icon: "" }] })
  const updateSocial = (i: number, patch: Partial<Social>) => {
    const list = [...form.socials]; list[i] = { ...list[i], ...patch }; update({ socials: list })
  }
  const removeSocial = (i: number) => update({ socials: form.socials.filter((_, idx) => idx !== i) })

  const handleLogoUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadFooterImage(file)
      update({ logoUrl: url })
      notify.success({ title: "Image uploaded", message: "Logo has been uploaded. Click Save Changes to persist." })
    } catch (error) {
      handleApiError(error, "Failed to upload image")
    }
    setUploading(false)
  }

  const handleSocialIconUpload = async (file: File, idx: number) => {
    setSocialUploadIdx(idx)
    try {
      const url = await uploadFooterImage(file)
      updateSocial(idx, { icon: url })
      notify.success({ title: "Icon uploaded", message: "Social icon has been uploaded." })
    } catch (error) {
      handleApiError(error, "Failed to upload icon")
    }
    setSocialUploadIdx(null)
  }

  const handleSave = () => updateMutation.mutate(form)

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Settings" subtitle="Manage footer content and account" />
        <DashLoading label="Loading footer..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader
        title="Settings"
        subtitle="Manage footer content and account"
        actions={
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        }
      />

      <div className="space-y-5">
        {/* Brand + Contact Info */}
        <DashPanel>
          <h3 className="mb-4 text-sm font-bold text-foreground">Brand & Contact</h3>
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Brand Tagline</label>
              <input value={form.brandTagline} onChange={(e) => update({ brandTagline: e.target.value })} className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"><Mail className="h-3.5 w-3.5 text-primary" /> Support Email</label>
              <input value={form.supportEmail} onChange={(e) => update({ supportEmail: e.target.value })} className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"><Phone className="h-3.5 w-3.5 text-primary" /> Support Phone</label>
              <input value={form.supportPhone} onChange={(e) => update({ supportPhone: e.target.value })} className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"><MapPin className="h-4 w-4 text-primary" /> Address</label>
              <input value={form.supportAddress} onChange={(e) => update({ supportAddress: e.target.value })} className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40" />
            </div>
          </div>
        </DashPanel>

        {/* Navigation Groups */}
        <DashPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Navigation Groups</h3>
            <button onClick={addNavGroup} className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"><Plus className="h-3.5 w-3.5" /> Add Group</button>
          </div>
          {form.navGroups.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No navigation groups yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.navGroups.map((group, gi) => (
              <div key={gi} className="rounded-lg border border-border/40 bg-muted/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input value={group.title} onChange={(e) => updateNavGroup(gi, { title: e.target.value })} placeholder="Group title" className="h-9 min-w-0 flex-1 rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40" />
                  <button onClick={() => removeNavGroup(gi)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="space-y-2">
                  {group.links.map((link, li) => (
                    <div key={li} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input value={link.label} onChange={(e) => updateNavLink(gi, li, { label: e.target.value })} placeholder="Label" className="h-8 w-full rounded-md border border-border/50 bg-surface px-2.5 text-xs outline-none focus:border-primary/40 sm:flex-1" />
                      <input value={link.href} onChange={(e) => updateNavLink(gi, li, { href: e.target.value })} placeholder="/path" className="h-8 w-full rounded-md border border-border/50 bg-surface px-2.5 text-xs outline-none focus:border-primary/40 sm:flex-1" />
                      <button onClick={() => removeNavLink(gi, li)} className="grid h-7 w-7 shrink-0 self-end place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 sm:self-auto"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => addNavLink(gi)} className="text-xs font-semibold text-primary hover:text-primary/80">+ Add Link</button>
                </div>
              </div>
            ))}
          </div>
        </DashPanel>

        {/* Social Links */}
        <DashPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Social Links</h3>
            <button onClick={addSocial} className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"><Plus className="h-3.5 w-3.5" /> Add Social</button>
          </div>
          {form.socials.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No social links yet.</p>}
          <div className="space-y-2">
            {form.socials.map((social, i) => {
              const NamedIcon = social.icon && NAMED_ICONS[social.icon] ? NAMED_ICONS[social.icon] : null
              const isUrlIcon = social.icon && isImageUrl(social.icon)
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/5 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {NamedIcon ? (
                      <NamedIcon className="h-4 w-4" />
                    ) : isUrlIcon ? (
                      <Image src={toAbsoluteUploadUrl(social.icon!) || social.icon!} alt="" width={32} height={32} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold">{social.label?.trim()?.[0] || "S"}</span>
                    )}
                  </div>
                  <input value={social.label} onChange={(e) => updateSocial(i, { label: e.target.value })} placeholder="Label" className="h-8 min-w-0 flex-1 rounded-md border border-border/50 bg-surface px-2.5 text-xs outline-none focus:border-primary/40" />
                  <input value={social.href} onChange={(e) => updateSocial(i, { href: e.target.value })} placeholder="https://..." className="h-8 min-w-0 flex-[2] rounded-md border border-border/50 bg-surface px-2.5 text-xs outline-none focus:border-primary/40" />
                  <button onClick={() => removeSocial(i)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )
            })}
          </div>
        </DashPanel>

        {/* Change Password */}
        <DashPanel>
          <h3 className="mb-4 text-sm font-bold text-foreground">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters.</p>
            <button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </DashPanel>
      </div>
    </DashPage>
  )
}
