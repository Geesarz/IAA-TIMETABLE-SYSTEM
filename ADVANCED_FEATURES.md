# Class Harmony - Advanced Features & Deployment Guide

## Advanced Features

### 1. Conflict Detection System

The application includes an intelligent conflict detection system that identifies scheduling problems:

#### Types of Conflicts

1. **Lecturer Double-Booked**: A lecturer is assigned to teach multiple courses at the same time
2. **Classroom Double-Booked**: A classroom is assigned to multiple courses at the same time
3. **Student Group Double-Booked**: A group of students is scheduled for multiple courses simultaneously
4. **Lecturer Unavailable**: A course is scheduled when the assigned lecturer is not available
5. **Room Too Small**: A classroom's capacity is less than the group size
6. **Room Type Mismatch**: A course requiring a lab is assigned to a lecture hall (or vice versa)

#### Database-Level Conflict Detection

The `check_conflicts()` PostgreSQL function automatically detects all conflicts:

```sql
SELECT * FROM check_conflicts();
```

This runs directly in the database and is very efficient for large datasets.

### 2. Constraint-Based Scheduling

The system uses constraint satisfaction to generate valid timetables:

```typescript
// src/lib/scheduler.ts

export function generateTimetable(
  courses: Course[],
  lecturers: Lecturer[],
  classrooms: Classroom[],
  groups: StudentGroup[]
): Assignment[] {
  // Applies constraints:
  // 1. Lecturer availability
  // 2. Room capacity
  // 3. Room type requirements
  // 4. No double-booking
  // 5. Spread courses across week
}
```

### 3. Real-time Conflict Detection

Conflicts are detected in real-time as assignments are made:

```typescript
// Use React Query for real-time updates
const { data: conflicts } = useQuery({
  queryKey: ['conflicts'],
  queryFn: () => apiClient.getConflicts(),
  refetchInterval: 2000,  // Refresh every 2 seconds
});
```

### 4. Availability Management

Lecturers can specify when they are available:

```typescript
// Lecturer availability by day and period
lecturer.availability = [
  { day: 1, period: 1 },  // Monday, 08:00-09:00
  { day: 1, period: 2 },  // Monday, 09:00-10:00
  { day: 3, period: 3 },  // Wednesday, 10:00-11:00
];
```

The system prevents scheduling courses outside availability windows.

## Deployment Strategies

### Local Development

```bash
npm run dev
# Runs on http://localhost:5173
# Hot reload enabled
# Direct Supabase connection
```

### Production on Cloudflare Workers

#### Prerequisites
```bash
npm install -g @cloudflare/wrangler
wrangler login
```

#### Configuration

Update `wrangler.jsonc`:

```jsonc
{
  "name": "class-harmony",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "env": {
    "production": {
      "vars": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-anon-key",
        "ENVIRONMENT": "production"
      },
      "routes": [
        {
          "pattern": "your-domain.com/*",
          "zone_name": "your-domain.com"
        }
      ]
    }
  }
}
```

#### Deployment Steps

```bash
# 1. Build for production
npm run build

# 2. Deploy to Cloudflare
wrangler deploy --env production

# 3. Verify deployment
curl https://your-domain.com/api/health
```

#### Custom Domain Setup

1. In Cloudflare dashboard, go to "Workers & Pages"
2. Click your project
3. Go to "Custom domain"
4. Add your domain
5. Approve DNS changes in your registrar

### Deployment on Vercel/Netlify

For traditional hosting instead of Cloudflare:

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy --prod

# Or Netlify
netlify deploy --prod
```

Configure `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDirectory": "dist",
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_KEY": "@supabase_key"
  }
}
```

## Performance Optimization

### Database Query Optimization

The database schema includes indexes on frequently queried columns:

```sql
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX idx_assignments_day_period ON assignments(day, period);
CREATE INDEX idx_lecturer_availability_lecturer_id ON lecturer_availability(lecturer_id);
```

### API Response Caching

Use React Query's caching:

```typescript
const { data: lecturers } = useQuery({
  queryKey: ['lecturers'],
  queryFn: () => apiClient.getLecturers(),
  staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
});
```

### Pagination (Future Feature)

For large datasets, implement pagination:

```typescript
app.get('/api/lecturers', async (c) => {
  const page = c.req.query('page') || '1';
  const limit = c.req.query('limit') || '20';
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { data, error } = await supabase
    .from('lecturers')
    .select('*', { count: 'exact' })
    .range(offset, offset + parseInt(limit) - 1);
  
  return c.json({
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: error?.count || 0
    }
  });
});
```

## Security Best Practices

### 1. Row Level Security (RLS)

Enable RLS on Supabase tables:

```sql
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lecturers"
  ON lecturers FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert"
  ON lecturers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 2. Environment Variables

Never commit sensitive data:

