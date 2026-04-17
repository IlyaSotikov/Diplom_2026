import { useEffect, useMemo, useState } from 'react'
import { productsApi } from '../../entities/product/api/productsApi'
import type { Product, ProductCategory } from '../../entities/product/model/types'

type CatalogState =
  | { status: 'loading'; items: Product[]; message: null }
  | { status: 'success'; items: Product[]; message: null }
  | { status: 'error'; items: Product[]; message: string }

export function useCatalogProducts(category: ProductCategory | 'all') {
  const [state, setState] = useState<CatalogState>({
    status: 'loading',
    items: [],
    message: null,
  })

  const apiParams = useMemo(
    () => (category === 'all' ? undefined : { category }),
    [category],
  )

  useEffect(() => {
    let cancelled = false

    setState((prev) => ({
      status: 'loading',
      items: prev.items,
      message: null,
    }))

    productsApi
      .list(apiParams)
      .then((items) => {
        if (cancelled) return
        setState({
          status: 'success',
          items,
          message: null,
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Не удалось загрузить каталог.'
        setState((prev) => ({
          status: 'error',
          items: prev.items,
          message,
        }))
      })

    return () => {
      cancelled = true
    }
  }, [apiParams])

  return state
}

