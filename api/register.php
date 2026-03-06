<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => 'Invalid JSON'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

$username = trim($data['username'] ?? '');
$password = (string)($data['password'] ?? '');
$role     = (string)($data['role'] ?? '');
$class    = intval($data['class'] ?? 0);

$allowedRoles = ['student', 'teacher'];

if ($username === '' || $password === '' || $role === '' || $class <= 0) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => 'All fields are required'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!in_array($role, $allowedRoles, true)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid role'], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($class < 1 || $class > 11) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Class must be between 1 and 11'], JSON_UNESCAPED_UNICODE);
  exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
  "INSERT INTO users (username, password, role, class)
   VALUES (?, ?, ?, ?)"
);

try {
  $stmt->execute([$username, $hash, $role, $class]);
  $newId = (int)$pdo->lastInsertId();

  $_SESSION['user_id'] = $newId;
  $_SESSION['username'] = $username;
  $_SESSION['role'] = $role;
  $_SESSION['class'] = $class;

  echo json_encode([
    'success' => true,
    'user' => [
      'id' => $newId,
      'username' => $username,
      'role' => $role,
      'class' => $class
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
  http_response_code(409);
  echo json_encode([
    'success' => false,
    'error' => 'Username already exists'
  ], JSON_UNESCAPED_UNICODE);
}
