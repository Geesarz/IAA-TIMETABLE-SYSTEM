-- Class Harmony Database Schema
-- MySQL 8.0+ Compatible
-- For: IAA-CLASS TIMETABLE-SYSTEM-WITH-IAA

-- Create Lecturers table
CREATE TABLE IF NOT EXISTS lecturers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Lecturer Availability (slots when lecturer is available)
CREATE TABLE IF NOT EXISTS lecturer_availability (
  id VARCHAR(36) PRIMARY KEY,
  lecturer_id VARCHAR(36) NOT NULL,
  day INT NOT NULL CHECK (day >= 1 AND day <= 5),
  period INT NOT NULL CHECK (period >= 1 AND period <= 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_availability (lecturer_id, day, period),
  CONSTRAINT fk_lecturer_availability FOREIGN KEY (lecturer_id) 
    REFERENCES lecturers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capacity INT NOT NULL CHECK (capacity > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('lecture', 'lab')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Student Groups table
CREATE TABLE IF NOT EXISTS student_groups (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  size INT NOT NULL CHECK (size > 0),
  year INT NOT NULL CHECK (year >= 1 AND year <= 3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  lecturer_id VARCHAR(36) NOT NULL,
  group_id VARCHAR(36) NOT NULL,
  weekly_hours INT NOT NULL CHECK (weekly_hours > 0),
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('lecture', 'lab')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_lecturer FOREIGN KEY (lecturer_id) 
    REFERENCES lecturers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_course_group FOREIGN KEY (group_id) 
    REFERENCES student_groups(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Assignments (timetable slots) table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  day INT NOT NULL CHECK (day >= 1 AND day <= 5),
  period INT NOT NULL CHECK (period >= 1 AND period <= 8),
  classroom_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignment_course FOREIGN KEY (course_id) 
    REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_assignment_classroom FOREIGN KEY (classroom_id) 
    REFERENCES classrooms(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Conflicts table for tracking detected issues
CREATE TABLE IF NOT EXISTS conflicts (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  assignment_ids LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes for better query performance
CREATE INDEX idx_lecturer_availability_lecturer_id ON lecturer_availability(lecturer_id);
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX idx_courses_group_id ON courses(group_id);
CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX idx_assignments_day_period ON assignments(day, period);

-- Create View for assignment details (for easier querying)
CREATE OR REPLACE VIEW assignment_details AS
SELECT 
  a.id as assignment_id,
  a.day,
  a.period,
  c.id as course_id,
  c.code as course_code,
  c.title as course_title,
  l.id as lecturer_id,
  l.name as lecturer_name,
  sg.id as group_id,
  sg.name as group_name,
  cr.id as classroom_id,
  cr.name as classroom_name,
  cr.capacity,
  sg.size
FROM assignments a
JOIN courses c ON a.course_id = c.id
JOIN lecturers l ON c.lecturer_id = l.id
JOIN student_groups sg ON c.group_id = sg.id
JOIN classrooms cr ON a.classroom_id = cr.id;
