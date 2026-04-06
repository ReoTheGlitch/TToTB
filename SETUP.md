# Quick Setup Guide

## Step 1: Configure Database

```bash
cp config.example.php config.php
```

Edit `config.php` with your database credentials.

## Step 2: Import Database

```sql
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SOURCE library.sql;
```

Or via phpMyAdmin:
1. Create database `library_db`
2. Import `library.sql`

## Step 3: Run the Project

### Local (XAMPP/WAMP)
- Place in `htdocs/library_php`
- Access: `http://localhost/library_php`

### Production
- Upload all files
- Ensure `mod_rewrite` is enabled
- Access via your domain

## Default Login

- Email: `admin@admin.com`
- Password: `admin123`

**Change this immediately!**

## Troubleshooting

### Can't connect to database
- Check `config.php` credentials
- Ensure MySQL is running
- Verify database exists

### API not working
- Enable `mod_rewrite` in Apache
- Check `.htaccess` permissions
- Verify PHP version is 8.0+

### CORS errors
- Check `config.php` CORS headers
- May need to adjust for production domain
