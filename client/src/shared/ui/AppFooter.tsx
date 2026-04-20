import { Container } from './Container'
import { useLocation } from 'react-router-dom'
import styles from './AppFooter.module.css'

export function AppFooter() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.row}>
          <span>© {new Date().getFullYear()} SShop</span>
          <span className={styles.muted}>Интернет-магазин спортивного питания</span>
        </div>
        {!isAdminRoute ? (
          <div className={styles.contacts}>
            <span className={styles.muted}>Тел.: +7 (999) 123-45-67</span>
            <span className={styles.muted}>Email: support@sshop.local</span>
            <span className={styles.muted}>Адрес: г. Москва, ул. Спортивная, д. 10</span>
          </div>
        ) : null}
      </Container>
    </footer>
  )
}

