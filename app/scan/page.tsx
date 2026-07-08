"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Image as ImageIcon, Type, Loader2, ScanLine, Sparkles, AlertCircle, Zap, Box } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { notify } from "@/lib/notify"
import { BASE_URL } from "@/src/api/mainApi"
import { cx } from "@/lib/format"

type ScanMode = "camera" | "upload" | "manual"

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>("camera")
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [hasCamera, setHasCamera] = useState(true)
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
        { fps: 15, qrbox: { width: 280, height: 180 } },
        (decodedText) => {
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => {
              processCode(decodedText)
            }).catch(console.error)
          }
        },
        () => {}
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

  useEffect(() => {
    if (mode === "camera") {
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

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setLoading(true)
      const html5QrCode = new Html5Qrcode("upload-reader")
      const decodedText = await html5QrCode.scanFile(file, true)
      processCode(decodedText)
    } catch (err) {
      notify.error("Could not read barcode from image")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <BackHeader title="Product Scanner" />
      
      <div className="relative flex min-h-[calc(100dvh-140px)] flex-col items-center justify-center overflow-hidden px-6 py-10">
        {/* Background Accents */}
        <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10 w-full max-w-md space-y-10">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-[8px] bg-primary/5 px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Smart Recognition</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Find Instantly</h2>
            <p className="text-sm font-medium text-muted-foreground">Scan any product barcode to see details</p>
          </div>

          {/* Main Visual Content */}
          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-[8px] border border-border/30 bg-background shadow-sm" style={{ height: "280px" }}>
              {mode === "camera" && (
                <div className="relative h-full w-full bg-gray-100">
                  <div id="reader" className="h-full w-full overflow-hidden"></div>
                  
                  {/* High-detail Scan Frame */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-12">
                    <div className="relative h-full w-full max-w-65 max-h-40">
                      {/* Precise Corners */}
                      <div className="absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-primary" />
                      <div className="absolute -top-1 -right-1 h-6 w-6 border-t-2 border-r-2 border-primary" />
                      <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-primary" />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-primary" />
                      
                      {/* Animated Laser */}
                      <div className="absolute left-0 top-0 h-0.5 w-full animate-laser bg-primary" />
                      
                      {/* Subtle Inner Frame */}
                      <div className="absolute inset-0 border border-white/10" />
                    </div>
                  </div>

                  {!hasCamera && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 p-8 text-center">
                      <div className="mb-4 rounded-[8px] bg-destructive/10 p-3 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Camera Unavailable</p>
                      <p className="mt-1 text-xs text-muted-foreground">Please check permissions in your settings</p>
                    </div>
                  )}
                </div>
              )}

              {mode === "upload" && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-background p-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-secondary/10 text-primary">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                  <div id="upload-reader" className="hidden"></div>
                  <div className="text-center space-y-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] bg-primary px-8 py-3.5 text-xs font-bold text-white transition-all active:scale-95">
                      <ImageIcon className="h-4 w-4" />
                      Choose from Gallery
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              )}

              {mode === "manual" && (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 bg-background">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); processCode(manualCode); }}
                    className="w-full space-y-4"
                  >
                    <div className="relative group/input">
                      <input 
                        type="text" 
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="P-2026-10-Jade"
                        className="w-full rounded-[8px] border border-border bg-white px-6 py-4 text-center text-sm font-bold outline-none transition-all focus:border-primary/50"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading || !manualCode.trim()}
                      className="block w-full rounded-[8px] bg-primary py-4 text-center text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      Verify & Find
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Refined Navigation Switcher */}
          <div className="flex items-center justify-center p-1">
            <div className="flex items-center gap-1 rounded-[8px] border border-border/30 bg-white/50 p-1">
              <ModeTab active={mode === "camera"} onClick={() => setMode("camera")} icon={Camera} label="Scan" />
              <ModeTab active={mode === "upload"} onClick={() => setMode("upload")} icon={ImageIcon} label="Upload" />
              <ModeTab active={mode === "manual"} onClick={() => setMode("manual")} icon={Type} label="Manual" />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes laser {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser {
          animation: laser 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </AppShell>
  )
}

function ModeTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "relative flex items-center gap-2 rounded-[8px] px-5 py-2.5 transition-all duration-300",
        active 
          ? "bg-white text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/30"
      )}
    >
      <Icon className={cx("h-4 w-4 transition-transform", active && "scale-110")} />
      <span className="text-xs font-extrabold tracking-tight">{label}</span>
      {active && (
        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </button>
  )
}
