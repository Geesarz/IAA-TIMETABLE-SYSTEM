# MySQL Setup Guide for IAA-CLASS TIMETABLE-SYSTEM-WITH-IAA

This guide explains how to set up MySQL for the Class Harmony Timetable Management System.

## Prerequisites

- MySQL 8.0+ installed on your system
- MySQL CLI or MySQL Workbench (optional, for GUI management)
- Node.js 18+ and npm

## Step 1: Install MySQL

### Windows
1. Download MySQL installer from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Run the installer and follow the setup wizard
3. Choose "Developer Default" setup type
4. Install MySQL Server
5. Configure MySQL Server on port 3306
6. Set root password and remember it

### macOS
```bash
# Using Homebrew
brew install mysql

# Start MySQL
brew services start mysql

# Secure installation
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install mysql-server

# Secure installation
sudo mysql_secure_installation

# Start MySQL
sudo systemctl start mysql
```

## Step 2: Create Database and User

Open MySQL CLI:
```bash
mysql -u root -p
# Enter your root password
```

Create the database and user:
```sql
-- Create database
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user for the application
CREATE USER 'class_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON class_harmony.* TO 'class_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

## Step 3: Initialize Database Schema

```bash
# Login to the database
mysql -u class_user -p class_harmony

# Or use the root user
mysql -u root -p class_harmony
```

Run the database schema file:
```bash
# In MySQL CLI, run:
SOURCE DATABASE_SCHEMA.sql;

# Or from command line:
mysql -u class_user -p class_harmony < DATABASE_SCHEMA.sql
```

Verify tables were created:
```bash
mysql -u class_user -p class_harmony
SHOW TABLES;
DESCRIBE lecturers;
```

## Step 4: Configure Environment Variables

Update `.env.local`:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=class_user
DB_PASSWORD=your_strong_password
DB_NAME=class_harmony

# Application
NODE_ENV=development
API_BASE_URL=http://localhost:5173
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 7: Load Seed Data

In your browser, go to the dashboard and click **"Load Seed Data"** button.

This will populate the database with sample:
- 5 Lecturers
- 5 Classrooms
- 5 Student Groups
- 5 Courses

## Useful MySQL Commands

### Connect to Database
```bash
mysql -u class_user -p class_harmony
```

### View All Lecturers
```sql
SELECT * FROM lecturers;
```

### View All Courses
```sql
SELECT c.id, c.code, c.title, l.name as lecturer, sg.name as 'group' 
FROM courses c
JOIN lecturers l ON c.lecturer_id = l.id
JOIN student_groups sg ON c.group_id = sg.id;
```

### View All Assignments
```sql
SELECT a.id, c.code as course, cr.name as room, a.day, a.period
FROM assignments a
JOIN courses c ON a.course_id = c.id
JOIN classrooms cr ON a.classroom_id = cr.id
ORDER BY a.day, a.period;
```

### Backup Database
```bash
mysqldump -u class_user -p class_harmony > backup.sql
```

### Restore Database
```bash
mysql -u class_user -p class_harmony < backup.sql
```

### Delete All Data (Keep Structure)
```bash
mysql -u class_user -p class_harmony
TRUNCATE TABLE assignments;
TRUNCATE TABLE courses;
TRUNCATE TABLE student_groups;
TRUNCATE TABLE classrooms;
TRUNCATE TABLE lecturer_availability;
TRUNCATE TABLE lecturers;
```

## Troubleshooting

### "Access Denied" Error
```bash
# Make sure password is correct
mysql -u class_user -p

# If you forgot password, reset it:
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'class_user'@'localhost' IDENTIFIED BY 'new_password';
EXIT;
```

### "Database not found" Error
```sql
-- Create database again
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
```

### Port Already in Use
```bash
# Find MySQL process
lsof -i :3306

# Kill process
kill -9 <PID>

# Or change port in MySQL config
# Edit /etc/mysql/mysql.conf.d/mysqld.cnf
# Change: port = 3307
```

### Connection Timeout
- Make sure MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env.local`
- Verify firewall allows port 3306
- Check `DB_HOST` is correct (localhost vs 127.0.0.1)

## Verify Installation

Test the connection:
```bash
mysql -u class_user -p -e "use class_harmony; SHOW TABLES;"
```

Expected output should show:
```
Tables_in_class_harmony
assignments
classrooms
courses
lecturer_availability
lecturers
student_groups
conflicts
```

## Production Setup

For production environment:

1. **Use strong passwords** (20+ characters with special characters)
2. **Change default port** from 3306 to something else
3. **Restrict database user privileges** (don't use root)
4. **Enable SSL/TLS** for database connections
5. **Set up regular backups** with cron jobs
6. **Monitor database performance** and logs
7. **Keep MySQL updated** with latest security patches
8. **Use database firewall rules** to restrict access

Example production setup:
```sql
-- Create user with limited privileges
CREATE USER 'prod_user'@'10.0.0.5' IDENTIFIED BY 'strong_random_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP ON class_harmony.* TO 'prod_user'@'10.0.0.5' REQUIRE SSL;
FLUSH PRIVILEGES;
```

## Additional Resources

- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [MySQL Security Best Practices](https://dev.mysql.com/doc/refman/8.0/en/security.html)

---

For the full application setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).
