# 📚 Library Management System

A simple PHP-based library management system with user authentication, book borrowing, and admin panel.

## Features

- 📖 Book catalog with categories
- 👤 User registration and authentication
- 📋 Borrow request system
- ⏳ Waitlist for unavailable books
- 🔔 Notification system
- 📤 Book donation system
- 👨‍💼 Admin panel for managing books, users, and requests

## Requirements

- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+
- Apache with mod_rewrite (or XAMPP / WAMP)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/library_php.git
cd library_php
```

### 2. Configure the database

Copy the example config file:
```bash
cp config.example.php config.php
```

Edit `config.php` and update your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'library_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Create the database

Open phpMyAdmin or MySQL CLI and run:
```sql
SOURCE library.sql;
```

### 4. Setup for local development (XAMPP)

1. Copy the project folder to `C:\xampp\htdocs\library_php`
2. Open `http://localhost/library_php`

### 5. Setup for production

1. Upload all files to your hosting
2. Make sure `mod_rewrite` is enabled
3. Update `.htaccess` if needed for your directory structure

## Default Login Credentials

| Field | Value |
|---|---|
| **Email** | admin@admin.com |
| **Password** | admin123 |

> ⚠️ **IMPORTANT:** Change the admin password immediately after installation!

## Project Structure

All files are in the root directory for simplicity:

```
library_php/
├── api_index.php           ← Main CRUD API
├── login_api.php           ← Authentication endpoint
├── config.example.php      ← Template configuration file
├── config.php              ← Your config (not in git)
├── core.js                 ← API communication
├── style.css               ← Styles
├── library.sql             ← Database schema
├── .htaccess               ← Apache rewrite rules
├── .gitignore
├── index.html
├── books.html
├── book.html
├── borrow.html
├── dashboard.html
├── admin.html
├── login.html
├── register.html
├── profile.html
├── donate.html
└── rules.html
```

## Database Tables

| Table | Description |
|---|---|
| `users` | Users and admins |
| `categories` | Book categories |
| `books` | Books and available copies |
| `borrows` | Borrow requests |
| `waitlist` | Waiting lists |
| `notifications` | User notifications |
| `donations` | Book donation requests |

## Security Notes

- Passwords are hashed using PHP's `password_hash()`
- SQL injection protection via prepared statements
- CORS headers configured for API access
- Direct access to `config.php` blocked via `.htaccess`

## API Endpoints

### Authentication
- `POST /api/login.php` - User login

### CRUD Operations
- `GET /api/{table}` - Get all records
- `GET /api/{table}/{id}` - Get specific record
- `POST /api/{table}` - Create new record
- `PATCH /api/{table}/{id}` - Update record
- `DELETE /api/{table}/{id}` - Delete record

Available tables: `users`, `categories`, `books`, `borrows`, `waitlist`, `notifications`, `donations`

## License

Free to use for educational purposes.

