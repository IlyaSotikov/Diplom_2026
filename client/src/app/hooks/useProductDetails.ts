import { useEffect, useState } from 'react'
import { productsApi } from '../../entities/product/api/productsApi'
import type { Product } from '../../entities/product/model/types'

type ProductState =
  | { status: 'loading'; product: Product | null; message?: string }
  | { status: 'success'; product: Product | null; message?: string }
  | { status: 'error'; product: Product | null; message: string }

export function useProductDetails(productId: string | undefined) {
  const [state, setState] = useState<ProductState>({
    status: 'loading',
    product: null,
  })

  useEffect(() => {
    if (!productId) {
      setState({
        status: 'error',
        product: null,
        message: 'Некорректный идентификатор товара.',
      })
      return
    }

    let cancelled = false
    setState((prev) => ({
      status: 'loading',
      product: prev.product,
    }))

    productsApi
      .getById(productId)
      .then((product) => {
        if (cancelled) return
        setState({
          status: 'success',
          product,
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Не удалось получить карточку товара.'
        setState({
          status: 'error',
          product: null,
          message,
        })
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  return state
}

