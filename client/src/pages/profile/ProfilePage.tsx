import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  return (
    <div className={styles.page}>
      <PageTitle
        title="Личный кабинет"
        subtitle="Каркас сценария: просмотр профиля → история заказов → адреса доставки (заглушки)."
      />

      <div className={styles.grid}>
        <Card>
          <div className={styles.sectionTitle}>Профиль</div>
          <div className={styles.muted}>Имя: —</div>
          <div className={styles.muted}>Email: —</div>
        </Card>

        <Card>
          <div className={styles.sectionTitle}>История заказов</div>
          <div className={styles.muted}>Пока нет заказов (заглушка).</div>
        </Card>

        <Card>
          <div className={styles.sectionTitle}>Адреса доставки</div>
          <div className={styles.muted}>Адресов нет (заглушка).</div>
        </Card>
      </div>
    </div>
  )
}

