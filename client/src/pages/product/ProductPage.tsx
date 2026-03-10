import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../../entities/product/api/productsApi'
import type { Product } from '../../entities/product/model/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './ProductPage.module.css'

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const [product, setProduct] = useState<Product | null | 'loading'>('loading')

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setProduct('loading')
    productsApi.getById(productId).then((p) => {
      if (cancelled) return
      setProduct(p)
    })
    return () => {
      cancelled = true
    }
  }, [productId])

  if (!productId) {
    return (
      <div className={styles.page}>
        <PageTitle title="Товар" subtitle="Некорректный идентификатор товара." />
        <Link className={styles.back} to="/">
          ← В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="Карточка товара"
        subtitle="Каркас сценария: просмотр товара → добавление в корзину → переход в корзину."
      />

      {product === 'loading' ? (
        <Card>
          <div className={styles.loading}>
            <div className={styles.loadingBar} />
            <div className={styles.loadingBar} />
            <div className={styles.loadingBar} />
          </div>
        </Card>
      ) : product === null ? (
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
                <Button disabled={!product.inStock} onClick={() => undefined}>
                  Добавить в корзину
                </Button>
                <Link className={styles.linkGhost} to="/cart">
                  Перейти в корзину
                </Link>
                <Link className={styles.linkGhost} to="/">
                  ← Назад
                </Link>
              </div>
              <div className={styles.desc}>{product.shortDescription}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

