<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost',
  'http://127.0.0.1',
];
if (in_array($origin, $allowedOrigins, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
} else {
  header('Access-Control-Allow-Origin: *');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  http_response_code(204);
  exit;
}

const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NAME = 'sshop_db';
const DB_USER = 'root';
const DB_PASSWORD = '';

function jsonResponse(int $statusCode, array $payload): void
{
  http_response_code($statusCode);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function readJsonBody(): array
{
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') {
    return [];
  }

  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) {
    jsonResponse(400, ['ok' => false, 'message' => 'Невалидный JSON.']);
  }
  return $decoded;
}

function db(): PDO
{
  static $pdo = null;
  if ($pdo instanceof PDO) {
    return $pdo;
  }

  $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
  try {
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
  } catch (Throwable $e) {
    jsonResponse(500, [
      'ok' => false,
      'message' => 'Не удалось подключиться к базе данных. Создайте БД и импортируйте schema.sql.',
      'error' => $e->getMessage(),
    ]);
  }
}

function normalizeUserRow(array $user): array
{
  $user['id'] = (int)($user['id'] ?? 0);
  $user['is_admin'] = ((int)($user['is_admin'] ?? 0)) === 1;
  return $user;
}

function currentUser(): ?array
{
  $userId = $_SESSION['user_id'] ?? null;
  if (!is_int($userId) && !is_string($userId)) {
    return null;
  }

  $stmt = db()->prepare(
    'SELECT id, full_name, email, phone, default_address, is_admin, created_at FROM users WHERE id = :id LIMIT 1'
  );
  $stmt->execute(['id' => $userId]);
  $user = $stmt->fetch();
  return is_array($user) ? normalizeUserRow($user) : null;
}

function ensureAuth(): array
{
  $user = currentUser();
  if ($user === null) {
    jsonResponse(401, ['ok' => false, 'message' => 'Требуется авторизация.']);
  }
  return $user;
}

function ensureAdmin(): array
{
  $user = ensureAuth();
  if (($user['is_admin'] ?? false) !== true) {
    jsonResponse(403, ['ok' => false, 'message' => 'Недостаточно прав доступа.']);
  }
  return $user;
}

function orderFromRow(array $row): array
{
  $items = json_decode((string)($row['items_json'] ?? '[]'), true);
  if (!is_array($items)) {
    $items = [];
  }

  return [
    'id' => 'ORD-' . str_pad((string)$row['id'], 6, '0', STR_PAD_LEFT),
    'createdAtIso' => date(DATE_ATOM, strtotime((string)$row['created_at'])),
    'status' => (string)$row['status'],
    'items' => $items,
    'totalRub' => (int)$row['total_rub'],
    'contact' => [
      'fullName' => (string)$row['contact_full_name'],
      'phone' => (string)$row['contact_phone'],
      'address' => (string)$row['contact_address'],
    ],
  ];
}

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

if (str_ends_with($requestPath, '/')) {
  $requestPath = rtrim($requestPath, '/');
}

if ($requestPath === '' || str_ends_with($requestPath, '/index.php')) {
  jsonResponse(200, [
    'ok' => true,
    'name' => 'SShop API',
    'version' => '1.0.0',
  ]);
}

if (str_ends_with($requestPath, '/api/health') && $method === 'GET') {
  jsonResponse(200, ['ok' => true, 'status' => 'healthy']);
}

if (str_ends_with($requestPath, '/api/auth/register') && $method === 'POST') {
  $body = readJsonBody();
  $fullName = trim((string)($body['fullName'] ?? ''));
  $email = mb_strtolower(trim((string)($body['email'] ?? '')));
  $password = (string)($body['password'] ?? '');

  if ($fullName === '' || strlen($fullName) < 2) {
    jsonResponse(422, ['ok' => false, 'message' => 'Имя должно содержать минимум 2 символа.']);
  }
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(422, ['ok' => false, 'message' => 'Введите корректный email.']);
  }
  if (strlen($password) < 6) {
    jsonResponse(422, ['ok' => false, 'message' => 'Пароль должен содержать минимум 6 символов.']);
  }

  $pdo = db();
  $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
  $check->execute(['email' => $email]);
  if ($check->fetch()) {
    jsonResponse(409, ['ok' => false, 'message' => 'Пользователь с таким email уже существует.']);
  }

  $insert = $pdo->prepare(
    'INSERT INTO users (full_name, email, password_hash, phone, default_address, is_admin, created_at)
     VALUES (:full_name, :email, :password_hash, :phone, :default_address, 0, NOW())'
  );
  $insert->execute([
    'full_name' => $fullName,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'phone' => '',
    'default_address' => '',
  ]);

  $_SESSION['user_id'] = (int)$pdo->lastInsertId();
  jsonResponse(201, ['ok' => true, 'user' => currentUser()]);
}

