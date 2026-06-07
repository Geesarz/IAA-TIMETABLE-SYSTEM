from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Lecturer Schemas
class LecturerAvailabilitySchema(BaseModel):
    day: int
    period: int

class LecturerCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    availability: Optional[List[LecturerAvailabilitySchema]] = None

class LecturerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    availability: Optional[List[LecturerAvailabilitySchema]] = None

class LecturerResponse(BaseModel):
    id: str
    name: str
    email: str
    department: str
    availability: List[LecturerAvailabilitySchema] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Classroom Schemas
class ClassroomCreate(BaseModel):
    name: str
    capacity: int
    type: str  # 'lecture' or 'lab'

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    type: Optional[str] = None

class ClassroomResponse(BaseModel):
    id: str
    name: str
    capacity: int
    type: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Student Group Schemas
class StudentGroupCreate(BaseModel):
    name: str
    size: int
    year: int

class StudentGroupUpdate(BaseModel):
    name: Optional[str] = None
    size: Optional[int] = None
    year: Optional[int] = None

class StudentGroupResponse(BaseModel):
    id: str
    name: str
    size: int
    year: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Course Schemas
class CourseCreate(BaseModel):
    code: str
    title: str
    lecturerId: str
    groupId: str
    weeklyHours: int
    roomType: str  # 'lecture' or 'lab'

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    lecturerId: Optional[str] = None
    groupId: Optional[str] = None
    weeklyHours: Optional[int] = None
    roomType: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    code: str
    title: str
    lecturerId: str
    groupId: str
    weeklyHours: int
    roomType: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentCreate(BaseModel):
    courseId: str
    day: int
    period: int
    classroomId: str

class AssignmentUpdate(BaseModel):
    courseId: Optional[str] = None
    day: Optional[int] = None
    period: Optional[int] = None
    classroomId: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: str
    courseId: str
    day: int
    period: int
    classroomId: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Conflict Schemas
class ConflictResponse(BaseModel):
    type: str
    message: str
    assignmentIds: List[str]

# Health Check
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str = "MySQL"
    version: str = "1.0.0"
