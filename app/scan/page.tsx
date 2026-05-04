"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Image as ImageIcon, Type, Loader2, ScanLine, Sparkles } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { notify } from "@/lib/notify"
import { BASE_URL } from "@/src/api/_shared/client"

type ScanMode = "camera" | "upload" | "manual"

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>("camera")
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [hasCamera, setHasCamera] = useState(true) // assume true initially
  const router = useRouter()
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const processCode = async (code: string) => {
    if (!code) return
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}/products/scan/${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Invalid barcode or product not found")
      
      notify.success("Barcode recognized!")
      router.push(data.data.redirectUrl)
    } catch (err: any) {
      notify.error(err.message || "Failed to scan barcode")
      
      // If camera was running, restart it after failure
      if (mode === "camera" && scannerRef.current && !scannerRef.current.isScanning) {
        startScanner()
      }
    } finally {
      setLoading(false)
    }
  }

  const startScanner = () => {
    if (!document.getElementById("reader")) return;
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader")
      }
      
      scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (decodedText) => {
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => {
              processCode(decodedText)
            }).catch(console.error)
          }
        },
        (errorMessage) => {
          // ignore scan errors
        }
      ).catch(err => {
        console.error("Camera start error", err)
        setHasCamera(false)
      })
    } catch (err) {
      console.error(err);
    }
  }

  const stopScanner = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(console.error)
    }
  }

  // Handle mode changes & camera lifecycle
  useEffect(() => {
    if (mode === "camera") {
      // Small timeout to ensure DOM element is ready
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [mode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  // Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const html5QrCode = new Html5Qrcode("upload-reader")
      const decodedText = await html5QrCode.scanFile(file, true)
      processCode(decodedText)
    } catch (err) {
      notify.error("Could not read barcode from image")
    }
  }

  return (
    <AppShell>
      <BackHeader title="Scan Barcode" />
      <div className="px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-4 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-card p-4 md:mb-5 md:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground md:text-lg">Fast Product Scanner</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Scan via camera, upload barcode image, or type the code manually.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] md:p-6">
            <div className="grid w-full grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-1.5">
            <button
              onClick={() => setMode("camera")}
              className={`rounded-lg py-2 text-xs font-semibold transition-all md:text-sm ${mode === "camera" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Camera className="mx-auto mb-1 h-5 w-5" />
              Camera
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`rounded-lg py-2 text-xs font-semibold transition-all md:text-sm ${mode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ImageIcon className="mx-auto mb-1 h-5 w-5" />
              Upload
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`rounded-lg py-2 text-xs font-semibold transition-all md:text-sm ${mode === "manual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Type className="mx-auto mb-1 h-5 w-5" />
              Manual
            </button>
            </div>

            <div className="w-full min-h-70 rounded-2xl border border-border/60 bg-gradient-to-b from-background to-surface/30 p-3 md:p-4">
            {mode === "camera" && (
                <div className="flex w-full flex-col items-center gap-3">
                  <div id="reader" className="w-full overflow-hidden rounded-xl border border-border/70 bg-black/5 min-h-56"></div>
                {!hasCamera && (
                    <p className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                      Camera not available or permission denied.
                    </p>
                )}
                {hasCamera && (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Point your camera at the barcode to scan automatically
                    </p>
                )}
              </div>
            )}

            {mode === "upload" && (
                <div className="flex w-full flex-col items-center gap-5 py-4">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl border border-border/70 bg-secondary/70 text-primary">
                    <ImageIcon className="h-9 w-9" />
                </div>
                <div id="upload-reader" style={{ display: 'none' }}></div>
                <div className="w-full space-y-2">
                    <label className="flex w-full cursor-pointer justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    Select Barcode Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Upload a saved image of the product barcode.
                  </p>
                </div>
              </div>
            )}

            {mode === "manual" && (
              <form 
                onSubmit={(e) => { e.preventDefault(); processCode(manualCode); }}
                  className="flex w-full flex-col items-center gap-5 py-2"
              >
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-border/70 bg-secondary/70 text-primary">
                  <Type className="h-8 w-8" />
                </div>
                <div className="w-full text-left">
                  <label className="mb-2 block text-sm font-medium text-foreground">Enter Barcode Code</label>
                  <input 
                    type="text" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. P-2026-15-Red"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !manualCode.trim()}
                    className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Verify Code"}
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
