import type { CartItem } from '../../cart/model/types'

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'cancelled'

export type OrderContact = {
  fullName: string
  phone: string
  address: string
}

export type Order = {
  id: string
  createdAtIso: string
  status: OrderStatus
  items: CartItem[]
  totalRub: number
  contact: OrderContact
}

