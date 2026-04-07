// backend/src/shared/types/event.types.ts
// Typed Socket.IO event payloads shared across socket handlers and consumers.

export interface StockUpdatePayload {
  productId: string
  stock: number
  companyId: string
}

export interface LowStockPayload {
  productId: string
  currentStock: number
  threshold: number
  companyId: string
}

export interface NewOrderPayload {
  orderId: string
  total: number
  companyId: string
}

export interface PaymentPayload {
  orderId: string
  amount: number
  companyId: string
}

export interface NotificationPayload {
  userId: string
  notification: {
    title: string
    message: string
    type?: string
  }
}

// Generic fallback for untyped events
export type EventPayload = Record<string, unknown>
