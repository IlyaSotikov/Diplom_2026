import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './AuthPage.module.css'

type Mode = 'login' | 'register'
type FieldErrors = {
  fullName?: string
  email?: string
  password?: string
}

function validate(mode: Mode, values: { fullName: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  const email = values.email.trim()
  const password = values.password
  const fullName = values.fullName.trim()

  if (mode === 'register' && fullName.length < 2) {
    errors.fullName = 'Имя должно содержать минимум 2 символа.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Введите корректный email.'
  }

  if (password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов.'
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Пароль должен содержать хотя бы одну букву и одну цифру.'
  }

  return errors
}

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/profile'

  async function handleSubmit() {
    const nextErrors = validate(mode, { fullName, email, password })
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

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
        subtitle="Войдите в аккаунт или создайте новый."
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
          <div>
            <input
              className={styles.input}
              placeholder="Имя"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value)
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }))
                }
              }}
            />
            {fieldErrors.fullName ? <div className={styles.fieldError}>{fieldErrors.fullName}</div> : null}
          </div>
        ) : null}

        <div>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
          />
          {fieldErrors.email ? <div className={styles.fieldError}>{fieldErrors.email}</div> : null}
        </div>
        <div>
          <input
            className={styles.input}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
          />
          {fieldErrors.password ? <div className={styles.fieldError}>{fieldErrors.password}</div> : null}
        </div>

        <button type="button" className={styles.submit} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>
    </div>
  )
}

