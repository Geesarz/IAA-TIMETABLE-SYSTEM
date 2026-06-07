# Class Harmony - Quick Reference Card

## 🚀 Quick Commands

```bash
# Setup
npm install                    # Install dependencies
cp .env.example .env.local    # Create env file
npm run dev                    # Start dev server

# Build & Deploy
npm run build                  # Build for production
npm run preview               # Preview production build
wrangler deploy               # Deploy to Cloudflare

# Code Quality
npm run lint                   # Run linting
npm run format                # Format code

# Testing
curl http://localhost:5173/api/health
npm test                       # Run tests (when added)
```

## 📊 Database Quick Reference

| Table | Columns | Purpose |
|-------|---------|---------|
| **lecturers** | id, name, email, department | Faculty members |
| **lecturer_availability** | id, lecturer_id, day, period | When lecturer can teach |
| **classrooms** | id, name, capacity, type | Physical rooms |
| **student_groups** | id, name, size, year | Student cohorts |
| **courses** | id, code, title, lecturer_id, group_id, weekly_hours, room_type | Course definitions |
| **assignments** | id, course_id, day, period, classroom_id | Scheduled slots |
| **conflicts** | id, type, message, assignment_ids | Issues detected |

## 🔑 Days & Periods

### Days (1-5)
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday

### Periods (1-8)
- 1 = 08:00–09:00
- 2 = 09:00–10:00
- 3 = 10:00–11:00
- 4 = 11:00–12:00
- 5 = 13:00–14:00 (after lunch)
- 6 = 14:00–15:00
- 7 = 15:00–16:00
- 8 = 16:00–17:00

## 📡 API Endpoints Summary

```
GET    /api/health                    Health check
GET    /api/lecturers                 List lecturers
POST   /api/lecturers                 Create lecturer
PUT    /api/lecturers/:id             Update lecturer
DELETE /api/lecturers/:id             Delete lecturer

GET    /api/classrooms                List classrooms
POST   /api/classrooms                Create classroom
PUT    /api/classrooms/:id            Update classroom
DELETE /api/classrooms/:id            Delete classroom

GET    /api/groups                    List groups
POST   /api/groups                    Create group
PUT    /api/groups/:id                Update group
DELETE /api/groups/:id                Delete group

GET    /api/courses                   List courses
POST   /api/courses                   Create course
PUT    /api/courses/:id               Update course
DELETE /api/courses/:id               Delete course

GET    /api/assignments               List assignments
POST   /api/assignments               Create assignment
POST   /api/assignments/batch         Batch assignments
DELETE /api/assignments/:id           Delete assignment
DELETE /api/assignments               Clear all

GET    /api/conflicts                 Get conflicts
POST   /api/seed                      Load seed data
```

## 🏗️ Hono Request/Response Pattern

```typescript
// Request
app.post('/api/resource', async (c) => {
  const body = await c.req.json();
  const id = c.req.param('id');
  
  // Response
  return c.json(data, 201);  // or 200, 400, 500, etc.
});

// Common Status Codes
// 200 - OK (GET, PUT success)
// 201 - Created (POST success)
// 204 - No Content (DELETE)
// 400 - Bad Request
// 404 - Not Found
// 500 - Server Error
```

## 🗂️ Frontend Component Structure

```
src/
├── pages (routes/)           # Page components
├── components/               # Reusable components
│   ├── ui/                   # Radix UI components
│   └── AppLayout.tsx         # Layout wrapper
├── hooks/                    # Custom hooks
├── lib/                      # Utilities
│   └── api-client.ts         # API calls
└── store/                    # Zustand state
    └── timetable-store.ts    # App state
```

## 💻 TypeScript Types

```typescript
type Day = 1 | 2 | 3 | 4 | 5;
type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type RoomType = "lecture" | "lab";

interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  availability: Slot[];
}

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
}

interface StudentGroup {
  id: string;
  name: string;
  size: number;
  year: 1 | 2 | 3;
}

interface Course {
  id: string;
  code: string;
  title: string;
  lecturerId: string;
  groupId: string;
  weeklyHours: number;
  roomType: RoomType;
}

interface Assignment {
  id: string;
  courseId: string;
  day: Day;
  period: Period;
  classroomId: string;
}
```

## 🔌 API Client Usage

