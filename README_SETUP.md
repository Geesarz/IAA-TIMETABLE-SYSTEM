# IAA-CLASS TIMETABLE-SYSTEM-WITH-IAA - University Timetable Management System

A full-stack system for managing university class timetables with conflict detection and resolution. Built with React, TanStack Router, Hono, and MySQL.

## 🎯 Features

- **Lecturer Management**: Add and manage lecturers with availability constraints
- **Classroom Management**: Manage classrooms with capacity and type (lecture/lab)
- **Student Groups**: Create and manage student groups by year
- **Course Management**: Define courses with assigned lecturers and groups
- **Timetable Generation**: Automatically schedule courses into available slots
- **Conflict Detection**: Identifies and displays scheduling conflicts:
  - Lecturer double-booking
  - Classroom double-booking
  - Student group double-booking
  - Lecturer unavailability violations
  - Insufficient room capacity
  - Room type mismatches
- **Responsive UI**: Modern, mobile-friendly interface with dark mode support

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TanStack Router** - Client-side routing with type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless component library
- **React Hook Form** - Form state management
- **Zustand** - State management
- **React Query** - Server state management
- **TypeScript** - Type safety

### Backend
- **FastAPI** - Modern, fast, auto-documented Python web framework (Recommended)
- **Hono** - Lightweight web framework for Cloudflare Workers (Optional)
- **Python 3.8+** or **Node.js** - Runtime environment
- **MySQL 8.0+** - Relational database
- **SQLAlchemy** (Python) or **mysql2** (Node.js) - Database drivers

### Deployment
- **Gunicorn** (Python) or **Cloudflare Workers** (Node.js) - Hosting options

## 📋 Prerequisites

- Node.js 18+ and npm/yarn (for frontend)
- Python 3.8+ (for Python backend - optional if using Node.js)
- MySQL 8.0+ (local or remote)

## 🚀 Quick Start

### Option A: Python/FastAPI Backend (Recommended) ⭐

**1. Set up Python environment**:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**2. Set up MySQL** (see [MYSQL_SETUP.md](./MYSQL_SETUP.md)):
```bash
mysql -u root -p
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'class_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON class_harmony.* TO 'class_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

mysql -u class_user -p class_harmony < DATABASE_SCHEMA.sql
```

**3. Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your MySQL credentials
```

**4. Run FastAPI server**:
```bash
python main.py
# Server: http://localhost:8000
# API Docs: http://localhost:8000/docs (auto-generated!)
```

**5. Run React frontend** (in another terminal):
```bash
npm install
npm run dev
# Frontend: http://localhost:8080
```

For detailed Python setup, see [PYTHON_SETUP.md](./PYTHON_SETUP.md).

---

### Option B: Node.js/Hono Backend (Original)

**1. Install dependencies**:
```bash
npm install
```

**2. Set up MySQL** (see [MYSQL_SETUP.md](./MYSQL_SETUP.md)):
```bash
mysql -u root -p
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'class_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON class_harmony.* TO 'class_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

mysql -u class_user -p class_harmony < DATABASE_SCHEMA.sql
```

**3. Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your MySQL credentials
```

**4. Run development server**:
```bash
npm run dev
# Frontend & API: http://localhost:8080
```

For detailed Node.js setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 📚 API Documentation

### Base URL
- **Python/FastAPI**: `http://localhost:8000/api`
- **Node.js/Hono**: `http://localhost:8080/api`

### Interactive API Docs (FastAPI Only)

When using Python/FastAPI, get **auto-generated interactive API documentation**:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

No need to write API docs manually—they're generated from your code!

### Health Check
```bash
GET /api/health
# Returns: { status: "ok", timestamp: "...", database: "MySQL" }
```

### Lecturers
```bash
GET /api/lecturers                    # Get all lecturers (with availability)
POST /api/lecturers                   # Create lecturer
PUT /api/lecturers/:id                # Update lecturer
DELETE /api/lecturers/:id             # Delete lecturer
```

