"use client"

import { useRef } from "react"
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

  const handlePrint = () => {
    const w = window.open("", "_blank")
    if (!w || !printRef.current) return
    const style = Array.from(document.styleSheets)
      .map((s) => {
        try {
          return Array.from(s.cssRules || [])
            .map((r) => r.cssText)
            .join("")
        } catch {
          return ""
        }
      })
      .join("")
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice - ${order?.code || ""}</title><style>${style}</style></head><body style="margin:0;background:#e8e8e8">${printRef.current.outerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`
    w.document.write(html)
    w.document.close()
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

      <div ref={printRef} className="invoice-wrapper" style={{ background: "#e8e8e8", padding: 20 }}>
        <div
          style={{
            width: 840,
            margin: "0 auto",
            background: "#ffffff",
            position: "relative",
            border: "1px solid #cfd8e8",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              height: 80,
              background: "linear-gradient(90deg, #7f9fd0 0%, #2b4a8c 55%, #1a3570 100%)",
            }}
          />

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
                <span style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  No:
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 22 }}>
                  <span style={{ fontSize: 16, color: "#1a3570", paddingLeft: 6 }}>{order.code}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Date
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 22 }}>
                  <span style={{ fontSize: 16, color: "#1a3570", paddingLeft: 6 }}>{dateStr}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Name
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 22 }}>
                  <span style={{ fontSize: 16, color: "#1a3570", paddingLeft: 6 }}>{order.customerName}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", width: "45%" }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Consignment No
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 22 }}>
                  <span style={{ fontSize: 16, color: "#1a3570", paddingLeft: 6 }}>{order.consignmentId || ""}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", whiteSpace: "nowrap", marginRight: 10 }}>
                  Address
                </span>
                <div style={{ flex: 1, ...LINE_STYLE, height: 22 }}>
                  <span style={{ fontSize: 16, color: "#1a3570", paddingLeft: 6 }}>
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
            <div style={{ fontSize: 19, fontWeight: 700, color: "#1a3570", marginBottom: 8 }}>Mobile No.</div>
            <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
              {[0, 1].map((grp) => (
                <div key={grp} style={{ display: "flex", flex: 1 }}>
                  {digitsArray(phone, 11).slice(grp * 6, grp * 6 + 6).length > 0
                    ? digitsArray(phone, 11)
                        .slice(grp * 6, grp * 6 + 6)
                        .map((d, i) => (
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
                width: 380,
                opacity: 0.12,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <svg viewBox="0 0 200 200" style={{ width: "100%", height: "auto" }}>
                <circle cx="100" cy="90" r="85" fill="none" stroke="#1a3570" strokeWidth="3" />
                <text
                  x="100"
                  y="115"
                  fontSize="90"
                  fontWeight="900"
                  fontStyle="italic"
                  fill="#1a3570"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  Z
                </text>
              </svg>
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

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-wrapper,
          .invoice-wrapper * {
            visibility: visible;
          }
          .invoice-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            background: #e8e8e8 !important;
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
