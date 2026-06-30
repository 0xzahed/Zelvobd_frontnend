"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Headset, X, Phone } from "lucide-react"

export function FloatingRotatingIcon({ compact = false }: { compact?: boolean }) {
  const [showArrow, setShowArrow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const PHONE = "+8801994040246"
  const WHATSAPP = "+8801994040246"
  const MESSENGER = "https://www.facebook.com/share/17t5znWx2J/"

  useEffect(() => {
    if (compact) return
    const updateArrow = () => {
      const threshold = window.innerHeight
      setShowArrow(window.scrollY >= threshold)
    }
    updateArrow()
    window.addEventListener("scroll", updateArrow, { passive: true })
    return () => window.removeEventListener("scroll", updateArrow)
  }, [compact])

  useEffect(() => {
    if (compact) return
    setExpanded(false)
    const expandTimer = setTimeout(() => setExpanded(true), 1000)
    const retractTimer = setTimeout(() => setExpanded(false), 6000)
    return () => {
      clearTimeout(expandTimer)
      clearTimeout(retractTimer)
    }
  }, [compact])

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 md:bottom-10 md:right-8">
        <div className="relative flex items-center gap-2">
          {showArrow && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5 text-primary" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="animate-float group flex items-center overflow-hidden rounded-full bg-[linear-gradient(45deg,#052F84,#7BA4F7)] transition-transform hover:scale-105"
            aria-label="Contact Us"
          >
            {!compact && (
              <span
                className={`flex h-12 items-center whitespace-nowrap text-sm font-semibold text-white transition-all duration-500 ease-out ${expanded ? "max-w-[100px] px-3 opacity-100" : "max-w-0 px-0 opacity-0"}`}
              >
                Contact Us
              </span>
            )}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Headset className="h-5 w-5 text-white" />
            </div>
          </button>
          <FloatStyles />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Contact Us</h2>
              <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-accent/10 hover:text-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              You are welcome to visit our office for any information related to Service. You can also reach us through the hotline number or messenger.
            </p>

            <div className="mb-6 flex justify-center">
              <img src="https://cdn-icons-png.flaticon.com/512/2345/2345337.png" alt="Support" className="h-20 w-20 object-contain" />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${WHATSAPP.replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={MESSENGER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-500/30 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.744 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.559 6.963z"/>
                </svg>
                Messenger
              </a>
            </div>

            <a
              href={`tel:${PHONE}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Phone className="h-4 w-4" />
              {PHONE}
            </a>
          </div>
        </div>
      )}
    </>
  )
}

function FloatStyles() {
  return (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>
  )
}
