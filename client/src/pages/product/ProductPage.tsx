import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useCart } from '../../app/hooks/useCart'
import { useProductDetails } from '../../app/hooks/useProductDetails'
import { reviewsApi } from '../../entities/review/api/reviewsApi'
import type { ProductReview } from '../../entities/review/model/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './ProductPage.module.css'

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const { user } = useAuth()
  const [isAddedNoticeVisible, setIsAddedNoticeVisible] = useState(false)
  const { status, product, message } = useProductDetails(productId)
  const { addItem, isMutating } = useCart()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsStatus, setReviewsStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const loadReviews = useCallback(async () => {
    if (!productId) return
    setReviewsStatus('loading')
    setReviewsError(null)
    try {
      const res = await reviewsApi.list(productId)
      setReviews(res.reviews)
      setReviewsStatus('idle')
    } catch (e: unknown) {
      setReviewsStatus('error')
      setReviewsError(e instanceof Error ? e.message : 'Не удалось загрузить отзывы.')
    }
  }, [productId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  async function handleSubmitReview() {
    if (!productId || !user) return
    setReviewSubmitting(true)
    try {
      const res = await reviewsApi.create({
        productId,
        text: reviewText.trim(),
        rating: reviewRating,
      })
      setReviews((prev) => [res.review, ...prev])
      setReviewText('')
      setReviewRating(5)
    } catch (e: unknown) {
      setReviewsError(e instanceof Error ? e.message : 'Не удалось отправить отзыв.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleAddToCart() {
    if (!product || !product.inStock) return
    await addItem({
      productId: product.id,
      title: product.title,
      priceRub: product.priceRub,
    })
    setIsAddedNoticeVisible(true)
    window.setTimeout(() => setIsAddedNoticeVisible(false), 1800)
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="Карточка товара"
        subtitle="Фото, описание, отзывы покупателей и добавление в корзину."
      />

      {status === 'error' ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorTitle}>Ошибка загрузки товара</div>
          <div className={styles.errorText}>{message}</div>
          <Link className={styles.back} to="/">
            ← В каталог
          </Link>
        </Card>
      ) : null}

      {status === 'loading' ? (
        <Card>
          <div className={styles.loading}>
            <div className={styles.loadingBar} />
            <div className={styles.loadingBar} />
            <div className={styles.loadingBar} />
          </div>
        </Card>
      ) : status === 'error' ? null : product === null ? (
        <Card>
          <div className={styles.empty}>Товар не найден.</div>
        </Card>
      ) : (
        <Card className={styles.card}>
          <div className={styles.hero}>
            <img className={styles.image} src={product.imageUrl} alt={product.title} />
            <div className={styles.info}>
              <div className={styles.title}>{product.title}</div>
              <div className={styles.meta}>
                <span>Бренд: {product.brand}</span>
                <span className={styles.dot} aria-hidden="true">
                  •
                </span>
                <span>{product.inStock ? 'В наличии' : 'Нет на складе'}</span>
              </div>
              <div className={styles.price}>{product.priceRub.toLocaleString('ru-RU')} ₽</div>
              <div className={styles.actions}>
                <Button disabled={!product.inStock || isMutating} onClick={handleAddToCart}>
                  {isMutating ? 'Добавление...' : 'Добавить в корзину'}
                </Button>
                <Link className={styles.linkGhost} to="/cart">
                  Перейти в корзину
                </Link>
                <Link className={styles.linkGhost} to="/">
                  ← Назад
                </Link>
              </div>
              <div className={styles.desc}>{product.shortDescription}</div>
              {isAddedNoticeVisible ? <div className={styles.notice}>Товар добавлен в корзину.</div> : null}
            </div>
          </div>
        </Card>
      )}

      {product && status === 'success' ? (
        <Card className={styles.reviewsCard}>
          <div className={styles.reviewsTitle}>Отзывы</div>
          {reviewsStatus === 'error' ? <div className={styles.reviewsErr}>{reviewsError}</div> : null}
          {user ? (
            <div className={styles.reviewForm}>
              <label className={styles.reviewLabel}>
                Оценка
                <select
                  className={styles.reviewSelect}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} из 5
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                className={styles.reviewTextarea}
                placeholder="Ваш отзыв о товаре"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
              <Button type="button" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
            </div>
          ) : (
            <div className={styles.reviewHint}>
              Чтобы оставить отзыв,{' '}
              <Link className={styles.reviewLink} to="/auth">
                войдите в аккаунт
              </Link>
              .
            </div>
          )}
          {reviewsStatus === 'loading' ? <div className={styles.reviewHint}>Загрузка отзывов...</div> : null}
          <ul className={styles.reviewList}>
            {reviews.map((r) => (
              <li key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewAuthor}>{r.author_name}</span>
                  <span className={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className={styles.reviewDate}>
                    {new Date(r.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className={styles.reviewBody}>{r.text}</div>
              </li>
            ))}
          </ul>
          {!reviews.length && reviewsStatus !== 'loading' ? (
            <div className={styles.reviewHint}>Пока нет отзывов — будьте первым.</div>
          ) : null}
        </Card>
      ) : null}
    </div>
  )
}

