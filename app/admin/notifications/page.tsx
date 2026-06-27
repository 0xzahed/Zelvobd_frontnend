"use client"

import { useState } from "react"
import { Bell, Send } from "lucide-react"
import type { Notification } from "@/lib/types"
import {
  AdminField,
  AdminInput,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSelect,
} from "@/components/admin/admin-ui"

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Notification["type"]>("promo")

  function send() {
    if (!title.trim()) return
    const next: Notification = {
      id: `n${Date.now()}`,
      type,
      title,
      description,
      time: "Just now",
      unread: true,
    }
    setItems([next, ...items])
    setTitle("")
    setDescription("")
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Notifications"
        description="Send push notifications to app users"
        count={`${items.length} sent`}
      />

      <AdminPanel className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Title">
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </AdminField>
          <AdminField label="Type">
            <AdminSelect
              value={type}
              onChange={(e) => setType(e.target.value as Notification["type"])}
            >
              <option value="promo">Promo</option>
              <option value="order">Order</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="alert">Alert</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Description" full>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notification message..."
              className="admin-input min-h-24 resize-none py-2.5"
            />
          </AdminField>
        </div>
        <div className="mt-4 flex justify-end">
          <AdminPrimaryButton onClick={send}>
            <Send className="h-4 w-4" />
            Send Notification
          </AdminPrimaryButton>
        </div>
      </AdminPanel>

      <AdminPanel>
        <ul className="divide-y divide-border/60">
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/20">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {n.type}
              </span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">
              No notifications sent yet.
            </li>
          )}
        </ul>
      </AdminPanel>
    </AdminPage>
  )
}
