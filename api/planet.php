<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(0);

try {
    require 'db.php';

    $planet_param = $_GET['name'] ?? null;
    $id_param = $_GET['id'] ?? null;

    if (!$planet_param && !$id_param) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing planet parameter (name or id)'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($id_param) {
        $stmt = $pdo->prepare('SELECT id, name, description, image, background, questions FROM planets WHERE id = ? LIMIT 1');
        $stmt->execute([$id_param]);
    } else {
        $stmt = $pdo->prepare('SELECT id, name, description, image, background, questions FROM planets WHERE name = ? COLLATE utf8_general_ci LIMIT 1');
        $stmt->execute([$planet_param]);
    }

    $planet = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$planet) {
        http_response_code(404);
        echo json_encode(['error' => 'Planet not found'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $planet = array_map(function($v) {
        return is_string($v) ? mb_convert_encoding($v, 'UTF-8', 'auto') : $v;
    }, $planet);

    echo json_encode($planet, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
