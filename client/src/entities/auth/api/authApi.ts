import { http } from '../../../shared/api/http'
import type { AuthUser } from '../model/types'

type AuthResponse = {
  ok: boolean
  user: AuthUser | null
}

export const authApi = {
  me() {
    return http<AuthResponse>('/api/auth/me')
  },

  register(payload: { fullName: string; email: string; password: string }) {
    return http<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
  },

  login(payload: { email: string; password: string }) {
    return http<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    })
  },

  logout() {
    return http<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    })
  },
}