if (str_ends_with($requestPath, '/api/auth/login') && $method === 'POST') {
  $body = readJsonBody();
  $email = mb_strtolower(trim((string)($body['email'] ?? '')));
  $password = (string)($body['password'] ?? '');

  if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    jsonResponse(422, ['ok' => false, 'message' => 'Проверьте email и пароль.']);
  }

  $stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = :email LIMIT 1');
  $stmt->execute(['email' => $email]);
  $row = $stmt->fetch();
  if (!$row || !password_verify($password, (string)$row['password_hash'])) {
    jsonResponse(401, ['ok' => false, 'message' => 'Неверный email или пароль.']);
  }

  $_SESSION['user_id'] = (int)$row['id'];
  jsonResponse(200, ['ok' => true, 'user' => currentUser()]);
}

if (str_ends_with($requestPath, '/api/auth/me') && $method === 'GET') {
  $user = currentUser();
  if ($user === null) {
    jsonResponse(200, ['ok' => true, 'user' => null]);
  }
  jsonResponse(200, ['ok' => true, 'user' => $user]);
}

if (str_ends_with($requestPath, '/api/auth/logout') && $method === 'POST') {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
  }
  session_destroy();
  jsonResponse(200, ['ok' => true]);
}

if (str_ends_with($requestPath, '/api/profile') && $method === 'GET') {
  $user = ensureAuth();
  jsonResponse(200, [
    'ok' => true,
    'profile' => [
      'fullName' => (string)$user['full_name'],
      'email' => (string)$user['email'],
      'phone' => (string)($user['phone'] ?? ''),
      'defaultAddress' => (string)($user['default_address'] ?? ''),
    ],
  ]);
}

if (str_ends_with($requestPath, '/api/profile') && $method === 'POST') {
  $user = ensureAuth();
  $body = readJsonBody();
  $fullName = trim((string)($body['fullName'] ?? ''));
  $phone = trim((string)($body['phone'] ?? ''));
  $defaultAddress = trim((string)($body['defaultAddress'] ?? ''));

  $fullNameLen = function_exists('mb_strlen') ? mb_strlen($fullName) : strlen($fullName);
  $addressLen = function_exists('mb_strlen') ? mb_strlen($defaultAddress) : strlen($defaultAddress);

  if ($fullNameLen < 2) {
    jsonResponse(422, ['ok' => false, 'message' => 'Имя должно содержать минимум 2 символа.']);
  }
  if (!preg_match('/^[0-9+()\\-\\s]{6,40}$/', $phone)) {
    jsonResponse(422, ['ok' => false, 'message' => 'Введите корректный номер телефона.']);
  }
  if ($addressLen < 6) {
    jsonResponse(422, ['ok' => false, 'message' => 'Адрес должен содержать минимум 6 символов.']);
  }

  $update = db()->prepare(
    'UPDATE users SET full_name = :full_name, phone = :phone, default_address = :default_address WHERE id = :id'
  );
  $update->execute([
    'full_name' => $fullName,
    'phone' => $phone,
    'default_address' => $defaultAddress,
    'id' => $user['id'],
  ]);

  $refresh = currentUser();
  if (!is_array($refresh)) {
    jsonResponse(500, ['ok' => false, 'message' => 'Не удалось получить обновлённый профиль.']);
  }

  jsonResponse(200, [
    'ok' => true,
    'profile' => [
      'fullName' => (string)$refresh['full_name'],
      'email' => (string)$refresh['email'],
      'phone' => (string)($refresh['phone'] ?? ''),
      'defaultAddress' => (string)($refresh['default_address'] ?? ''),
    ],
  ]);
}

if (str_ends_with($requestPath, '/api/orders') && $method === 'GET') {
  $user = ensureAuth();
  $all = isset($_GET['all']) && $_GET['all'] === '1';

  if ($all) {
    if (($user['is_admin'] ?? false) !== true) {
      jsonResponse(403, ['ok' => false, 'message' => 'Только администратор может просматривать все заказы.']);
    }
    $stmt = db()->query('SELECT * FROM orders ORDER BY created_at DESC');
  } else {
    $stmt = db()->prepare('SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC');
    $stmt->execute(['user_id' => $user['id']]);
  }

  $rows = $all ? $stmt->fetchAll() : $stmt->fetchAll();
  $orders = array_map('orderFromRow', $rows);
  jsonResponse(200, ['ok' => true, 'orders' => $orders]);
}

