"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Printer } from "lucide-react"
import { useOrderById } from "@/src/hooks/api/useOrders"
import { formatBDT } from "@/lib/format"

const CELL_STYLE = { border: "1px solid #6b85bb", fontSize: 16, color: "#1a3570", fontWeight: 700 }
const HEADER_FOOTER_BG = { background: "#2b4a8c", border: "1px solid #2b4a8c" }
const LINE_STYLE = { borderBottom: "2px solid #2b4a8c" }
const BOX_STYLE = { border: "1.5px solid #2b4a8c" }

function digitsArray(num: string, len: number) {
  const s = num.replace(/\D/g, "").slice(-len)
  return Array.from({ length: len }, (_, i) => s[i] || "")
}

export default function InvoicePage() {
  const params = useParams()
  const id = params.id as string
  const { data: order, isLoading } = useOrderById(id)
  const printRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const update = () => {
      const container = containerRef.current
      const wrapper = printRef.current
      if (!container || !wrapper) return
      const containerWidth = container.clientWidth
      const naturalWidth = 880
      const newScale = containerWidth >= naturalWidth ? 1 : containerWidth / naturalWidth
      setScale(newScale)
      setScaledHeight(wrapper.scrollHeight * newScale)
    }
    update()
    window.addEventListener("resize", update)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null
    if (ro && containerRef.current) ro.observe(containerRef.current)
    return () => {
      window.removeEventListener("resize", update)
      if (ro && containerRef.current) ro.unobserve(containerRef.current)
    }
  }, [order])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading invoice...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Order not found.
      </div>
    )
  }

  const items = order.items || []
  const phone = order.customerPhone || ""
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : ""

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-3 print-hidden">
        <button
          onClick={handlePrint}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" />
          Print / Download
        </button>
      </div>

      <div
        ref={containerRef}
        className="invoice-container print:overflow-visible"
        style={{ width: "100%", height: scaledHeight, overflow: "hidden" }}
      >
        <div
          ref={printRef}
          className="invoice-wrapper"
          style={{
            width: 880,
            background: "#e8e8e8",
            padding: 20,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            style={{
              width: 840,
              margin: "0 auto",
              background: "#ffffff",
              position: "relative",
              border: "1px solid #cfd8e8",
            }}
          >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              padding: "25px 35px 15px 35px",
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                border: "3px solid #2b4a8c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <img
                src="/logo.png"
                alt="ZELVO BD"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ paddingTop: 8 }}>
              <h1
                style={{
                  fontSize: 26,
                  color: "#1a3570",
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                All Kinds Of Crockeries &amp; Electronics Item
              </h1>
              <div
                style={{
                  fontSize: 18,
                  color: "#2b4a8c",
                  lineHeight: 1.35,
                  marginBottom: 6,
                }}
              >
                136/137 Mudi Market, 2nd Floor
                <br />
                Kachabazar, Dhaka New Market, Dhaka
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "#2b4a8c",
                  fontWeight: 600,
                }}
              >
                01765-804147
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div style={{ padding: "10px 35px 0 35px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  No:
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 28 }}>
                  <span style={{ fontSize: 18, color: "#1a3570", paddingLeft: 6 }}>{order.code}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Date
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 28 }}>
                  <span style={{ fontSize: 18, color: "#1a3570", paddingLeft: 6 }}>{dateStr}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Name
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 28 }}>
                  <span style={{ fontSize: 18, color: "#1a3570", paddingLeft: 6 }}>{order.customerName}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Consignment No
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 28 }}>
                  <span style={{ fontSize: 18, color: "#1a3570", paddingLeft: 6 }}>{order.consignmentId || ""}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Address
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 28 }}>
                  <span style={{ fontSize: 18, color: "#1a3570", paddingLeft: 6 }}>
                    {order.address}
                    {order.district ? `, ${order.district}` : ""}
                  </span>
                </div>
              </div>
              <div style={{ ...LINE_STYLE }} />
            </div>
          </div>

          {/* Mobile number boxes */}
          <div style={{ padding: "5px 35px 0 35px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a3570", marginBottom: 8 }}>Mobile No.</div>
            <div style={{ display: "flex", marginBottom: 20 }}>
              {digitsArray(phone, 11).length > 0
                ? digitsArray(phone, 11).map((d, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 38,
                        ...BOX_STYLE,
                        borderLeft: i === 0 ? "1.5px solid #2b4a8c" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1a3570",
                      }}
                    >
                      {d}
                    </div>
                  ))
                : Array.from({ length: 11 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 38,
                        ...BOX_STYLE,
                        borderLeft: i === 0 ? "1.5px solid #2b4a8c" : "none",
                      }}
                    />
                  ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: "0 35px", position: "relative" }}>
            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 360,
                opacity: 0.1,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <img
                src="/logo.png"
                alt=""
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} style={{ ...HEADER_FOOTER_BG, height: 30 }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length > 0
                  ? items.map((item: any, i: number) => (
                      <tr key={item.id}>
                        <td style={{ ...CELL_STYLE, width: "8%", textAlign: "center", padding: "10px 0" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ ...CELL_STYLE, width: "52%", padding: "8px 10px" }}>{item.productName}</td>
                        <td style={{ ...CELL_STYLE, width: "13.33%", textAlign: "center", padding: "8px 0" }}>
                          {item.quantity}
                        </td>
                        <td style={{ ...CELL_STYLE, width: "13.33%", textAlign: "center", padding: "8px 0" }}>
                          {formatBDT(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  : Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        <td style={{ ...CELL_STYLE, width: "8%", textAlign: "center", padding: "10px 0" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ ...CELL_STYLE, width: "52%", padding: "8px 10px" }} />
                        <td style={{ ...CELL_STYLE, width: "13.33%", textAlign: "center", padding: "8px 0" }} />
                        <td style={{ ...CELL_STYLE, width: "13.33%", textAlign: "center", padding: "8px 0" }} />
                      </tr>
                    ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ ...CELL_STYLE, textAlign: "right", padding: "8px 15px" }}>Subtotal</td>
                  <td style={{ ...CELL_STYLE, textAlign: "center", padding: "8px 0" }}>{formatBDT(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ ...CELL_STYLE, textAlign: "right", padding: "8px 15px" }}>Shipping</td>
                  <td style={{ ...CELL_STYLE, textAlign: "center", padding: "8px 0" }}>{formatBDT(order.shippingCharge)}</td>
                </tr>
                {Number(order.discountAmount) > 0 && (
                  <tr>
                    <td colSpan={3} style={{ ...CELL_STYLE, textAlign: "right", padding: "8px 15px" }}>Discount {order.promoCode ? `(${order.promoCode})` : ""}</td>
                    <td style={{ ...CELL_STYLE, textAlign: "center", padding: "8px 0", color: "#2b4a8c" }}>-{formatBDT(order.discountAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      ...HEADER_FOOTER_BG,
                      color: "#fff",
                      textAlign: "right",
                      paddingRight: 15,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Total Amount
                  </td>
                  <td
                    style={{
                      ...HEADER_FOOTER_BG,
                      background: "#fff",
                      color: "#1a3570",
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: 700,
                      borderColor: "#2b4a8c",
                      padding: "8px 0",
                    }}
                  >
                    {formatBDT(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "45px 35px 30px 35px",
            }}
          >
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1a3570" }}>
              <div style={{ width: 220, borderBottom: "2px solid #2b4a8c", marginBottom: 6 }} />
              Customer Signature
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1a3570" }}>
              <div style={{ width: 220, borderBottom: "2px solid #2b4a8c", marginBottom: 6 }} />
              Seller&apos;s Signature
            </div>
          </div>
        </div>
      </div>
      </div>

      <style jsx global>{`
        @page {
          margin: 0;
          size: auto;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-wrapper,
          .invoice-wrapper * {
            visibility: visible;
          }
          .invoice-container {
            height: auto !important;
            overflow: visible !important;
          }
          .invoice-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-width: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #e8e8e8 !important;
            transform: none !important;
          }
          .invoice-wrapper > div {
            width: 100% !important;
            max-width: 840px;
          }
          .print-hidden {
            display: none !important;
          }
        }
        @media screen {
          .print-hidden {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
