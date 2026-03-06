<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id']) && isset($_SESSION['user']['id'])) {
  $_SESSION['user_id'] = (int)$_SESSION['user']['id'];
}

if (!isset($_SESSION['user_id'])) {
  echo json_encode(['score' => null]);
  exit;
}

$userId = (int)$_SESSION['user_id'];

$planet = isset($_GET['planet'])
  ? strtolower(trim($_GET['planet']))
  : '';

$allowed = ['sun','mars','earth','venus','saturn','uranus','jupiter','mercury','neptune'];
if (!in_array($planet, $allowed, true)) {
  echo json_encode(['score' => null]);
  exit;
}

$stmt = $pdo->prepare("SELECT results FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || empty($row['results'])) {
  echo json_encode(['score' => null]);
  exit;
}

$results = json_decode($row['results'], true);
$score = $results[$planet] ?? null;

echo json_encode(['score' => $score]);
