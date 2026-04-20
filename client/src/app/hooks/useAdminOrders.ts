import { useCallback, useEffect, useState } from 'react'
import { ordersApi } from '../../entities/order/api/ordersApi'
import type { Order, OrderStatus } from '../../entities/order/model/types'
import { productsApi } from '../../entities/product/api/productsApi'
import type { Product } from '../../entities/product/model/types'

type State = {
  status: 'loading' | 'success' | 'error'
  orders: Order[]
  products: Product[]
  message: string | null
}

export function useAdminOrders() {
  const [state, setState] = useState<State>({
    status: 'loading',
    orders: [],
    products: [],
    message: null,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', message: null }))
    try {
      const [orders, products] = await Promise.all([ordersApi.listAll(), productsApi.list()])
      setState({
        status: 'success',
        orders,
        products,
        message: null,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить данные админ-панели.'
      setState({
        status: 'error',
        orders: [],
        products: [],
        message,
      })
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const setOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setIsUpdating(true)
    try {
      await ordersApi.updateStatus(orderId, status)
      const orders = await ordersApi.list()
      setState((prev) => ({
        ...prev,
        status: 'success',
        orders,
        message: null,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус заказа.'
      setState((prev) => ({
        ...prev,
        status: 'error',
        message,
      }))
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return {
    ...state,
    isUpdating,
    reload,
    setOrderStatus,
  }
}

