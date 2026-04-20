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
    'SELECT id, full_name, email, is_admin, created_at FROM users WHERE id = :id LIMIT 1'
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
    'INSERT INTO users (full_name, email, password_hash, is_admin, created_at)
     VALUES (:full_name, :email, :password_hash, 0, NOW())'
  );
  $insert->execute([
    'full_name' => $fullName,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
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
  jsonResponse(200, ['ok' => true, 'profile' => $user]);
}

if (str_ends_with($requestPath, '/api/reviews') && $method === 'GET') {
  $productId = isset($_GET['productId']) ? trim((string)$_GET['productId']) : '';
  if ($productId === '' || strlen($productId) > 32) {
    jsonResponse(422, ['ok' => false, 'message' => 'Укажите корректный productId.']);
  }

  $stmt = db()->prepare(
    'SELECT r.id, r.product_id, r.rating, r.review_text AS text, r.created_at, u.full_name AS author_name
     FROM product_reviews r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.product_id = :pid
     ORDER BY r.created_at DESC'
  );
  $stmt->execute(['pid' => $productId]);
  $rows = $stmt->fetchAll();
  jsonResponse(200, ['ok' => true, 'reviews' => $rows]);
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

