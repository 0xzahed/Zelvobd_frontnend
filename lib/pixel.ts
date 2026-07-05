declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
  }
}

export const FB_PIXEL_ID = "2480835249066175"

export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView")
  }
}

export const purchase = (params: {
  value: number
  currency?: string
  orderId?: string
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value: params.value,
      currency: params.currency ?? "BDT",
      order_id: params.orderId,
    })
  }
}

export const addToCart = (params: {
  productId: string
  productName?: string
  value?: number
  currency?: string
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [params.productId],
      content_name: params.productName,
      value: params.value,
      currency: params.currency ?? "BDT",
      content_type: "product",
    })
  }
}

export const viewContent = (params: {
  productId: string
  productName?: string
  value?: number
  currency?: string
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [params.productId],
      content_name: params.productName,
      value: params.value,
      currency: params.currency ?? "BDT",
      content_type: "product",
    })
  }
}

export const initiateCheckout = (params: { value: number; numItems: number }) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: params.value,
      currency: "BDT",
      num_items: params.numItems,
    })
  }
}
