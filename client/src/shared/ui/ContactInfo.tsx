import styles from './ContactInfo.module.css'

export function ContactInfo() {
  return (
    <section className={styles.box}>
      <div className={styles.title}>Контакты SShop</div>
      <div className={styles.row}>Телефон: +7 (999) 123-45-67</div>
      <div className={styles.row}>Email: support@sshop.local</div>
      <div className={styles.row}>Адрес: г. Москва, ул. Спортивная, д. 10</div>
    </section>
  )
}

