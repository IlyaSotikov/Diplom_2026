import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './AdminPage.module.css'

export function AdminPage() {
  return (
    <div className={styles.page}>
      <PageTitle
        title="Административная панель"
        subtitle="Каркас сценария: управление товарами/категориями/заказами/пользователями (заглушки)."
      />

      <div className={styles.grid}>
        <Card>
          <div className={styles.sectionTitle}>Товары</div>
          <div className={styles.muted}>Список / редактирование / добавление — будет позже.</div>
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Категории</div>
          <div className={styles.muted}>CRUD категорий — будет позже.</div>
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Заказы</div>
          <div className={styles.muted}>Статусы и обработка — будет позже.</div>
        </Card>
        <Card>
          <div className={styles.sectionTitle}>Пользователи</div>
          <div className={styles.muted}>Роли и доступ — будет позже.</div>
        </Card>
      </div>
    </div>
  )
}

