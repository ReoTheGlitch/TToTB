<?php
// ═══════════════════════════════════════════
//  api_index.php — يشتغل على XAMPP بدون مشاكل
// ═══════════════════════════════════════════
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// جلب الـ table والـ id من PATH_INFO أو query params
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$segments = array_values(array_filter(explode('/', trim($pathInfo, '/'))));

if (count($segments) >= 1) {
    $table = $segments[0];
    $id    = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;
} else {
    $table = $_GET['_table'] ?? '';
    $id    = isset($_GET['_id']) && $_GET['_id'] !== '' ? (int)$_GET['_id'] : null;
}

$allowed = ['users','categories','books','borrows','waitlist','notifications','donations'];
if (!in_array($table, $allowed)) {
    respondError('جدول غير موجود: ' . $table, 404);
}

$db = getDB();

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) respondError('not found', 404);
        respond($row);
    }

    $where = []; $params = []; $sort = null; $order = 'DESC'; $limit = null;

    foreach ($_GET as $key => $val) {
        if (in_array($key, ['_table','_id'])) continue;
        if ($key === '_sort')  { $sort  = preg_replace('/\W/', '', $val); continue; }
        if ($key === '_order') { $order = strtoupper($val) === 'ASC' ? 'ASC' : 'DESC'; continue; }
        if ($key === '_limit') { $limit = (int)$val; continue; }
        $col = preg_replace('/\W/', '', $key);
        if ($val === 'true'  || $val === '1') { $where[] = "`$col` = 1"; continue; }
        if ($val === 'false' || $val === '0') { $where[] = "`$col` = 0"; continue; }
        $where[] = "`$col` = ?"; $params[] = $val;
    }

    $sql = "SELECT * FROM `$table`";
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    if ($sort)  $sql .= " ORDER BY `$sort` $order";
    if ($limit) $sql .= " LIMIT $limit";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respond($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = getBody();
    if (!$body) respondError('البيانات فارغة');

    if ($table === 'users' && isset($body['password'])) {
        $body['password'] = password_hash($body['password'], PASSWORD_DEFAULT);
    }

    $cols   = array_keys($body);
    $colStr = implode(', ', array_map(fn($c) => "`" . preg_replace('/\W/','',$c) . "`", $cols));
    $phStr  = implode(', ', array_fill(0, count($cols), '?'));

    $stmt = $db->prepare("INSERT INTO `$table` ($colStr) VALUES ($phStr)");
    $stmt->execute(array_values($body));
    $newId = (int)$db->lastInsertId();

    $stmt2 = $db->prepare("SELECT * FROM `$table` WHERE id = ?");
    $stmt2->execute([$newId]);
    respond($stmt2->fetch(), 201);
}

if ($method === 'PATCH') {
    if (!$id) respondError('id مطلوب');
    $body = getBody();
    if (!$body) respondError('البيانات فارغة');

    $sets = []; $params = [];
    foreach ($body as $col => $val) {
        $col = preg_replace('/\W/', '', $col);
        $sets[] = "`$col` = ?"; $params[] = $val;
    }
    $params[] = $id;

    $db->prepare("UPDATE `$table` SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);

    $stmt2 = $db->prepare("SELECT * FROM `$table` WHERE id = ?");
    $stmt2->execute([$id]);
    respond($stmt2->fetch());
}

if ($method === 'DELETE') {
    if (!$id) respondError('id مطلوب');
    if ($table === 'books') {
        $db->prepare("DELETE FROM borrows  WHERE book_id = ?")->execute([$id]);
        $db->prepare("DELETE FROM waitlist WHERE book_id = ?")->execute([$id]);
    }
    $db->prepare("DELETE FROM `$table` WHERE id = ?")->execute([$id]);
    respond(['deleted' => true]);
}

respondError('Method غير مدعوم', 405);
