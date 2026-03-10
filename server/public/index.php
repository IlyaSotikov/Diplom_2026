<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
  'name' => 'SportShop API',
  'status' => 'ok',
  'message' => 'Stub endpoint for LR-3 (backend will be implemented later).',
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

