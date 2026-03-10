import { Link } from 'react-router-dom'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Страница не найдена" subtitle="Ошибка 404 (заглушка)." />
      <Card>
        <Link className={styles.link} to="/">
          ← В каталог
        </Link>
      </Card>
    </div>
  )
}