```typescript
import { apiClient } from '@/lib/api-client';

// Lecturers
await apiClient.getLecturers();
await apiClient.createLecturer({ name, email, department });
await apiClient.updateLecturer(id, { name });
await apiClient.deleteLecturer(id);

// Classrooms
await apiClient.getClassrooms();
await apiClient.createClassroom({ name, capacity, type });
await apiClient.updateClassroom(id, { capacity });
await apiClient.deleteClassroom(id);

// Groups
await apiClient.getGroups();
await apiClient.createGroup({ name, size, year });
await apiClient.updateGroup(id, { size });
await apiClient.deleteGroup(id);

// Courses
await apiClient.getCourses();
await apiClient.createCourse({ code, title, lecturerId, groupId, weeklyHours, roomType });
await apiClient.updateCourse(id, { title });
await apiClient.deleteCourse(id);

// Assignments
await apiClient.getAssignments();
await apiClient.createAssignment({ courseId, day, period, classroomId });
await apiClient.createAssignmentsBatch([...]);
await apiClient.deleteAssignment(id);
await apiClient.clearAssignments();

// Conflicts
await apiClient.getConflicts();

// Data
await apiClient.seedData();
```

## 🎨 Tailwind CSS Quick Classes

```
# Spacing
p-4 m-2 gap-4          # padding, margin, gap
w-full h-screen        # width, height

# Colors
bg-blue-500 text-white # background, text color
border-slate-300       # borders

# Layout
flex grid block         # display types
flex-row justify-center align-items-center

# Responsive
sm: md: lg: xl:         # breakpoints
hover: focus: dark:     # states

# Text
font-bold text-lg text-center # typography

# Effects
shadow rounded-lg opacity-50 # visual effects
```

## 🔍 Debugging Tips

```typescript
// Check API
curl http://localhost:5173/api/health

// Check database
console.log('Lecturers:', lecturers);

// Check state
import { useTimetableStore } from '@/store/timetable-store';
const state = useTimetableStore((s) => s);
console.log(state);

// Check errors
Browser Console (F12)
Terminal (npm run dev)
Supabase Dashboard > Logs
```

## 📦 .env.local Variables

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
NODE_ENV=development
API_BASE_URL=http://localhost:5173
```

## 🚨 Conflict Types

```
lecturer-double-booked      # Lecturer teaches 2 courses same time
classroom-double-booked     # Room used for 2 courses same time
group-double-booked         # Group attends 2 courses same time
lecturer-unavailable        # Course outside lecturer availability
room-too-small              # Room capacity < group size
room-type-mismatch          # Wrong room type (lab vs lecture)
```

## 📂 Key Files to Know

| File | Purpose |
|------|---------|
| `src/api/routes.ts` | All API endpoints |
| `src/server.ts` | Server entry + Hono setup |
| `src/lib/api-client.ts` | Frontend API methods |
| `src/store/timetable-store.ts` | Global state |
| `src/types/timetable.ts` | TypeScript types |
| `DATABASE_SCHEMA.sql` | Database setup |
| `.env.local` | Local environment vars |
| `package.json` | Dependencies |
| `wrangler.jsonc` | Cloudflare config |

## 🔗 Useful Links

- [Hono Docs](https://hono.dev) - Web framework
- [Supabase Docs](https://supabase.com/docs) - Database
- [React Docs](https://react.dev) - UI library
- [TanStack Router](https://tanstack.com/router) - Routing
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Zod](https://zod.dev) - Validation
- [Zustand](https://github.com/pmndrs/zustand) - State

## 🎯 Common Tasks

### Add a new API endpoint
1. Edit `src/api/routes.ts`
2. Add route: `app.post('/api/resource', handler)`
3. Add to `src/lib/api-client.ts`
4. Use in React component

### Add a new page
1. Create `src/routes/newpage.tsx`
2. Use `createFileRoute('/newpage')`
3. Add link in navigation

### Change database schema
1. Edit `DATABASE_SCHEMA.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types
4. Update API handlers

### Deploy changes
1. Test locally: `npm run dev`
2. Build: `npm run build`
3. Deploy: `wrangler deploy`
4. Verify: Check deployed URL

## 🚀 One-Liner Commands

```bash
# Full workflow
npm install && npm run dev                    # Setup & run
npm run lint && npm run build                 # Check & build
npm run format && npm run build && wrangler deploy  # Format & deploy
```

## ⚡ Performance Tips

- Use React Query for data fetching
- Lazy load large components
- Optimize images before using
- Use Tailwind's production build
- Enable compression in Hono
- Set proper cache headers

## 🔐 Security Checklist

- [ ] .env.local not committed
- [ ] No credentials in code
- [ ] CORS properly configured
- [ ] Input validation added
- [ ] Rate limiting implemented
- [ ] HTTPS enabled in production
- [ ] Database backups enabled
- [ ] Monitoring set up

---

**More Info**: See PROJECT_SUMMARY.md and documentation files.
