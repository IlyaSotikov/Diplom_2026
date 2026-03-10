import type { ReactNode } from 'react'
import { Container } from './Container'
import styles from './AppHeader.module.css'

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.row}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true" />
            <div>
              <div className={styles.title}>SportShop</div>
              <div className={styles.subtitle}>Интернет‑магазин спортивных товаров</div>
            </div>
          </div>
          <div className={styles.right}>{children}</div>
        </div>
      </Container>
    </header>
  )
}

