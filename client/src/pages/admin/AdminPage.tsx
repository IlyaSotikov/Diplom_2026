import { useMemo } from 'react'
import { useAdminOrders } from '../../app/hooks/useAdminOrders'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './AdminPage.module.css'

const statuses = ['new', 'processing', 'shipped', 'cancelled'] as const

export function AdminPage() {
  const { status, orders, products, message, isUpdating, setOrderStatus, reload } = useAdminOrders()
  const inStockCount = useMemo(() => products.filter((product) => product.inStock).length, [products])

  return (
    <div className={styles.page}>
      <PageTitle
        title="Административная панель"
        subtitle="Управление заказами и контроль доступности товарного каталога."
      />

      <div className={styles.grid}>
        <Card>
          <div className={styles.sectionTitle}>Товары (сводка)</div>
          {status === 'loading' ? <div className={styles.muted}>Загрузка...</div> : null}
          {status === 'error' ? (
            <div className={styles.errorBox}>
              <div>{message}</div>
              <button type="button" className={styles.retry} onClick={reload}>
                Повторить
              </button>
            </div>
          ) : null}
          <div className={styles.muted}>Всего товаров: {products.length}</div>
          <div className={styles.muted}>В наличии: {inStockCount}</div>
          <div className={styles.muted}>Нет на складе: {products.length - inStockCount}</div>
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Категории</div>
          <div className={styles.muted}>
            {Array.from(new Set(products.map((product) => product.category)))
              .map((category) => `• ${category}`)
              .join('\n') || 'Категории отсутствуют'}
          </div>
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Заказы</div>
          {orders.length === 0 ? (
            <div className={styles.muted}>Заказов пока нет.</div>
          ) : (
            <div className={styles.orders}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderTop}>
                    <span>{order.id}</span>
                    <span>{order.totalRub.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className={styles.muted}>{new Date(order.createdAtIso).toLocaleString('ru-RU')}</div>
                  <select
                    className={styles.select}
                    value={order.status}
                    onChange={(event) => setOrderStatus(order.id, event.target.value as (typeof statuses)[number])}
                    disabled={isUpdating}
                  >
                    {statuses.map((statusKey) => (
                      <option key={statusKey} value={statusKey}>
                        {statusKey}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Пользователи</div>
          <div className={styles.muted}>Активные пользователи: 1</div>
          <div className={styles.muted}>Роль: admin</div>
          <div className={styles.muted}>Модуль ролей готов к расширению.</div>
        </Card>
      </div>
    </div>
  )
}

