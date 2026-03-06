<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id']) && isset($_SESSION['user']['id'])) {
  $_SESSION['user_id'] = (int)$_SESSION['user']['id'];
}

if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Not authorized']);
  exit;
}
$userId = (int)$_SESSION['user_id'];

$input = json_decode(file_get_contents('php://input'), true);
$planet = isset($input['planet']) ? strtolower(trim($input['planet'])) : '';
$score  = isset($input['score']) ? (int)$input['score'] : 0;

$allowed = ['sun','mars','earth','venus','saturn','uranus','jupiter','mercury','neptune'];
if (!in_array($planet, $allowed, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid planet']);
  exit;
}
if ($score < 0) $score = 0;
if ($score > 5) $score = 5;

$stmt = $pdo->prepare("SELECT results FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$userId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
  http_response_code(404);
  echo json_encode(['error' => 'User not found']);
  exit;
}

$results = [];
if (!empty($row['results'])) {
  $results = json_decode($row['results'], true);
  if (!is_array($results)) $results = [];
}

$defaults = ["sun"=>0,"mars"=>0,"earth"=>0,"venus"=>0,"saturn"=>0,"uranus"=>0,"jupiter"=>0,"mercury"=>0,"neptune"=>0];
$results = array_merge($defaults, $results);

$results[$planet] = $score;

$upd = $pdo->prepare("UPDATE users SET results = ? WHERE id = ?");
$upd->execute([json_encode($results, JSON_UNESCAPED_UNICODE), $userId]);

echo json_encode(['status' => 'ok', 'planet' => $planet, 'score' => $score]);
