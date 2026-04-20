import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../../entities/auth/api/authApi'
import type { AuthUser } from '../../entities/auth/model/types'

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<void>
  register: (payload: { fullName: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authApi.me()
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: { fullName: string; email: string; password: string }) => {
    const response = await authApi.register(payload)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [isLoading, login, logout, refresh, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

