import { Link } from 'react-router-dom'
import { useCart } from '../../app/hooks/useCart'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './CartPage.module.css'

export function CartPage() {
  const { status, items, totalRub, isMutating, setQuantity, removeItem, clear, message, reload } = useCart()

  return (
    <div className={styles.page}>
      <PageTitle
        title="Корзина"
        subtitle="Сценарий: просмотр корзины, изменение количества, удаление товаров и подсчёт итоговой суммы."
      />

      <div className={styles.grid}>
        <Card className={styles.left}>
          <div className={styles.sectionTitle}>Товары</div>
          {status === 'loading' ? <div className={styles.empty}>Загрузка корзины...</div> : null}

          {status === 'error' ? (
            <div className={styles.errorBox}>
              <div>{message}</div>
              <button type="button" className={styles.retry} onClick={reload}>
                Повторить
              </button>
            </div>
          ) : null}

          {status !== 'loading' && status !== 'error' && items.length === 0 ? (
            <>
              <div className={styles.empty}>Корзина пока пуста.</div>
              <Link className={styles.link} to="/">
                ← Вернуться в каталог
              </Link>
            </>
          ) : null}

          {items.length > 0 ? (
            <div className={styles.list}>
              {items.map((item) => (
                <div key={item.productId} className={styles.item}>
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemPrice}>{item.priceRub.toLocaleString('ru-RU')} ₽</div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      disabled={isMutating}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={isMutating}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeItem(item.productId)}
                      disabled={isMutating}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className={styles.right}>
          <div className={styles.sectionTitle}>Итого</div>
          <div className={styles.row}>
            <span>Сумма</span>
            <span>{totalRub.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className={styles.row}>
            <span>Доставка</span>
            <span>{items.length > 0 ? 'Бесплатно' : '—'}</span>
          </div>
          <button type="button" className={styles.checkout} disabled={items.length === 0 || isMutating}>
            Оформить заказ
          </button>
          <button
            type="button"
            className={styles.clear}
            onClick={clear}
            disabled={items.length === 0 || isMutating}
          >
            Очистить корзину
          </button>
          <div className={styles.hint}>Оформление заказа будет реализовано на следующем этапе.</div>
        </Card>
      </div>
    </div>
  )
}

