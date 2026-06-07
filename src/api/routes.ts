import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, update, deleteRecord, execute } from '../lib/db';

// Type definitions
interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  availability?: Array<{ day: number; period: number }>;
}

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab';
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
  roomType: 'lecture' | 'lab';
}

interface Assignment {
  id: string;
  courseId: string;
  day: number;
  period: number;
  classroomId: string;
}

// Helper function to generate UUID v4 compatible ID
function generateId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 36);
}

// Hono app setup
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// LECTURERS ENDPOINTS
// ============================================
app.get('/api/lecturers', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data: lecturers, error } = await supabase
      .from('lecturers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Fetch availability for each lecturer
    const lecturesWithAvailability = await Promise.all(
      lecturers.map(async (lecturer) => {
        const { data: availability } = await supabase
          .from('lecturer_availability')
          .select('day, period')
          .eq('lecturer_id', lecturer.id);
        
        return {
          id: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          department: lecturer.department,
          availability: availability || [],
        };
      })
    );
    
    return c.json(lecturesWithAvailability);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/lecturers', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as Lecturer;
    
    const { data, error } = await supabase
      .from('lecturers')
      .insert([
        {
          name: body.name,
          email: body.email,
          department: body.department,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Add availability if provided
    if (body.availability && body.availability.length > 0) {
      const availabilityData = body.availability.map(slot => ({
        lecturer_id: data.id,
        day: slot.day,
        period: slot.period,
      }));
      
      await supabase
        .from('lecturer_availability')
        .insert(availabilityData);
    }
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/lecturers/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Lecturer>;
    
    const { data, error } = await supabase
      .from('lecturers')
      .update({
        name: body.name,
        email: body.email,
        department: body.department,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update availability if provided
    if (body.availability) {
      await supabase
        .from('lecturer_availability')
        .delete()
        .eq('lecturer_id', id);
      
      if (body.availability.length > 0) {
        const availabilityData = body.availability.map(slot => ({
          lecturer_id: id,
          day: slot.day,
          period: slot.period,
        }));
        
        await supabase
          .from('lecturer_availability')
          .insert(availabilityData);
      }
    }
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/lecturers/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('lecturers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return c.json({ message: 'Lecturer deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// CLASSROOMS ENDPOINTS
// ============================================
app.get('/api/classrooms', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/classrooms', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as Classroom;
    
    const { data, error } = await supabase
      .from('classrooms')
      .insert([
        {
          name: body.name,
          capacity: body.capacity,
          type: body.type,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/classrooms/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Classroom>;
    
    const { data, error } = await supabase
      .from('classrooms')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/classrooms/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return c.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// STUDENT GROUPS ENDPOINTS
// ============================================
app.get('/api/groups', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data, error } = await supabase
      .from('student_groups')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/groups', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as StudentGroup;
    
    const { data, error } = await supabase
      .from('student_groups')
      .insert([
        {
          name: body.name,
          size: body.size,
          year: body.year,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/groups/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<StudentGroup>;
    
    const { data, error } = await supabase
      .from('student_groups')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/groups/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('student_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return c.json({ message: 'Group deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// COURSES ENDPOINTS
// ============================================
app.get('/api/courses', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('code');
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/courses', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as Course;
    
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          code: body.code,
          title: body.title,
          lecturer_id: body.lecturerId,
          group_id: body.groupId,
          weekly_hours: body.weeklyHours,
          room_type: body.roomType,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/courses/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Course>;
    
    const updateData: any = {};
    if (body.code) updateData.code = body.code;
    if (body.title) updateData.title = body.title;
    if (body.lecturerId) updateData.lecturer_id = body.lecturerId;
    if (body.groupId) updateData.group_id = body.groupId;
    if (body.weeklyHours) updateData.weekly_hours = body.weeklyHours;
    if (body.roomType) updateData.room_type = body.roomType;
    
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/courses/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return c.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// ASSIGNMENTS ENDPOINTS
// ============================================
app.get('/api/assignments', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data, error } = await supabase
      .from('assignments')
      .select('*');
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/assignments', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as Assignment;
    
    const { data, error } = await supabase
      .from('assignments')
      .insert([
        {
          course_id: body.courseId,
          day: body.day,
          period: body.period,
          classroom_id: body.classroomId,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.post('/api/assignments/batch', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json() as Assignment[];
    
    // Clear existing assignments
    await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new assignments
    const { data, error } = await supabase
      .from('assignments')
      .insert(body.map(a => ({
        course_id: a.courseId,
        day: a.day,
        period: a.period,
        classroom_id: a.classroomId,
      })))
      .select();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/assignments/:id', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return c.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/assignments', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) throw error;
    
    return c.json({ message: 'All assignments cleared successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// CONFLICTS ENDPOINTS
// ============================================
app.get('/api/conflicts', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data, error } = await supabase
      .rpc('check_conflicts');
    
    if (error) throw error;
    
    return c.json(data || []);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// ============================================
// SEED DATA ENDPOINT
// ============================================
// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'MySQL' });
});

// ============================================
// LECTURERS ENDPOINTS
// ============================================
app.get('/api/lecturers', async (c) => {
  try {
    const lecturers = await query<any>('SELECT * FROM lecturers ORDER BY name');
    
    // Fetch availability for each lecturer
    const lecturesWithAvailability = await Promise.all(
      lecturers.map(async (lecturer) => {
        const availability = await query<any>(
          'SELECT day, period FROM lecturer_availability WHERE lecturer_id = ?',
          [lecturer.id]
        );
        
        return {
          ...lecturer,
          availability: availability || [],
        };
      })
    );
    
    return c.json(lecturesWithAvailability);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/lecturers', async (c) => {
  try {
    const body = await c.req.json() as Lecturer;
    const id = generateId();
    
    await insert('lecturers', {
      id,
      name: body.name,
      email: body.email,
      department: body.department,
    });
    
    // Add availability if provided
    if (body.availability && body.availability.length > 0) {
      for (const slot of body.availability) {
        await insert('lecturer_availability', {
          id: generateId(),
          lecturer_id: id,
          day: slot.day,
          period: slot.period,
        });
      }
    }
    
    return c.json({ id, name: body.name, email: body.email, department: body.department }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/lecturers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Lecturer>;
    
    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.department) updateData.department = body.department;
    
    if (Object.keys(updateData).length > 0) {
      await update('lecturers', id, updateData);
    }
    
    // Update availability if provided
    if (body.availability) {
      await execute('DELETE FROM lecturer_availability WHERE lecturer_id = ?', [id]);
      
      if (body.availability.length > 0) {
        for (const slot of body.availability) {
          await insert('lecturer_availability', {
            id: generateId(),
            lecturer_id: id,
            day: slot.day,
            period: slot.period,
          });
        }
      }
    }
    
    return c.json({ id, ...updateData });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/lecturers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteRecord('lecturers', id);
    return c.json({ message: 'Lecturer deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// CLASSROOMS ENDPOINTS
// ============================================
app.get('/api/classrooms', async (c) => {
  try {
    const classrooms = await query<any>(
      'SELECT * FROM classrooms ORDER BY name'
    );
    return c.json(classrooms);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/classrooms', async (c) => {
  try {
    const body = await c.req.json() as Classroom;
    const id = generateId();
    
    await insert('classrooms', {
      id,
      name: body.name,
      capacity: body.capacity,
      type: body.type,
    });
    
    return c.json({ id, ...body }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/classrooms/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Classroom>;
    
    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.type) updateData.type = body.type;
    
    if (Object.keys(updateData).length > 0) {
      await update('classrooms', id, updateData);
    }
    
    return c.json({ id, ...updateData });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/classrooms/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteRecord('classrooms', id);
    return c.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// STUDENT GROUPS ENDPOINTS
// ============================================
app.get('/api/groups', async (c) => {
  try {
    const groups = await query<any>(
      'SELECT * FROM student_groups ORDER BY name'
    );
    return c.json(groups);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/groups', async (c) => {
  try {
    const body = await c.req.json() as StudentGroup;
    const id = generateId();
    
    await insert('student_groups', {
      id,
      name: body.name,
      size: body.size,
      year: body.year,
    });
    
    return c.json({ id, ...body }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/groups/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<StudentGroup>;
    
    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.year !== undefined) updateData.year = body.year;
    
    if (Object.keys(updateData).length > 0) {
      await update('student_groups', id, updateData);
    }
    
    return c.json({ id, ...updateData });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/groups/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteRecord('student_groups', id);
    return c.json({ message: 'Group deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// COURSES ENDPOINTS
// ============================================
app.get('/api/courses', async (c) => {
  try {
    const courses = await query<any>(
      'SELECT id, code, title, lecturer_id as lecturerId, group_id as groupId, weekly_hours as weeklyHours, room_type as roomType FROM courses ORDER BY code'
    );
    return c.json(courses);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/courses', async (c) => {
  try {
    const body = await c.req.json() as Course;
    const id = generateId();
    
    await insert('courses', {
      id,
      code: body.code,
      title: body.title,
      lecturer_id: body.lecturerId,
      group_id: body.groupId,
      weekly_hours: body.weeklyHours,
      room_type: body.roomType,
    });
    
    return c.json({ id, ...body }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.put('/api/courses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Partial<Course>;
    
    const updateData: Record<string, any> = {};
    if (body.code) updateData.code = body.code;
    if (body.title) updateData.title = body.title;
    if (body.lecturerId) updateData.lecturer_id = body.lecturerId;
    if (body.groupId) updateData.group_id = body.groupId;
    if (body.weeklyHours !== undefined) updateData.weekly_hours = body.weeklyHours;
    if (body.roomType) updateData.room_type = body.roomType;
    
    if (Object.keys(updateData).length > 0) {
      await update('courses', id, updateData);
    }
    
    return c.json({ id, ...updateData });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/courses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteRecord('courses', id);
    return c.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// ASSIGNMENTS ENDPOINTS
// ============================================
app.get('/api/assignments', async (c) => {
  try {
    const assignments = await query<any>(
      'SELECT id, course_id as courseId, day, period, classroom_id as classroomId FROM assignments'
    );
    return c.json(assignments);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.post('/api/assignments', async (c) => {
  try {
    const body = await c.req.json() as Assignment;
    const id = generateId();
    
    await insert('assignments', {
      id,
      course_id: body.courseId,
      day: body.day,
      period: body.period,
      classroom_id: body.classroomId,
    });
    
    return c.json({ id, ...body }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.post('/api/assignments/batch', async (c) => {
  try {
    const body = await c.req.json() as Assignment[];
    
    // Delete all existing assignments
    await execute('TRUNCATE TABLE assignments');
    
    // Insert new assignments
    for (const assignment of body) {
      await insert('assignments', {
        id: generateId(),
        course_id: assignment.courseId,
        day: assignment.day,
        period: assignment.period,
        classroom_id: assignment.classroomId,
      });
    }
    
    return c.json({ message: 'Assignments created', count: body.length }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/assignments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteRecord('assignments', id);
    return c.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.delete('/api/assignments', async (c) => {
  try {
    await execute('TRUNCATE TABLE assignments');
    return c.json({ message: 'All assignments cleared successfully' });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

// ============================================
// CONFLICTS ENDPOINTS
// ============================================
app.get('/api/conflicts', async (c) => {
  try {
    const conflicts = await detectConflicts();
    return c.json(conflicts);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// ============================================
// SEED DATA ENDPOINT
// ============================================
app.post('/api/seed', async (c) => {
  try {
    // Clear all existing data
    await execute('TRUNCATE TABLE assignments');
    await execute('TRUNCATE TABLE courses');
    await execute('TRUNCATE TABLE student_groups');
    await execute('TRUNCATE TABLE classrooms');
    await execute('TRUNCATE TABLE lecturer_availability');
    await execute('TRUNCATE TABLE lecturers');
    
    // Insert seed lecturers
    const lecturerIds: string[] = [];
    const lecturers = [
      { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@uni.edu', department: 'Computer Science' },
      { name: 'Prof. Ahmed Hassan', email: 'ahmed.hassan@uni.edu', department: 'Mathematics' },
      { name: 'Dr. Emily Chen', email: 'emily.chen@uni.edu', department: 'Computer Science' },
      { name: 'Dr. Michael Brown', email: 'michael.brown@uni.edu', department: 'Physics' },
      { name: 'Prof. Lisa Anderson', email: 'lisa.anderson@uni.edu', department: 'Chemistry' },
    ];
    
    for (const lecturer of lecturers) {
      const id = generateId();
      await insert('lecturers', { id, ...lecturer });
      lecturerIds.push(id);
    }
    
    // Insert seed classrooms
    const classroomIds: string[] = [];
    const classrooms = [
      { name: 'Lecture Hall A', capacity: 200, type: 'lecture' },
      { name: 'Lecture Hall B', capacity: 150, type: 'lecture' },
      { name: 'Lab Room 101', capacity: 40, type: 'lab' },
      { name: 'Lab Room 102', capacity: 40, type: 'lab' },
      { name: 'Seminar Room C', capacity: 60, type: 'lecture' },
    ];
    
    for (const classroom of classrooms) {
      const id = generateId();
      await insert('classrooms', { id, ...classroom });
      classroomIds.push(id);
    }
    
    // Insert seed student groups
    const groupIds: string[] = [];
    const groups = [
      { name: 'CS-Year1-Group-A', size: 80, year: 1 },
      { name: 'CS-Year2-Group-A', size: 75, year: 2 },
      { name: 'CS-Year3-Group-A', size: 70, year: 3 },
      { name: 'Math-Year1-Group-A', size: 65, year: 1 },
      { name: 'Physics-Year2-Group-A', size: 60, year: 2 },
    ];
    
    for (const group of groups) {
      const id = generateId();
      await insert('student_groups', { id, ...group });
      groupIds.push(id);
    }
    
    // Insert seed courses
    const seedCourses = [
      { code: 'CS101', title: 'Introduction to Programming', lecturer_id: lecturerIds[0], group_id: groupIds[0], weekly_hours: 4, room_type: 'lecture' },
      { code: 'CS201', title: 'Data Structures', lecturer_id: lecturerIds[2], group_id: groupIds[1], weekly_hours: 4, room_type: 'lecture' },
      { code: 'CS301', title: 'Advanced Algorithms', lecturer_id: lecturerIds[0], group_id: groupIds[2], weekly_hours: 3, room_type: 'lecture' },
      { code: 'MATH101', title: 'Calculus I', lecturer_id: lecturerIds[1], group_id: groupIds[3], weekly_hours: 4, room_type: 'lecture' },
      { code: 'PHYS201', title: 'Classical Mechanics', lecturer_id: lecturerIds[3], group_id: groupIds[4], weekly_hours: 4, room_type: 'lecture' },
    ];
    
    for (const course of seedCourses) {
      const id = generateId();
      await insert('courses', { id, ...course });
    }
    
    return c.json({ message: 'Seed data loaded successfully' }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// ============================================
// CONFLICT DETECTION LOGIC
// ============================================
async function detectConflicts() {
  const conflicts: any[] = [];
  
  try {
    // Get all assignments with details
    const assignments = await query<any>(
      `SELECT 
        a.id, a.day, a.period,
        c.id as course_id, c.code as course_code, c.title as course_title,
        l.id as lecturer_id, l.name as lecturer_name,
        sg.id as group_id, sg.name as group_name, sg.size,
        cr.id as classroom_id, cr.name as classroom_name, cr.capacity, cr.type as classroom_type,
        c.room_type
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN lecturers l ON c.lecturer_id = l.id
      JOIN student_groups sg ON c.group_id = sg.id
      JOIN classrooms cr ON a.classroom_id = cr.id`
    );
    
    // Check for lecturer double-booking
    const lecturerSlots = new Map<string, any[]>();
    for (const a of assignments) {
      const key = `${a.lecturer_id}-${a.day}-${a.period}`;
      if (!lecturerSlots.has(key)) lecturerSlots.set(key, []);
      lecturerSlots.get(key)!.push(a);
    }
    
    for (const [, slots] of lecturerSlots) {
      if (slots.length > 1) {
        conflicts.push({
          type: 'lecturer-double-booked',
          message: `Lecturer ${slots[0].lecturer_name} is assigned to multiple courses at the same time`,
          assignmentIds: slots.map(s => s.id),
        });
      }
    }
    
    // Check for classroom double-booking
    const classroomSlots = new Map<string, any[]>();
    for (const a of assignments) {
      const key = `${a.classroom_id}-${a.day}-${a.period}`;
      if (!classroomSlots.has(key)) classroomSlots.set(key, []);
      classroomSlots.get(key)!.push(a);
    }
    
    for (const [, slots] of classroomSlots) {
      if (slots.length > 1) {
        conflicts.push({
          type: 'classroom-double-booked',
          message: `Classroom ${slots[0].classroom_name} is assigned to multiple courses at the same time`,
          assignmentIds: slots.map(s => s.id),
        });
      }
    }
    
    // Check for group double-booking
    const groupSlots = new Map<string, any[]>();
    for (const a of assignments) {
      const key = `${a.group_id}-${a.day}-${a.period}`;
      if (!groupSlots.has(key)) groupSlots.set(key, []);
      groupSlots.get(key)!.push(a);
    }
    
    for (const [, slots] of groupSlots) {
      if (slots.length > 1) {
        conflicts.push({
          type: 'group-double-booked',
          message: `Student group ${slots[0].group_name} is assigned to multiple courses at the same time`,
          assignmentIds: slots.map(s => s.id),
        });
      }
    }
    
    // Check for room too small
    for (const a of assignments) {
      if (a.capacity < a.size) {
        conflicts.push({
          type: 'room-too-small',
          message: `Classroom ${a.classroom_name} (capacity: ${a.capacity}) is too small for group ${a.group_name} (size: ${a.size})`,
          assignmentIds: [a.id],
        });
      }
    }
    
    // Check for room type mismatch
    for (const a of assignments) {
      if (a.room_type !== a.classroom_type) {
        conflicts.push({
          type: 'room-type-mismatch',
          message: `Course ${a.course_code} requires ${a.room_type} room but assigned to ${a.classroom_type} room`,
          assignmentIds: [a.id],
        });
      }
    }
    
    // Check for lecturer unavailability
    for (const a of assignments) {
      const availability = await queryOne<any>(
        'SELECT id FROM lecturer_availability WHERE lecturer_id = ? AND day = ? AND period = ?',
        [a.lecturer_id, a.day, a.period]
      );
      
      if (!availability) {
        const hasAvailability = await queryOne<any>(
          'SELECT id FROM lecturer_availability WHERE lecturer_id = ? LIMIT 1',
          [a.lecturer_id]
        );
        
        if (hasAvailability) {
          conflicts.push({
            type: 'lecturer-unavailable',
            message: `Lecturer ${a.lecturer_name} is not available at day ${a.day} period ${a.period}`,
            assignmentIds: [a.id],
          });
        }
      }
    }
  } catch (error) {
    console.error('Error detecting conflicts:', error);
  }
  
  return conflicts;
}

export default app;