if (str_ends_with($requestPath, '/api/orders') && $method === 'POST') {
  $user = ensureAuth();
  $body = readJsonBody();
  $items = $body['items'] ?? [];
  $contact = $body['contact'] ?? [];

  if (!is_array($items) || count($items) === 0) {
    jsonResponse(422, ['ok' => false, 'message' => 'Корзина пуста. Добавьте товары перед оформлением.']);
  }

  $fullName = trim((string)($contact['fullName'] ?? ''));
  $phone = trim((string)($contact['phone'] ?? ''));
  $address = trim((string)($contact['address'] ?? ''));
  $fullNameLen = function_exists('mb_strlen') ? mb_strlen($fullName) : strlen($fullName);
  $addressLen = function_exists('mb_strlen') ? mb_strlen($address) : strlen($address);

  if ($fullNameLen < 2) {
    jsonResponse(422, ['ok' => false, 'message' => 'ФИО должно содержать минимум 2 символа.']);
  }
  if (!preg_match('/^[0-9+()\\-\\s]{6,40}$/', $phone)) {
    jsonResponse(422, ['ok' => false, 'message' => 'Введите корректный номер телефона.']);
  }
  if ($addressLen < 6) {
    jsonResponse(422, ['ok' => false, 'message' => 'Адрес должен содержать минимум 6 символов.']);
  }

  $normalizedItems = [];
  $totalRub = 0;
  foreach ($items as $item) {
    if (!is_array($item)) {
      continue;
    }
    $productId = trim((string)($item['productId'] ?? ''));
    $title = trim((string)($item['title'] ?? ''));
    $priceRub = (int)($item['priceRub'] ?? 0);
    $quantity = (int)($item['quantity'] ?? 0);
    if ($productId === '' || $title === '' || $priceRub <= 0 || $quantity <= 0) {
      continue;
    }
    $line = [
      'productId' => $productId,
      'title' => $title,
      'priceRub' => $priceRub,
      'quantity' => $quantity,
    ];
    $normalizedItems[] = $line;
    $totalRub += $priceRub * $quantity;
  }

  if (count($normalizedItems) === 0 || $totalRub <= 0) {
    jsonResponse(422, ['ok' => false, 'message' => 'Некорректный состав заказа.']);
  }

  // Базовая защита от дублей: одинаковый заказ в пределах 30 секунд.
  $fingerprintPayload = [
    'user_id' => $user['id'],
    'items' => $normalizedItems,
    'contact' => [
      'fullName' => $fullName,
      'phone' => $phone,
      'address' => $address,
    ],
  ];
  $fingerprint = hash('sha256', json_encode($fingerprintPayload, JSON_UNESCAPED_UNICODE));
  $lastFingerprint = (string)($_SESSION['last_order_fingerprint'] ?? '');
  $lastAt = (int)($_SESSION['last_order_at'] ?? 0);
  $now = time();
  if ($lastFingerprint !== '' && $lastFingerprint === $fingerprint && ($now - $lastAt) <= 30) {
    jsonResponse(409, ['ok' => false, 'message' => 'Похожий заказ уже оформлен. Подождите немного перед повторной отправкой.']);
  }

  $insert = db()->prepare(
    'INSERT INTO orders (user_id, status, total_rub, contact_full_name, contact_phone, contact_address, items_json, created_at)
     VALUES (:user_id, :status, :total_rub, :contact_full_name, :contact_phone, :contact_address, :items_json, NOW())'
  );
  $insert->execute([
    'user_id' => $user['id'],
    'status' => 'new',
    'total_rub' => $totalRub,
    'contact_full_name' => $fullName,
    'contact_phone' => $phone,
    'contact_address' => $address,
    'items_json' => json_encode($normalizedItems, JSON_UNESCAPED_UNICODE),
  ]);

  $id = (int)db()->lastInsertId();
  $select = db()->prepare('SELECT * FROM orders WHERE id = :id LIMIT 1');
  $select->execute(['id' => $id]);
  $row = $select->fetch();
  if (!is_array($row)) {
    jsonResponse(500, ['ok' => false, 'message' => 'Не удалось получить созданный заказ.']);
  }
  $_SESSION['last_order_fingerprint'] = $fingerprint;
  $_SESSION['last_order_at'] = $now;
  jsonResponse(201, ['ok' => true, 'order' => orderFromRow($row)]);
}

