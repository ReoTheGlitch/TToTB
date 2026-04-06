-- ═══════════════════════════════════════════
--  كنز الكتب — قاعدة بيانات MySQL
-- ═══════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- ── جدول المستخدمين ──
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin','user') DEFAULT 'user',
    phone       VARCHAR(20),
    status      ENUM('active','banned') DEFAULT 'active',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── جدول التصنيفات ──
CREATE TABLE IF NOT EXISTS categories (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(80) NOT NULL,
    icon  VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── جدول الكتب ──
CREATE TABLE IF NOT EXISTS books (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    author           VARCHAR(150) NOT NULL,
    isbn             VARCHAR(30),
    category_id      INT,
    total_copies     INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    cover            TEXT,
    description      TEXT,
    publish_year     YEAR,
    added_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── جدول الاستعارات ──
CREATE TABLE IF NOT EXISTS borrows (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    book_id       INT NOT NULL,
    status        ENUM('pending','active','returned','rejected') DEFAULT 'pending',
    request_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    borrow_date   DATETIME,
    due_date      DATETIME,
    return_date   DATETIME,
    duration_days INT DEFAULT 14,
    note          TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── جدول قوائم الانتظار ──
CREATE TABLE IF NOT EXISTS waitlist (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id   INT NOT NULL,
    book_id   INT NOT NULL,
    status    ENUM('waiting','fulfilled','cancelled') DEFAULT 'waiting',
    position  INT DEFAULT 1,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── جدول الإشعارات ──
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    type       VARCHAR(50),
    message    TEXT NOT NULL,
    is_read    TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ═══════════════════════════════════════════
--  البيانات الأولية
-- ═══════════════════════════════════════════
-- Default admin account (Password: admin123)
-- ⚠️ IMPORTANT: Change the password immediately after installation!

INSERT INTO users (name, email, password, role, status) VALUES
('المدير', 'admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

INSERT INTO categories (name, icon) VALUES
('روايات',      '📖'),
('علوم وتقنية', '🔬'),
('تاريخ',       '🏛️'),
('فلسفة',       '🧠'),
('أطفال',       '🎈'),
('تطوير ذات',   '⭐');

INSERT INTO books (title, author, isbn, category_id, total_copies, available_copies, cover, description, publish_year) VALUES
('مئة عام من العزلة',    'غابرييل غارسيا ماركيز', '978-0-06-088328-7', 1, 3, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', 'رواية كلاسيكية تحكي قصة عائلة بوينديا.', 1967),
('موجز تاريخ الإنسانية', 'يوفال نوح هراري',        '978-0-06-231609-7', 3, 2, 2, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', 'رحلة عبر تاريخ الجنس البشري.', 2011),
('قوة العادة',            'تشارلز دوهيج',           '978-0-81-298160-5', 6, 3, 3, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop', 'كيف تعمل العادات وكيف نغيرها.', 2012),
('الأمير الصغير',         'أنطوان دو سانت إكزوبيري','978-0-15-601219-5', 5, 5, 5, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop', 'قصة خيالية تحمل رسائل فلسفية.', 1943),
('الخيميائي',             'باولو كويلو',             '978-0-06-231500-7', 1, 4, 4, 'https://images.unsplash.com/photo-1500099817043-86d46000d58f?w=300&h=400&fit=crop', 'قصة شاب يبحث عن كنزه.', 1988);

-- ── جدول إعارة/تبرع الكتب من المستخدمين ──
ALTER TABLE books
    ADD COLUMN IF NOT EXISTS donated_by  INT DEFAULT NULL COMMENT 'id المستخدم اللي تبرع بالكتاب',
    ADD COLUMN IF NOT EXISTS donate_type ENUM('permanent','temporary') DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS return_to_owner_date DATE DEFAULT NULL COMMENT 'تاريخ إرجاع الكتاب لصاحبه (مؤقت فقط)';

CREATE TABLE IF NOT EXISTS donations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL COMMENT 'المستخدم اللي عارض الكتاب',
    -- بيانات الكتاب
    title           VARCHAR(200) NOT NULL,
    author          VARCHAR(150) NOT NULL,
    isbn            VARCHAR(30),
    category_id     INT,
    description     TEXT,
    publish_year    YEAR,
    cover           TEXT,
    -- نوع الإعارة
    donate_type     ENUM('permanent','temporary') NOT NULL COMMENT 'دائمة أو مؤقتة',
    return_date     DATE DEFAULT NULL COMMENT 'تاريخ إرجاع الكتاب لصاحبه (مؤقت فقط)',
    -- حالة الطلب
    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
    admin_note      TEXT COMMENT 'ملاحظة الأدمن عند الرفض',
    book_id         INT DEFAULT NULL COMMENT 'id الكتاب بعد الموافقة',
    submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at     DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (book_id)     REFERENCES books(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
