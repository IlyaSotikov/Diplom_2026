import { useCallback, useEffect, useState } from 'react'
import { ordersApi } from '../../entities/order/api/ordersApi'
import type { Order } from '../../entities/order/model/types'
import { userProfileApi } from '../../entities/user/api/userProfileApi'
import type { UserProfile } from '../../entities/user/model/types'

type State = {
  status: 'loading' | 'success' | 'error'
  profile: UserProfile | null
  orders: Order[]
  message: string | null
}

const emptyProfile: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  defaultAddress: '',
}

export function useProfileData() {
  const [state, setState] = useState<State>({
    status: 'loading',
    profile: null,
    orders: [],
    message: null,
  })
  const [isSaving, setIsSaving] = useState(false)

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', message: null }))
    try {
      const [profile, orders] = await Promise.all([userProfileApi.get(), ordersApi.list()])
      setState({
        status: 'success',
        profile,
        orders,
        message: null,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить профиль.'
      setState({
        status: 'error',
        profile: emptyProfile,
        orders: [],
        message,
      })
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const saveProfile = useCallback(async (profile: UserProfile) => {
    setIsSaving(true)
    try {
      const saved = await userProfileApi.update(profile)
      setState((prev) => ({
        ...prev,
        status: 'success',
        profile: saved,
        message: null,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить профиль.'
      setState((prev) => ({
        ...prev,
        status: 'error',
        message,
      }))
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    ...state,
    isSaving,
    reload,
    saveProfile,
  }
}

