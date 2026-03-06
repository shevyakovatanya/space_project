<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require 'db.php';

$payload = json_decode(file_get_contents('php://input'), true);
$username = trim($payload['username'] ?? '');
$password = (string)($payload['password'] ?? '');
$role = (string)($payload['role'] ?? '');

$allowedRoles = ['student', 'teacher'];

if ($username === '' || $password === '' || $role === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing username, password or role'], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!in_array($role, $allowedRoles, true)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid role'], JSON_UNESCAPED_UNICODE);
  exit;
}

$stmt = $pdo->prepare('SELECT id, username, password, role, class FROM users WHERE username = ? AND role = ? LIMIT 1');
$stmt->execute([$username, $role]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Invalid credentials or role'], JSON_UNESCAPED_UNICODE);
  exit;
}

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];
$_SESSION['class'] = (int)$user['class'];

echo json_encode([
  'success' => true,
  'user' => [
    'id' => (int)$user['id'],
    'username' => $user['username'],
    'role' => $user['role'],
    'class' => (int)$user['class']
  ]
], JSON_UNESCAPED_UNICODE);