**Lecturer Schema:**
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string (unique)",
  "department": "string",
  "availability": [{ "day": 1-5, "period": 1-8 }]
}
```

### Classrooms
```bash
GET /api/classrooms                   # Get all classrooms
POST /api/classrooms                  # Create classroom
PUT /api/classrooms/:id               # Update classroom
DELETE /api/classrooms/:id            # Delete classroom
```

**Classroom Schema:**
```json
{
  "id": "string (UUID)",
  "name": "string",
  "capacity": "number",
  "type": "lecture | lab"
}
```

### Student Groups
```bash
GET /api/groups                       # Get all groups
POST /api/groups                      # Create group
PUT /api/groups/:id                   # Update group
DELETE /api/groups/:id                # Delete group
```

**Group Schema:**
```json
{
  "id": "string (UUID)",
  "name": "string",
  "size": "number",
  "year": 1 | 2 | 3
}
```

### Courses
```bash
GET /api/courses                      # Get all courses
POST /api/courses                     # Create course
PUT /api/courses/:id                  # Update course
DELETE /api/courses/:id               # Delete course
```

**Course Schema:**
```json
{
  "id": "string (UUID)",
  "code": "string",
  "title": "string",
  "lecturerId": "string (UUID)",
  "groupId": "string (UUID)",
  "weeklyHours": "number",
  "roomType": "lecture | lab"
}
```

### Assignments (Timetable)
```bash
GET /api/assignments                  # Get all assignments
POST /api/assignments                 # Create assignment
POST /api/assignments/batch           # Batch create assignments
DELETE /api/assignments/:id           # Delete assignment
DELETE /api/assignments               # Clear all assignments
```

**Assignment Schema:**
```json
{
  "id": "string (UUID)",
  "courseId": "string (UUID)",
  "day": 1-5,
  "period": 1-8,
  "classroomId": "string (UUID)"
}
```

### Conflicts
```bash
GET /api/conflicts                    # Get detected conflicts (server-side detection)
```

**Conflict Response:**
```json
[
  {
    "type": "lecturer-double-booked",
    "message": "Lecturer Jane Doe is assigned to multiple courses at the same time",
    "assignmentIds": ["uuid1", "uuid2"]
  }
]
```

### Seed Data
```bash
POST /api/seed                        # Load sample data into database
```

## 🗄️ Database Schema (MySQL)

The database consists of the following tables:

- **lecturers** - Faculty members (id, name, email, department, created_at, updated_at)
- **lecturer_availability** - Available time slots for each lecturer (id, lecturer_id, day, period)
- **classrooms** - Rooms for classes (id, name, capacity, type, created_at, updated_at)
- **student_groups** - Groups of students (id, name, size, year, created_at, updated_at)
- **courses** - Course definitions (id, code, title, lecturer_id, group_id, weekly_hours, room_type, created_at, updated_at)
- **assignments** - Scheduled course-room-time assignments (id, course_id, day, period, classroom_id, created_at, updated_at)

All tables use:
- UUID primary keys (VARCHAR(36))
- TIMESTAMP fields with automatic creation/update
- Foreign key constraints with CASCADE delete
- Performance indexes on frequently queried columns
- UTF-8MB4 character set for multilingual support

For detailed schema, see [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql).

## 📖 Using the API Client

A TypeScript API client is provided for easy frontend integration:

```typescript
import { apiClient } from "@/lib/api-client";

// Get all lecturers
const lecturers = await apiClient.getLecturers();

// Create a new lecturer
const newLecturer = await apiClient.createLecturer({
  name: "Dr. Jane Doe",
  email: "jane@university.edu",
  department: "Computer Science",
  availability: [
    { day: 1, period: 1 },  // Monday, 1st period
    { day: 3, period: 2 },  // Wednesday, 2nd period
  ]
});

// Get conflicts (detected on server with MySQL queries)
const conflicts = await apiClient.getConflicts();

// Load seed data
await apiClient.seedData();
```

## 🔧 Customization

### Adding Custom Validation

Edit `src/api/routes.ts` to modify conflict detection logic:

```typescript
// Modify detectConflicts() function for custom rules
  assignments: Assignment[],
  courses: Course[],
  lecturers: Lecturer[],
  classrooms: Classroom[],
  groups: StudentGroup[]
): Conflict[] {
  // Add your custom validation here
}
```

### Extending the API

Add new endpoints in `src/api/routes.ts`:

```typescript
app.get('/api/custom-endpoint', async (c) => {
  // Your logic here
  return c.json(data);
});
```

### Styling

The project uses Tailwind CSS. Customize colors and theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your colors
      },
    },
  },
};
```

## 🚀 Deployment

### Deploy to Cloudflare Workers

1. Install Wrangler CLI:
```bash
npm install -g @cloudflare/wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Update `wrangler.jsonc` with your project name and settings

4. Deploy:
```bash
npm run build
wrangler deploy
```

### Environment Variables on Cloudflare

Set environment variables in `wrangler.jsonc`:

```jsonc
{
  "env": {
    "production": {
      "vars": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-anon-key"
      }
    }
  }
}
```

## 📝 Project Structure

```
src/
├── api/
│   └── routes.ts              # API endpoints
├── components/
│   ├── AppLayout.tsx
│   ├── PageHeader.tsx
│   └── ui/                    # Radix UI components
├── hooks/
│   └── use-mobile.tsx
├── lib/
│   ├── api-client.ts          # Frontend API client
│   ├── conflicts.ts           # Conflict detection logic
│   ├── error-*.ts             # Error handling
│   ├── scheduler.ts           # Scheduling algorithm
│   ├── seed.ts                # Sample data
│   └── utils.ts
├── routes/
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # Dashboard
│   ├── classrooms.tsx
│   ├── conflicts.tsx
│   ├── courses.tsx
│   ├── lecturers.tsx
│   └── timetable.tsx
├── store/
│   └── timetable-store.ts     # Zustand state
├── types/
│   └── timetable.ts           # TypeScript types
└── server.ts                  # Server entry point
```

## 🐛 Troubleshooting

### API Not Responding
1. Check that Supabase credentials are correct in `.env.local`
2. Verify database tables exist by running `DATABASE_SCHEMA.sql` again
3. Check browser console for CORS errors
4. Ensure the backend server is running (`npm run dev`)

### Conflicts Not Detected
1. Verify data is correctly in the database
2. Check that the `check_conflicts()` function exists in Supabase
3. Review the conflict detection logic in `src/lib/conflicts.ts`

### Build Errors
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear build cache: `rm -rf .vite dist`
3. Check TypeScript errors: `npx tsc --noEmit`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Scheduling! 🎓📚**
