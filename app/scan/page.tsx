"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Image as ImageIcon, Type, Loader2 } from "lucide-react"
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
      <div className="py-6 px-4 md:py-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl bg-card p-6 md:p-10 text-center shadow-card border">
          
          <div className="flex w-full justify-center gap-2 rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => setMode("camera")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "camera" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              <Camera className="mx-auto mb-1 h-5 w-5" />
              Camera
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "upload" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              <ImageIcon className="mx-auto mb-1 h-5 w-5" />
              Upload
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "manual" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              <Type className="mx-auto mb-1 h-5 w-5" />
              Manual
            </button>
          </div>

          <div className="w-full min-h-62.5 flex flex-col items-center justify-center">
            {mode === "camera" && (
              <div className="flex w-full flex-col items-center gap-4">
                <div id="reader" className="w-full overflow-hidden rounded-xl border bg-black/5 min-h-50"></div>
                {!hasCamera && (
                  <p className="text-sm text-destructive">Camera not available or permission denied.</p>
                )}
                {hasCamera && (
                  <p className="text-xs text-muted-foreground">
                    Point your camera at the barcode to scan it automatically.
                  </p>
                )}
              </div>
            )}

            {mode === "upload" && (
              <div className="flex flex-col items-center gap-6 py-4 w-full">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary text-primary">
                  <ImageIcon className="h-10 w-10" />
                </div>
                <div id="upload-reader" style={{ display: 'none' }}></div>
                <div className="w-full space-y-2">
                  <label className="cursor-pointer flex w-full justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
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
                className="flex flex-col items-center gap-6 py-2 w-full"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
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
                  className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Verify Code"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
