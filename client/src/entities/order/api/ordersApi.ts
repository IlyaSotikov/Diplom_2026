import type { CartItem } from '../../cart/model/types'
import type { Order, OrderContact, OrderStatus } from '../model/types'
import { http } from '../../../shared/api/http'

export const ordersApi = {
  async list() {
    const response = await http<{ ok: boolean; orders: Order[] }>('/api/orders')
    return response.orders
  },

  async listAll() {
    const response = await http<{ ok: boolean; orders: Order[] }>('/api/orders?all=1')
    return response.orders
  },

  async create(payload: { items: CartItem[]; contact: OrderContact }) {
    const response = await http<{ ok: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: payload,
    })
    return response.order
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    const response = await http<{ ok: boolean; order: Order }>('/api/orders/status', {
      method: 'POST',
      body: { orderId, status },
    })
    return response.order
  },
}

