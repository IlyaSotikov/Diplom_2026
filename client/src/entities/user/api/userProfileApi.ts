import type { UserProfile } from '../model/types'

const STORAGE_KEY = 'sportshop.profile.v1'

const fallbackProfile: UserProfile = {
  fullName: 'Илья Сотиков',
  email: 'ilya@example.com',
  phone: '+7 (900) 000-00-00',
  defaultAddress: 'г. Москва, ул. Примерная, д. 1',
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return fallbackProfile
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return fallbackProfile
  }

  try {
    const parsed = JSON.parse(raw) as UserProfile
    if (!parsed.fullName || !parsed.email || !parsed.phone || !parsed.defaultAddress) {
      return fallbackProfile
    }
    return parsed
  } catch {
    return fallbackProfile
  }
}

function writeProfile(profile: UserProfile) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export const userProfileApi = {
  async get() {
    await delay(160)
    return readProfile()
  },

  async update(profile: UserProfile) {
    await delay(160)
    writeProfile(profile)
    return profile
  },
}

