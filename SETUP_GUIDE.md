# IAA-CLASS TIMETABLE-SYSTEM-WITH-IAA - Complete Setup Guide

This guide provides step-by-step instructions to get the Class Harmony application running from scratch with MySQL database.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- MySQL 8.0+ (local or remote)
- Git

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19 and React DOM
- TanStack Router and React Query
- Tailwind CSS and Radix UI
- Hono (for API routes)
- Zustand (for state management)
- mysql2 (for database connectivity)
- TypeScript and build tools

## Step 2: Install and Configure MySQL

**For detailed MySQL installation instructions, see [MYSQL_SETUP.md](./MYSQL_SETUP.md)**

Quick setup:
```bash
# Windows (with Chocolatey)
choco install mysql

# macOS (with Homebrew)
brew install mysql
brew services start mysql

# Linux (Ubuntu/Debian)
sudo apt-get install mysql-server
sudo systemctl start mysql
```

## Step 3: Create Database and User

Open MySQL CLI:
```bash
mysql -u root -p
```

Run these SQL commands:
```sql
-- Create database
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'class_user'@'localhost' IDENTIFIED BY 'your_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON class_harmony.* TO 'class_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

## Step 4: Initialize Database Schema

Import the database schema:
```bash
mysql -u class_user -p class_harmony < DATABASE_SCHEMA.sql
```

Or manually:
```bash
mysql -u root -p class_harmony

# In MySQL CLI:
SOURCE DATABASE_SCHEMA.sql;
```

Verify tables were created:
```bash
mysql -u class_user -p class_harmony -e "SHOW TABLES;"
```

Expected output:
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
  - classrooms
  - student_groups
  - courses
  - assignments
  - lecturer_availability
  - conflicts (view)

## Step 5: Configure Environment

1. Create a `.env.local` file in project root:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your MySQL credentials:

```
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=class_user
DB_PASSWORD=your_password_here
DB_NAME=class_harmony

# Application Configuration
NODE_ENV=development
API_BASE_URL=http://localhost:5173
API_TIMEOUT=30000
```

3. Keep this file private - never commit to git

## Step 6: Start Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v7.x.x  ready in xxxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Open your browser to `http://localhost:5173`

## Step 7: Load Sample Data

1. Click the "Load Seed Data" button on the dashboard
2. You should see:
   - 5 lecturers
   - 5 classrooms
   - 5 student groups
   - 5 courses
   - 0 scheduled slots (until you generate a timetable)

## Step 8: Test the Application

### Dashboard
- See statistics for all entities
- Load seed data
- Reset all data

### Lecturers Page
- View, add, edit, delete lecturers
- Set lecturer availability

### Classrooms Page
- View, add, edit, delete classrooms
- Set room capacity and type

### Student Groups Page
- View, add, edit, delete student groups
- Set group size and year

### Courses Page
- View, add, edit, delete courses
- Assign lecturers and student groups
- Set course hours and room type requirement

### Timetable Page
- View current assignments
- Generate new timetable using constraint solver
- View timetable in grid format

### Conflicts Page
- See detected scheduling conflicts
- Understand constraint violations
- Use to improve scheduling

## Step 9: Deploy to Cloudflare (Optional)

### Setup

1. Install Wrangler CLI:
```bash
npm install -g @cloudflare/wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Update `wrangler.jsonc`:
```jsonc
{
  "name": "your-app-name",
  "env": {
    "production": {
      "vars": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_KEY": "your-supabase-key"
      }
    }
  }
}
```

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy to Cloudflare
wrangler deploy --env production
```

Your app will be available at: `https://your-app-name.pages.dev`

## Development Workflow

### Making API Changes

1. Edit `src/api/routes.ts`
2. Changes hot-reload automatically
3. Test with curl or the frontend

### Making UI Changes

1. Edit React components in `src/routes/` or `src/components/`
2. Changes hot-reload automatically
3. Use Tailwind CSS classes for styling

### Adding Database Migrations

1. Write SQL in `wrangler.jsonc` or directly in Supabase SQL Editor
2. Apply changes to database
3. Update TypeScript types if needed

### Building for Production

```bash
npm run build        # Creates optimized build
npm run build:dev    # Development build
npm run preview      # Preview production build locally
```

## Useful Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier

# Testing
npm test             # Run tests (if added)
```

## Troubleshooting

### "Supabase connection failed"
- Check `.env.local` has correct credentials
- Ensure Supabase project is running
- Test connection: `curl https://your-supabase-url/rest/v1/lecturers`

### "Database tables not found"
- Run `DATABASE_SCHEMA.sql` again in Supabase SQL Editor
- Check Supabase Table Editor for tables
- Verify no SQL errors during creation

### "CORS errors in browser console"
- This is expected during development
- Supabase handles CORS automatically
- Won't appear in production Cloudflare deployment

### "Hot reload not working"
- Restart dev server: `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check Vite is running without errors

### "Build fails with TypeScript errors"
```bash
# Check for type errors
npx tsc --noEmit

# Fix common issues
rm -rf node_modules
npm install
npm run build
```

### "Port 5173 already in use"
```bash
# Kill process using port 5173 (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Or start on different port
npm run dev -- --port 3000
```

## API Usage Examples

### Test API with curl

```bash
# Health check
curl http://localhost:5173/api/health

# Get all lecturers
curl http://localhost:5173/api/lecturers

# Create lecturer
curl -X POST http://localhost:5173/api/lecturers \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Test","email":"test@uni.edu","department":"CS"}'

# Get conflicts
curl http://localhost:5173/api/conflicts
```

See [API_EXAMPLES.sh](./API_EXAMPLES.sh) for more examples.

## Project Structure

```
class-harmony/
├── src/
│   ├── api/
│   │   └── routes.ts            # All API endpoints
│   ├── components/              # React components
│   ├── lib/
│   │   ├── api-client.ts        # Frontend API client
│   │   ├── conflicts.ts         # Conflict detection
│   │   ├── scheduler.ts         # Scheduling algorithm
│   │   └── ...
│   ├── routes/                  # Pages and layouts
│   ├── store/                   # Zustand state
│   ├── types/                   # TypeScript types
│   ├── server.ts                # Server entry point
│   └── start.ts                 # Client entry point
├── DATABASE_SCHEMA.sql          # Database setup
├── README_SETUP.md              # Full documentation
├── API_EXAMPLES.sh              # API testing examples
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── wrangler.jsonc               # Cloudflare config
```

## Next Steps

1. **Customize Styling**: Edit Tailwind config in `tailwind.config.js`
2. **Add Authentication**: Integrate Supabase Auth
3. **Add More Features**: 
   - Email notifications for lecturers
   - Export timetable to PDF
   - Calendar view
   - Bulk import from CSV
4. **Deploy**: Push to Cloudflare Workers
5. **Monitor**: Set up error tracking and logging

## Getting Help

- Check [README_SETUP.md](./README_SETUP.md) for full documentation
- Review [API_EXAMPLES.sh](./API_EXAMPLES.sh) for API usage
- Check browser console for JavaScript errors
- Check terminal for server errors
- Visit [Supabase Docs](https://supabase.com/docs)
- Visit [Hono Docs](https://hono.dev)

---

**Happy Scheduling! 🎓**
