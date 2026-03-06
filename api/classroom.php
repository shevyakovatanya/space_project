<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
  exit;
}

$class = isset($_SESSION['class']) ? (int)$_SESSION['class'] : null;

if ($class === null) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'No class in session'], JSON_UNESCAPED_UNICODE);
  exit;
}

$stmt = $pdo->prepare('SELECT username, role, results FROM users WHERE class = ? ORDER BY role DESC, username ASC');
$stmt->execute([$class]);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

$teachers = [];
$students = [];

foreach ($users as $u) {
  if ($u['role'] === 'teacher') {
    $teachers[] = $u['username'];
  } elseif ($u['role'] === 'student') {
    $students[] = [
      'username' => $u['username'],
      'results' => $u['results']
    ];
  }
}

echo json_encode([
  'success' => true,
  'class' => $class,
  'teachers' => $teachers,
  'students' => $students
], JSON_UNESCAPED_UNICODE);
