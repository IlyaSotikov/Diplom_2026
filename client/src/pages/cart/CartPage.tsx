import { Link } from 'react-router-dom'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './CartPage.module.css'

export function CartPage() {
  return (
    <div className={styles.page}>
      <PageTitle
        title="Корзина"
        subtitle="Каркас сценария: просмотр корзины → оформление заказа (будет реализовано на следующих этапах)."
      />

      <div className={styles.grid}>
        <Card className={styles.left}>
          <div className={styles.sectionTitle}>Товары</div>
          <div className={styles.empty}>Пока корзина пустая (заглушка).</div>
          <Link className={styles.link} to="/">
            ← Вернуться в каталог
          </Link>
        </Card>

        <Card className={styles.right}>
          <div className={styles.sectionTitle}>Итого</div>
          <div className={styles.row}>
            <span>Сумма</span>
            <span>0 ₽</span>
          </div>
          <div className={styles.row}>
            <span>Доставка</span>
            <span>—</span>
          </div>
          <button type="button" className={styles.checkout} disabled>
            Оформить заказ
          </button>
          <div className={styles.hint}>Кнопка будет активна после добавления товаров и данных.</div>
        </Card>
      </div>
    </div>
  )
}

