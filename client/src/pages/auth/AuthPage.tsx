import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './AuthPage.module.css'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/profile'

  async function handleSubmit() {
    setError(null)
    setIsLoading(true)
    try {
      if (mode === 'register') {
        await register({
          fullName,
          email,
          password,
        })
      } else {
        await login({ email, password })
      }
      navigate(redirectPath, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка авторизации.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title={mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        subtitle="Авторизация пользователя через PHP и MySQL."
      />

      <Card className={styles.card}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, mode === 'login' ? styles.tabActive : ''].join(' ')}
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={[styles.tab, mode === 'register' ? styles.tabActive : ''].join(' ')}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>

        {mode === 'register' ? (
          <input
            className={styles.input}
            placeholder="Имя"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        ) : null}

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="button" className={styles.submit} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>
    </div>
  )
}