```bash
# .gitignore
.env.local
.env.production.local
.wrangler/
```

### 3. API Key Rotation

Regularly rotate Supabase keys:

1. Go to Supabase dashboard
2. Project Settings > API
3. Click "Rotate" on the key
4. Update `.env` files

### 4. CORS Configuration

Hono automatically handles CORS. For production:

```typescript
app.use('*', cors({
  origin: 'https://your-domain.com',
  credentials: true,
}));
```

## Monitoring & Logging

### Supabase Dashboard

Monitor database activity:
1. Go to Supabase Dashboard
2. Check "Realtime" tab for live updates
3. Check "Database" tab for query performance
4. Check "Auth" tab for user activity

### Error Tracking

Add error tracking with Sentry:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Server Logs

Cloudflare Workers logs:

```bash
# View logs
wrangler tail

# View specific environment logs
wrangler tail --env production
```

## Scalability Considerations

### For Small Institutions (< 1000 students)

Current setup is sufficient:
- Single Supabase project
- Cloudflare Workers free tier
- No caching needed

### For Medium Institutions (1000-10000 students)

Recommended improvements:
- Implement pagination on all endpoints
- Add Redis caching for frequently accessed data
- Use Supabase connection pooling
- Implement API rate limiting

### For Large Institutions (> 10000 students)

Advanced optimizations:
- Migrate to PostgreSQL managed service
- Implement CDN caching (Cloudflare's built-in CDN)
- Separate read/write databases
- Add background jobs for heavy operations
- Implement full-text search for courses

### Database Scaling

```sql
-- Add replication for high availability
-- Supabase handles this automatically

-- For very large datasets, partition assignments by day
CREATE TABLE assignments_mon (LIKE assignments);
CREATE TABLE assignments_tue (LIKE assignments);
-- ... etc
```

## Advanced Features Implementation

### 1. PDF Export

```typescript
import html2pdf from 'html2pdf.js';

export function exportTimetablePDF() {
  const element = document.getElementById('timetable');
  html2pdf().set({
    margin: 10,
    filename: 'timetable.pdf',
    image: { type: 'png', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape' }
  }).save();
}
```

### 2. CSV Import

```typescript
export async function importCoursesCSV(file: File) {
  const text = await file.text();
  const lines = text.split('\n');
  const courses = lines.slice(1).map(line => {
    const [code, title, lecturerEmail, groupName, hours] = line.split(',');
    return { code, title, lecturerEmail, groupName, hours: parseInt(hours) };
  });
  
  for (const course of courses) {
    await apiClient.createCourse(course);
  }
}
```

### 3. Email Notifications

```typescript
// Using Resend or SendGrid
export async function notifyLecturers(assignments: Assignment[]) {
  for (const assignment of assignments) {
    const lecturer = await getLecturer(assignment.courseId);
    
    await sendEmail({
      to: lecturer.email,
      subject: 'Your Class Schedule',
      template: 'schedule-notification',
      data: assignment
    });
  }
}
```

### 4. Calendar Integration

```typescript
export function generateICalendar(assignments: Assignment[]) {
  const events = assignments.map(a => ({
    summary: `${a.course.code} - ${a.course.title}`,
    dtstart: `${getDateForDay(a.day)}T${getPeriodStartTime(a.period)}00`,
    location: a.classroom.name,
    description: `${a.course.code}\nInstructor: ${a.course.lecturer.name}`
  }));
  
  return createCalendarFormat(events);
}
```

## Testing

### Unit Tests

```bash
npm install --save-dev vitest @testing-library/react

# Create tests/fixtures/lecturers.test.ts
import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api-client';

describe('Lecturers API', () => {
  it('should get all lecturers', async () => {
    const lecturers = await apiClient.getLecturers();
    expect(Array.isArray(lecturers)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Timetable Generation', () => {
  it('should detect conflicts', async () => {
    const conflicts = await apiClient.getConflicts();
    expect(conflicts).toBeDefined();
  });
  
  it('should generate valid timetable', async () => {
    const assignments = await generateTimetable();
    expect(assignments.length).toBeGreaterThan(0);
  });
});
```

## Support & Maintenance

### Regular Maintenance

- **Weekly**: Check error logs, review conflicts
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Full security audit, performance review
- **Annually**: Major version upgrades, architecture review

### Backup Strategy

Supabase handles automatic daily backups. For additional safety:

```bash
# Manual database export
pg_dump postgresql://user:password@host/db > backup.sql

# Restore from backup
psql postgresql://user:password@host/db < backup.sql
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions (carefully)
npm install react@latest react-dom@latest
```

---

For more information, see:
- [README_SETUP.md](./README_SETUP.md) - Full setup guide
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Step-by-step setup
- [API_EXAMPLES.sh](./API_EXAMPLES.sh) - API usage examples
