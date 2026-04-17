import { useCallback, useEffect, useMemo, useState } from 'react'
import { cartApi } from '../../entities/cart/api/cartApi'
import type { CartItem } from '../../entities/cart/model/types'

type CartState = {
  status: 'loading' | 'success' | 'error'
  items: CartItem[]
  message: string | null
}

export function useCart() {
  const [state, setState] = useState<CartState>({
    status: 'loading',
    items: [],
    message: null,
  })
  const [isMutating, setIsMutating] = useState(false)

  const loadCart = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', message: null }))
    try {
      const snapshot = await cartApi.getSnapshot()
      setState({
        status: 'success',
        items: snapshot.items,
        message: null,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить корзину.'
      setState({
        status: 'error',
        items: [],
        message,
      })
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const wrapMutation = useCallback(async (mutate: () => Promise<void>) => {
    setIsMutating(true)
    try {
      await mutate()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить корзину.'
      setState((prev) => ({
        ...prev,
        status: 'error',
        message,
      }))
    } finally {
      setIsMutating(false)
    }
  }, [])

  const addItem = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      await wrapMutation(async () => {
        const snapshot = await cartApi.addItem(item)
        setState({
          status: 'success',
          items: snapshot.items,
          message: null,
        })
      })
    },
    [wrapMutation],
  )

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      await wrapMutation(async () => {
        const snapshot = await cartApi.setQuantity(productId, quantity)
        setState({
          status: 'success',
          items: snapshot.items,
          message: null,
        })
      })
    },
    [wrapMutation],
  )

  const removeItem = useCallback(
    async (productId: string) => {
      await wrapMutation(async () => {
        const snapshot = await cartApi.removeItem(productId)
        setState({
          status: 'success',
          items: snapshot.items,
          message: null,
        })
      })
    },
    [wrapMutation],
  )

  const clear = useCallback(async () => {
    await wrapMutation(async () => {
      const snapshot = await cartApi.clear()
      setState({
        status: 'success',
        items: snapshot.items,
        message: null,
      })
    })
  }, [wrapMutation])

  const totalRub = useMemo(
    () => state.items.reduce((sum, item) => sum + item.priceRub * item.quantity, 0),
    [state.items],
  )

  const itemsCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  )

  return {
    ...state,
    isMutating,
    totalRub,
    itemsCount,
    reload: loadCart,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }
}

