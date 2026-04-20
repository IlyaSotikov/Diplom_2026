import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useCart } from '../../app/hooks/useCart'
import { ordersApi } from '../../entities/order/api/ordersApi'
import { Card } from '../../shared/ui/Card'
import { PageTitle } from '../../shared/ui/PageTitle'
import styles from './CartPage.module.css'

export function CartPage() {
  const { status, items, totalRub, isMutating, setQuantity, removeItem, clear, message, reload } = useCart()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  })
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const phonePattern = /^[0-9+()\-\s]{6,40}$/

  const canCheckout = useMemo(() => {
    return (
      items.length > 0 &&
      form.fullName.trim().length >= 2 &&
      phonePattern.test(form.phone.trim()) &&
      form.address.trim().length >= 6
    )
  }, [form.address, form.fullName, form.phone, items.length])

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckoutSuccess(null)

    if (!canCheckout) {
      setCheckoutError('Проверьте данные: ФИО (минимум 2 символа), корректный телефон и адрес (минимум 6 символов).')
      return
    }

    setIsCheckoutLoading(true)
    try {
      const order = await ordersApi.create({
        items,
        contact: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
      })
      await clear()
      setCheckoutSuccess(`Заказ ${order.id} успешно оформлен.`)
      setForm({ fullName: '', phone: '', address: '' })
    } catch (error: unknown) {
      setCheckoutError(error instanceof Error ? error.message : 'Ошибка оформления заказа.')
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="Корзина"
        subtitle="Сценарий: просмотр корзины, изменение количества, удаление товаров и подсчёт итоговой суммы."
      />

      <div className={styles.grid}>
        <Card className={styles.left}>
          <div className={styles.sectionTitle}>Товары</div>
          {status === 'loading' ? <div className={styles.empty}>Загрузка корзины...</div> : null}

          {status === 'error' ? (
            <div className={styles.errorBox}>
              <div>{message}</div>
              <button type="button" className={styles.retry} onClick={reload}>
                Повторить
              </button>
            </div>
          ) : null}

          {status !== 'loading' && status !== 'error' && items.length === 0 ? (
            <>
              <div className={styles.empty}>Корзина пока пуста.</div>
              <Link className={styles.link} to="/">
                ← Вернуться в каталог
              </Link>
            </>
          ) : null}

          {items.length > 0 ? (
            <div className={styles.list}>
              {items.map((item) => (
                <div key={item.productId} className={styles.item}>
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemPrice}>{item.priceRub.toLocaleString('ru-RU')} ₽</div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      disabled={isMutating}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={isMutating}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeItem(item.productId)}
                      disabled={isMutating}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className={styles.right}>
          <div className={styles.sectionTitle}>Итого</div>
          <div className={styles.row}>
            <span>Сумма</span>
            <span>{totalRub.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className={styles.row}>
            <span>Доставка</span>
            <span>{items.length > 0 ? 'Бесплатно' : '—'}</span>
          </div>
          <div className={styles.checkoutForm}>
            <div className={styles.formTitle}>Данные получателя</div>
            <input
              className={styles.input}
              placeholder="ФИО"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <input
              className={styles.input}
              placeholder="Телефон"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <textarea
              className={styles.textarea}
              placeholder="Адрес доставки"
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            />
            <button
              type="button"
              className={styles.checkoutPrimary}
              onClick={handleCheckout}
              disabled={!canCheckout || isCheckoutLoading || isMutating}
            >
              {isCheckoutLoading ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
            {checkoutError ? <div className={styles.errorInline}>{checkoutError}</div> : null}
            {checkoutSuccess ? (
              <div className={styles.successInline}>
                {checkoutSuccess} <Link to="/profile">Перейти в кабинет</Link>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.clear}
            onClick={clear}
            disabled={items.length === 0 || isMutating}
          >
            Очистить корзину
          </button>
          <div className={styles.hint}>После оформления заказ появится в личном кабинете и админ-панели.</div>
        </Card>
      </div>
    </div>
  )
}