if (str_ends_with($requestPath, '/api/orders/status') && $method === 'POST') {
  ensureAdmin();
  $body = readJsonBody();
  $orderId = trim((string)($body['orderId'] ?? ''));
  $status = trim((string)($body['status'] ?? ''));

  if (!preg_match('/^ORD-\\d{6}$/', $orderId)) {
    jsonResponse(422, ['ok' => false, 'message' => 'Некорректный идентификатор заказа.']);
  }
  if (!in_array($status, ['new', 'processing', 'shipped', 'cancelled'], true)) {
    jsonResponse(422, ['ok' => false, 'message' => 'Некорректный статус заказа.']);
  }

  $dbId = (int)ltrim(substr($orderId, 4), '0');
  if ($dbId <= 0) {
    jsonResponse(422, ['ok' => false, 'message' => 'Некорректный идентификатор заказа.']);
  }

  $update = db()->prepare('UPDATE orders SET status = :status WHERE id = :id');
  $update->execute(['status' => $status, 'id' => $dbId]);
  if ($update->rowCount() === 0) {
    jsonResponse(404, ['ok' => false, 'message' => 'Заказ не найден.']);
  }

  $select = db()->prepare('SELECT * FROM orders WHERE id = :id LIMIT 1');
  $select->execute(['id' => $dbId]);
  $row = $select->fetch();
  if (!is_array($row)) {
    jsonResponse(404, ['ok' => false, 'message' => 'Заказ не найден.']);
  }
  jsonResponse(200, ['ok' => true, 'order' => orderFromRow($row)]);
}

if (str_ends_with($requestPath, '/api/reviews') && $method === 'GET') {
  $productId = isset($_GET['productId']) ? trim((string)$_GET['productId']) : '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $pageSize = max(1, min(20, (int)($_GET['pageSize'] ?? 5)));
  $offset = ($page - 1) * $pageSize;
  if ($productId === '' || strlen($productId) > 32) {
    jsonResponse(422, ['ok' => false, 'message' => 'Укажите корректный productId.']);
  }

  $countStmt = db()->prepare('SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = :pid');
  $countStmt->execute(['pid' => $productId]);
  $total = (int)($countStmt->fetch()['total'] ?? 0);

  $stmt = db()->prepare(
    'SELECT r.id, r.product_id, r.rating, r.review_text AS text, r.created_at, u.full_name AS author_name
     FROM product_reviews r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.product_id = :pid
     ORDER BY r.created_at DESC
     LIMIT :limit OFFSET :offset'
  );
  $stmt->bindValue(':pid', $productId, PDO::PARAM_STR);
  $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  jsonResponse(200, ['ok' => true, 'reviews' => $rows, 'total' => $total, 'page' => $page, 'pageSize' => $pageSize]);
}

if (str_ends_with($requestPath, '/api/reviews') && $method === 'POST') {
  $user = ensureAuth();
  $body = readJsonBody();
  $productId = trim((string)($body['productId'] ?? ''));
  $text = trim((string)($body['text'] ?? ''));
  $rating = (int)($body['rating'] ?? 5);

  if ($productId === '' || strlen($productId) > 32) {
    jsonResponse(422, ['ok' => false, 'message' => 'Укажите товар.']);
  }
  $textLen = function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
  if ($textLen < 3) {
    jsonResponse(422, ['ok' => false, 'message' => 'Отзыв должен содержать минимум 3 символа.']);
  }
  if ($textLen > 2000) {
    jsonResponse(422, ['ok' => false, 'message' => 'Отзыв слишком длинный (макс. 2000 символов).']);
  }
  if ($rating < 1 || $rating > 5) {
    jsonResponse(422, ['ok' => false, 'message' => 'Оценка от 1 до 5.']);
  }

  $insert = db()->prepare(
    'INSERT INTO product_reviews (product_id, user_id, rating, review_text, created_at)
     VALUES (:product_id, :user_id, :rating, :review_text, NOW())'
  );
  $insert->execute([
    'product_id' => $productId,
    'user_id' => $user['id'],
    'rating' => $rating,
    'review_text' => $text,
  ]);

  $id = (int)db()->lastInsertId();
  jsonResponse(201, [
    'ok' => true,
    'review' => [
      'id' => $id,
      'product_id' => $productId,
      'rating' => $rating,
      'text' => $text,
      'created_at' => date('Y-m-d H:i:s'),
      'author_name' => $user['full_name'],
    ],
  ]);
}

jsonResponse(404, ['ok' => false, 'message' => 'Endpoint not found']);

