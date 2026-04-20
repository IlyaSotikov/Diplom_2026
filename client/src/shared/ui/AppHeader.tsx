import type { ReactNode } from 'react'
import { Container } from './Container'
import styles from './AppHeader.module.css'
import logoImage from '../../assets/sshop-logo.png'

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.row}>
          <div className={styles.brand}>
            <img className={styles.logo} src={logoImage} alt="Логотип SShop" />
            <div>
              <div className={styles.title}>SShop</div>
              <div className={styles.subtitle}>Интернет‑магазин спортивных товаров</div>
            </div>
          </div>
          <div className={styles.right}>{children}</div>
        </div>
      </Container>
    </header>
  )
}

