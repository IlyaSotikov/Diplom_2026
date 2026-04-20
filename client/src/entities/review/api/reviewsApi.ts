import { http } from '../../../shared/api/http'
import type { ProductReview } from '../model/types'

export const reviewsApi = {
  list(productId: string) {
    const q = new URLSearchParams({ productId })
    return http<{ ok: boolean; reviews: ProductReview[] }>(`/api/reviews?${q.toString()}`)
  },

  create(payload: { productId: string; text: string; rating: number }) {
    return http<{ ok: boolean; review: ProductReview }>('/api/reviews', {
      method: 'POST',
      body: payload,
    })
  },
}
