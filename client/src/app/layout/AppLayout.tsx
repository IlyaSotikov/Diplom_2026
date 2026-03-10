import { NavLink, Outlet } from 'react-router-dom'
import { Container } from '../../shared/ui/Container'
import { AppHeader } from '../../shared/ui/AppHeader'
import { AppFooter } from '../../shared/ui/AppFooter'
import styles from './AppLayout.module.css'

const navItems: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Каталог', end: true },
  { to: '/cart', label: 'Корзина' },
  { to: '/profile', label: 'Кабинет' },
  { to: '/admin', label: 'Админ' },
]

export function AppLayout() {
  return (
    <div className={styles.page}>
      <AppHeader>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : null].filter(Boolean).join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </AppHeader>

      <main className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>

      <AppFooter />
    </div>
  )
}

