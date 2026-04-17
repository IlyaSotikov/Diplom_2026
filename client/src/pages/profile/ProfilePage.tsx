import { useEffect, useState } from 'react'
import { useProfileData } from '../../app/hooks/useProfileData'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { status, profile, orders, message, isSaving, saveProfile, reload } = useProfileData()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    defaultAddress: '',
  })
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setForm(profile)
  }, [profile])

  async function handleSave() {
    setSaveSuccess(null)
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.defaultAddress.trim()) {
      return
    }
    await saveProfile({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      defaultAddress: form.defaultAddress.trim(),
    })
    setSaveSuccess('Профиль обновлён.')
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="Личный кабинет"
        subtitle="Профиль пользователя, адрес доставки и история оформленных заказов."
      />

      <div className={styles.grid}>
        <Card>
          <div className={styles.sectionTitle}>Профиль</div>
          {status === 'loading' ? <div className={styles.muted}>Загрузка профиля...</div> : null}
          {status === 'error' ? (
            <div className={styles.errorBox}>
              <div>{message}</div>
              <button type="button" className={styles.retry} onClick={reload}>
                Повторить
              </button>
            </div>
          ) : null}

          <div className={styles.form}>
            <input
              className={styles.input}
              value={form.fullName}
              placeholder="ФИО"
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <input
              className={styles.input}
              value={form.email}
              placeholder="Email"
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              className={styles.input}
              value={form.phone}
              placeholder="Телефон"
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <button type="button" className={styles.primaryButton} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Сохраняем...' : 'Сохранить профиль'}
            </button>
            {saveSuccess ? <div className={styles.success}>{saveSuccess}</div> : null}
          </div>
        </Card>

        <Card>
          <div className={styles.sectionTitle}>История заказов</div>
          {orders.length === 0 ? (
            <div className={styles.muted}>Пока нет заказов.</div>
          ) : (
            <div className={styles.orders}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderTop}>
                    <span>{order.id}</span>
                    <span>{new Date(order.createdAtIso).toLocaleString('ru-RU')}</span>
                  </div>
                  <div className={styles.muted}>Статус: {order.status}</div>
                  <div className={styles.muted}>Сумма: {order.totalRub.toLocaleString('ru-RU')} ₽</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className={styles.sectionTitle}>Адреса доставки</div>
          {form.defaultAddress ? (
            <div className={styles.addressBlock}>{form.defaultAddress}</div>
          ) : (
            <div className={styles.muted}>Добавьте адрес в профиле.</div>
          )}
          <textarea
            className={styles.textarea}
            value={form.defaultAddress}
            placeholder="Основной адрес доставки"
            onChange={(event) => setForm((prev) => ({ ...prev, defaultAddress: event.target.value }))}
          />
        </Card>
      </div>
    </div>
  )
}

