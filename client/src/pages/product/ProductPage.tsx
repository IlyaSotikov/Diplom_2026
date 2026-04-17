import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../app/hooks/useCart'
import { useProductDetails } from '../../app/hooks/useProductDetails'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './ProductPage.module.css'

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const [isAddedNoticeVisible, setIsAddedNoticeVisible] = useState(false)
  const { status, product, message } = useProductDetails(productId)
  const { addItem, isMutating } = useCart()

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
        subtitle="Каркас сценария: просмотр товара → добавление в корзину → переход в корзину."
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
            <div className={styles.image} aria-hidden="true" />
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
    </div>
  )
}

