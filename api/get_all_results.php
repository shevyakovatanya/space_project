<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id']) && isset($_SESSION['user']['id'])) {
  $_SESSION['user_id'] = (int)$_SESSION['user']['id'];
}

if (!isset($_SESSION['user_id'])) {
  echo json_encode([]);
  exit;
}

$userId = (int)$_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT results FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || empty($row['results'])) {
  echo json_encode([]);
  exit;
}

$results = json_decode($row['results'], true);
if (!is_array($results)) {
  echo json_encode([]);
  exit;
}

echo json_encode($results);
