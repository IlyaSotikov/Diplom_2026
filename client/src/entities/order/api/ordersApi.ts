import type { CartItem } from '../../cart/model/types'
import type { Order, OrderContact, OrderStatus } from '../model/types'

const STORAGE_KEY = 'sportshop.orders.v1'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readOrders(): Order[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.priceRub * item.quantity, 0)
}

function generateOrderId() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const seed = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ORD-${y}${m}${d}-${seed}`
}

export const ordersApi = {
  async list() {
    await delay(180)
    const orders = readOrders().sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
    return orders
  },

  async create(payload: { items: CartItem[]; contact: OrderContact }) {
    await delay(240)
    if (payload.items.length === 0) {
      throw new Error('Нельзя оформить заказ с пустой корзиной.')
    }

    const order: Order = {
      id: generateOrderId(),
      createdAtIso: new Date().toISOString(),
      status: 'new',
      items: payload.items,
      totalRub: calculateTotal(payload.items),
      contact: payload.contact,
    }

    const current = readOrders()
    const next = [order, ...current]
    writeOrders(next)
    return order
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    await delay(140)
    const current = readOrders()
    const next = current.map((order) => (order.id === orderId ? { ...order, status } : order))
    writeOrders(next)
    return next.find((order) => order.id === orderId) ?? null
  },
}

