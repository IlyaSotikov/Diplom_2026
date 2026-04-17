import { Container } from './Container'
import styles from './AppFooter.module.css'

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.row}>
          <span>© {new Date().getFullYear()} SportShop</span>
          <span className={styles.muted}>ЛР‑5: финализация и стабилизация</span>
        </div>
      </Container>
    </footer>
  )
}

