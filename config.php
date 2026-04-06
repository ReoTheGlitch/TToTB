<?php
// ═══════════════════════════════════════════
//  إعدادات قاعدة البيانات — غيّر هذه القيم
// ═══════════════════════════════════════════

define('DB_HOST', 'localhost');
define('DB_NAME', 'library_db');
define('DB_USER', 'root');       // اسم مستخدم MySQL
define('DB_PASS', '');           // كلمة مرور MySQL
define('DB_CHARSET', 'utf8mb4');

// ── الاتصال بقاعدة البيانات ──
function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// ── CORS + JSON Headers ──
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── إرسال الرد JSON ──
function respond(mixed $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function respondError(string $msg, int $code = 400): never {
    respond(['error' => $msg], $code);
}

// ── قراءة body الطلب ──
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
