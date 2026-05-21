import { BASE_URL } from "@/src/api/_shared/client"

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  union?: string | null;
  orderNotes?: string | null;
  promoCode?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    color?: string | null;
    size?: string | null;
  }>;
};

export const placeOrderAPI = async (payload: CheckoutPayload) => {
  const response = await fetch(`${BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    throw data || { message: "Checkout failed", statusCode: response.status }
  }

  return data.data
}
