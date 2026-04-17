import type { CartItem, CartSnapshot } from '../model/types'

const STORAGE_KEY = 'sportshop.cart.v1'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createEmptySnapshot(): CartSnapshot {
  return {
    items: [],
    updatedAtIso: new Date().toISOString(),
  }
}

function readSnapshot(): CartSnapshot {
  if (typeof window === 'undefined') {
    return createEmptySnapshot()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return createEmptySnapshot()
  }

  try {
    const parsed = JSON.parse(raw) as CartSnapshot
    if (!Array.isArray(parsed.items) || typeof parsed.updatedAtIso !== 'string') {
      return createEmptySnapshot()
    }
    return parsed
  } catch {
    return createEmptySnapshot()
  }
}

function writeSnapshot(snapshot: CartSnapshot) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

function saveItems(items: CartItem[]): CartSnapshot {
  const snapshot: CartSnapshot = {
    items,
    updatedAtIso: new Date().toISOString(),
  }
  writeSnapshot(snapshot)
  return snapshot
}

export const cartApi = {
  async getSnapshot() {
    await delay(180)
    return readSnapshot()
  },

  async addItem(payload: Omit<CartItem, 'quantity'>) {
    await delay(180)
    const current = readSnapshot()
    const existing = current.items.find((item) => item.productId === payload.productId)

    if (existing) {
      const nextItems = current.items.map((item) =>
        item.productId === payload.productId ? { ...item, quantity: item.quantity + 1 } : item,
      )
      return saveItems(nextItems)
    }

    return saveItems([...current.items, { ...payload, quantity: 1 }])
  },

  async setQuantity(productId: string, quantity: number) {
    await delay(140)
    const current = readSnapshot()
    const normalizedQuantity = Math.max(0, Math.floor(quantity))
    const nextItems = current.items
      .map((item) => (item.productId === productId ? { ...item, quantity: normalizedQuantity } : item))
      .filter((item) => item.quantity > 0)

    return saveItems(nextItems)
  },

  async removeItem(productId: string) {
    await delay(140)
    const current = readSnapshot()
    const nextItems = current.items.filter((item) => item.productId !== productId)
    return saveItems(nextItems)
  },

  async clear() {
    await delay(120)
    return saveItems([])
  },
}

