"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { BackHeader } from "@/components/layout/back-header"
import { AppShell } from "@/components/layout/app-shell"

interface TimelineEvent {
  time?: string
  date?: string
  title?: string
  description?: string
  type?: "milestone" | "event"
  icon?: "box" | "truck" | "check"
}

// Mock order data - replace with actual API call
const mockOrders: Record<string, { status: string; events: TimelineEvent[] }> = {
  "ORD001": {
    status: "delivered",
    events: [
      { time: "11:20", date: "Nov 16", title: "Order Received", type: "milestone", icon: "box" },
      { description: "Your order is being processed in Dubai – UAE warehouse.", type: "event" },
      { time: "15:00", date: "Nov 16", description: "Your order is ready to be shipped from Dubai – UAE warehouse.", type: "event" },
      { time: "15:10", date: "Nov 16", title: "Your order is shipped", type: "milestone", icon: "truck" },
      { time: "10:00", date: "Nov 18", description: "Your order has arrived in Riyadh – KSA warehouse.", type: "event" },
      { time: "10:30", date: "Nov 18", description: "Your order has been picked up by ARAMEX and on the way to Jeddah.", type: "event" },
      { time: "17:00", date: "Nov 18", description: "Your order has arrived in Jeddah and expected scheduled delivery is 19th November.", type: "event" },
      { time: "08:00", date: "Nov 19", description: "Your order is out for delivery.", type: "event" },
      { time: "13:00", date: "Nov 19", title: "Delivered", type: "milestone", icon: "check" },
    ],
  },
  "ORD002": {
    status: "in-transit",
    events: [
      { time: "14:30", date: "May 19", title: "Order Received", type: "milestone", icon: "box" },
      { time: "16:00", date: "May 19", title: "Your order is shipped", type: "milestone", icon: "truck" },
      { description: "Your order is in transit.", type: "event" },
      { time: "09:00", date: "May 20", description: "Out for delivery today.", type: "event" },
    ],
  },
}

const BoxIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
    <path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM4 5h16v2H4z" />
  </svg>
)

const TruckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 3v5h-7z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="4,12 9,17 20,6" />
  </svg>
)

const MilestoneDot = ({ icon }: { icon?: "box" | "truck" | "check" }) => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      zIndex: 1,
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
      border: "2px solid white",
    }}
  >
    {icon === "box" && <BoxIcon />}
    {icon === "truck" && <TruckIcon />}
    {icon === "check" && <CheckIcon />}
  </div>
)

const SmallDot = () => (
  <div
    style={{
      width: 12,
      height: 12,
      borderRadius: "50%",
      backgroundColor: "#d1d5db",
      flexShrink: 0,
      marginTop: 6,
      zIndex: 1,
      border: "2px solid white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }}
  />
)

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState("")
  const [foundOrder, setFoundOrder] = useState<{ status: string; events: TimelineEvent[] } | null>(null)
  const [searched, setSearched] = useState(false)

  // Auto-load order from URL params
  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setSearchInput(code)
      performSearch(code)
    }
  }, [searchParams])

  const performSearch = (orderId: string) => {
    const id = orderId.toUpperCase().trim()
    const order = mockOrders[id as keyof typeof mockOrders]
    if (order) {
      setFoundOrder(order)
      setSearched(true)
    } else {
      setFoundOrder(null)
      setSearched(true)
    }
  }

  const handleSearch = () => {
    const orderId = searchInput.toUpperCase().trim()
    if (!orderId) {
      alert("Please enter an order ID")
      return
    }
    performSearch(orderId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-white">
        <BackHeader title="Track Your Order" />

        <div className="flex flex-col items-center px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h2>
          <p className="text-sm text-gray-500">Search your order ID to track shipment status and updates</p>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-md mb-10">
          <div className="bg-white rounded-lg p-5 border border-gray-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter order ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md active:scale-95"
              >
                Track
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Examples: <span className="font-semibold text-gray-600">ORD001</span> or <span className="font-semibold text-gray-600">ORD002</span></p>
          </div>
        </div>

        {/* Results Section */}
        {searched && !foundOrder && (
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg p-12 border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold mb-2">Order Not Found</p>
              <p className="text-sm text-gray-500 mb-6">Please check your order ID and try again</p>
              <button
                onClick={() => {
                  setSearchInput("")
                  setFoundOrder(null)
                  setSearched(false)
                }}
                className="w-full px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition"
              >
                Try Another Search
              </button>
            </div>
          </div>
        )}

        {/* Shipment Tracking Card */}
        {foundOrder && (
          <div
            style={{
              fontFamily: "'Segoe UI', sans-serif",
              background: "#fff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 360,
              padding: 20,
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>Shipment Details</h3>
              <span
                style={{
                  background: foundOrder.status === "delivered" ? "#ecfdf5" : "#eff6ff",
                  color: foundOrder.status === "delivered" ? "#059669" : "#0369a1",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 6,
                  letterSpacing: "0.5px",
                  border: foundOrder.status === "delivered" ? "1px solid #d1fae5" : "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {foundOrder.status === "delivered" && (
                  <svg width="10" height="10" viewBox="0 0 12 12">
                    <polyline points="1,6 5,10 11,2" stroke={foundOrder.status === "delivered" ? "#059669" : "#0369a1"} strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
                {foundOrder.status === "delivered" ? "DELIVERED" : foundOrder.status.toUpperCase().replace(/-/g, " ")}
              </span>
            </div>

            {/* Timeline */}
            <div>
              {foundOrder.events.map((event, idx) => {
                const isMilestone = event.type === "milestone"
                const isLast = idx === foundOrder.events.length - 1

                return (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 20px 1fr",
                      gap: "0 12px",
                      minHeight: 48,
                    }}
                  >
                    {/* Time column */}
                    <div style={{ textAlign: "right", paddingTop: 4 }}>
                      {event.time && (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
                            {event.time}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.3 }}>{event.date}</div>
                        </>
                      )}
                    </div>

                    {/* Dot + line column */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {isMilestone ? <MilestoneDot icon={event.icon} /> : <SmallDot />}
                      {!isLast && (
                        <div
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: "#e5e7eb",
                            minHeight: 32,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>

                    {/* Text column */}
                    <div style={{ paddingTop: 4, paddingBottom: 16 }}>
                      {event.title && (
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937", lineHeight: 1.4 }}>
                          {event.title}
                        </div>
                      )}
                      {event.description && (
                        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginTop: event.title ? 3 : 0 }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 24,
                borderTop: "2px solid #f3f4f6",
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                { label: "Delivery Type:", value: "2-6 Days" },
                { label: "Courier:", value: "ARAMEX" },
                { label: "Tracking #:", value: "7Y937849CV2" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "#9ca3af", minWidth: 100, fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#1f2937" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </AppShell>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="min-h-screen bg-white">
          <BackHeader title="Track Your Order" />
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </div>
      </AppShell>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}
