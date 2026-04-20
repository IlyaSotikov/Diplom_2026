import { http } from '../../../shared/api/http'
import type { ProductReview } from '../model/types'

export const reviewsApi = {
  list(productId: string, page = 1, pageSize = 5) {
    const q = new URLSearchParams({ productId, page: String(page), pageSize: String(pageSize) })
    return http<{ ok: boolean; reviews: ProductReview[]; total: number; page: number; pageSize: number }>(
      `/api/reviews?${q.toString()}`,
    )
  },

  create(payload: { productId: string; text: string; rating: number }) {
    return http<{ ok: boolean; review: ProductReview }>('/api/reviews', {
      method: 'POST',
      body: payload,
    })
  },
}
