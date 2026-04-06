<?php
// ═══════════════════════════════════════════
//  login_api.php — تسجيل الدخول
// ═══════════════════════════════════════════
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('POST فقط', 405);
}

$body  = getBody();
$email = trim($body['email'] ?? '');
$pass  = trim($body['password'] ?? '');

if (!$email || !$pass) {
    respondError('البريد وكلمة المرور مطلوبان');
}

$db   = getDB();
$stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    respondError('البريد الإلكتروني غير موجود', 401);
}

if (!password_verify($pass, $user['password'])) {
    respondError('كلمة المرور غير صحيحة', 401);
}

if ($user['status'] === 'banned') {
    respondError('تم حظر هذا الحساب، تواصل مع الإدارة', 403);
}

// إرجاع بيانات المستخدم بدون كلمة المرور
unset($user['password']);
respond($user);
