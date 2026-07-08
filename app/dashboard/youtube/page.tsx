"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Link2, Pencil, Plus, Trash2, X, Youtube } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { notify } from "@/lib/notify"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { useYoutubeVideos, useCreateYoutubeVideo, useUpdateYoutubeVideo, useDeleteYoutubeVideo, type YoutubeVideoType } from "@/src/hooks/api/useYoutubeVideos"
import { toAbsoluteUrl } from "@/lib/api-utils"

type Draft = { id?: string; title: string; url: string; image: string }
const emptyDraft: Draft = { title: "", url: "", image: "" }

export default function DashboardYoutubePage() {
  const { data: videos = [], isLoading } = useYoutubeVideos()
  const createMutation = useCreateYoutubeVideo()
  const updateMutation = useUpdateYoutubeVideo()
  const deleteMutation = useDeleteYoutubeVideo()
  const confirm = useConfirm()

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const editing = Boolean(draft.id)

  const handleDelete = async (v: YoutubeVideoType) => {
    const ok = await confirm({
      title: "Delete video?",
      message: `Are you sure you want to delete "${v.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(v.id)
  }

  const openCreate = () => { setDraft(emptyDraft); setOpen(true) }

  const openEdit = (v: YoutubeVideoType) => {
    setDraft({ id: v.id, title: v.title || "", url: v.url || "", image: v.imageUrl ? toAbsoluteUrl(v.imageUrl) : "" })
    setOpen(true)
  }

  const handleImagePick = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result ?? "") }))
    reader.readAsDataURL(file)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing && !draft.image) {
      notify.error({ title: "Validation Error", message: "Please upload a thumbnail." })
      return
    }
    if (editing && draft.id) {
      updateMutation.mutate(
        { id: draft.id, title: draft.title, url: draft.url, image: draft.image },
        { onSuccess: () => { setOpen(false); setDraft(emptyDraft) } }
      )
    } else {
      createMutation.mutate(
        { title: draft.title, url: draft.url, image: draft.image },
        { onSuccess: () => { setOpen(false); setDraft(emptyDraft) } }
      )
    }
  }

  return (
    <DashPage>
      <DashHeader
        title="YouTube Videos"
        subtitle={`${videos.length} total videos`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Video
          </button>
        }
      />

      {isLoading ? (
        <DashLoading label="Loading videos..." />
      ) : videos.length === 0 ? (
        <DashPanel>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Youtube className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-base font-medium text-foreground">No videos added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Video" to add your first video.</p>
          </div>
        </DashPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v: YoutubeVideoType) => (
            <div
              key={v.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {v.imageUrl ? (
                  <Image src={toAbsoluteUrl(v.imageUrl)} alt={v.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-secondary/50">
                    <Youtube className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="line-clamp-2 text-sm font-semibold text-foreground" title={v.title}>{v.title || "Untitled"}</p>
                <a href={v.url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline">
                  <Link2 className="h-3 w-3" />
                  <span className="truncate">{v.url}</span>
                </a>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(v)}
                    className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    className="flex h-8 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="relative mb-6 border-b border-border/40 pb-3 text-center">
              <h3 className="text-base font-bold text-foreground">{editing ? "Edit Video" : "Add New Video"}</h3>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Video Title"
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                required
              />

              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-card px-3">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="YouTube URL (e.g., https://youtu.be/...)"
                  className="h-full w-full bg-transparent text-sm outline-none"
                  required
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Thumbnail Upload</p>
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImagePick(e.target.files?.[0])} />
                  <div className="grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-primary/40 bg-secondary/30 p-4 transition hover:bg-secondary">
                    {draft.image ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.image || "/placeholder.svg"} alt="Preview" className="mx-auto max-h-32 rounded-lg object-contain" />
                        <span className="mt-2 block text-center text-[11px] text-muted-foreground">Click to change thumbnail</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ImagePlus className="h-6 w-6 text-primary" />
                        <span className="text-sm text-primary">Click to upload thumbnail</span>
                        <span className="text-[11px] text-muted-foreground">Max image size 5 MB</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashPage>
  )
}
