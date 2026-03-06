<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(['user' => null], JSON_UNESCAPED_UNICODE);
  exit;
}

echo json_encode([
  'user' => [
    'id' => (int)$_SESSION['user_id'],
    'username' => $_SESSION['username'] ?? '',
    'role' => $_SESSION['role'] ?? '',
    'class' => isset($_SESSION['class']) ? (int)$_SESSION['class'] : null
  ]
], JSON_UNESCAPED_UNICODE);
