import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogProducts } from '../../app/hooks/useCatalogProducts'
import type { ProductCategory } from '../../entities/product/model/types'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './CatalogPage.module.css'

const categories: Array<{ key: ProductCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'football', label: 'Футбол' },
  { key: 'running', label: 'Бег' },
  { key: 'fitness', label: 'Фитнес' },
]

export function CatalogPage() {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const { status, items, message } = useCatalogProducts(category)

  return (
    <div className={styles.page}>
      <PageTitle
        title="Каталог"
        subtitle="Каркас интерфейса для сценария: просмотр категорий → выбор товара → переход в карточку."
      />

      <Card className={styles.filters}>
        <div className={styles.filterRow}>
          <span className={styles.label}>Категория</span>
          <div className={styles.pills}>
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={[styles.pill, category === c.key ? styles.pillActive : null]
                  .filter(Boolean)
                  .join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {status === 'error' ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorTitle}>Не удалось загрузить каталог</div>
          <div className={styles.errorText}>{message}</div>
        </Card>
      ) : null}

      <div className={styles.grid}>
        {status === 'loading'
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} aria-hidden="true" />
            ))
          : items.map((p) => (
              <Card key={p.id} className={styles.productCard}>
                <div className={styles.productTop}>
                  <div className={styles.productTitle}>{p.title}</div>
                  <div className={styles.productMeta}>
                    <span>{p.brand}</span>
                    <span className={styles.dot} aria-hidden="true">
                      •
                    </span>
                    <span>{p.inStock ? 'В наличии' : 'Нет на складе'}</span>
                  </div>
                </div>
                <div className={styles.productBottom}>
                  <div className={styles.price}>{p.priceRub.toLocaleString('ru-RU')} ₽</div>
                  <Link className={styles.openLink} to={`/product/${p.id}`}>
                    Открыть
                  </Link>
                </div>
              </Card>
            ))}
      </div>
    </div>
  )
}

