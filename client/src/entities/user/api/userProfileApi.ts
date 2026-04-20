import type { UserProfile } from '../model/types'
import { http } from '../../../shared/api/http'

export const userProfileApi = {
  async get() {
    const response = await http<{ ok: boolean; profile: UserProfile }>('/api/profile')
    return response.profile
  },

  async update(profile: UserProfile) {
    const response = await http<{ ok: boolean; profile: UserProfile }>('/api/profile', {
      method: 'POST',
      body: profile,
    })
    return response.profile
  },
}

