# Server (PHP + MySQL)

Серверная часть проекта для XAMPP реализована на PHP (без фреймворка) с авторизацией через сессии.

## Подготовка БД

1. Откройте phpMyAdmin.
2. Импортируйте файл `server/database/schema.sql`.
3. Убедитесь, что создана база `sshop_db` и таблицы **`users`**, **`product_reviews`**, **`orders`**.
4. Для выдачи админ-доступа выполните SQL:
   `UPDATE users SET is_admin = 1 WHERE email = 'your_admin_email@example.com';`

### Важно: кнопка «Admin» в XAMPP Control Panel

Она **не открывает ваш сайт** — это служебная кнопка для настройки Apache (конфиг и т.п.).  
Сайт открывается **в браузере** по адресу:

- `http://localhost/Diplom_2026/server/public/app/`

Раздел «Админ» внутри магазина появляется в шапке только у пользователя с `is_admin = 1` в таблице `users`.

## API-эндпоинты

- `GET /server/public/index.php/api/health`
- `POST /server/public/index.php/api/auth/register`
- `POST /server/public/index.php/api/auth/login`
- `GET /server/public/index.php/api/auth/me`
- `POST /server/public/index.php/api/auth/logout`
- `GET /server/public/index.php/api/profile`
- `POST /server/public/index.php/api/profile`
- `GET /server/public/index.php/api/orders`
- `GET /server/public/index.php/api/orders?all=1` (только админ)
- `POST /server/public/index.php/api/orders`
- `POST /server/public/index.php/api/orders/status` (только админ)
- `GET /server/public/index.php/api/reviews?productId=p-001`
- `POST /server/public/index.php/api/reviews` (тело JSON: `productId`, `text`, `rating` — только для авторизованного пользователя)

## Конфигурация подключения

Параметры подключения к БД заданы в `server/public/index.php`:

- host: `127.0.0.1`
- port: `3306`
- db: `sshop_db`
- user: `root`
- password: `''` (пустой пароль по умолчанию для XAMPP)

