from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import delete, func
from datetime import datetime
from typing import List
import uuid

from config import settings
from database import get_db, engine, Base
from models import (
    Lecturer, LecturerAvailability, Classroom, StudentGroup, 
    Course, Assignment
)
from schemas import (
    LecturerCreate, LecturerUpdate, LecturerResponse,
    ClassroomCreate, ClassroomUpdate, ClassroomResponse,
    StudentGroupCreate, StudentGroupUpdate, StudentGroupResponse,
    CourseCreate, CourseUpdate, CourseResponse,
    AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    ConflictResponse, HealthResponse, LecturerAvailabilitySchema
)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_id() -> str:
    """Generate a UUID string for database IDs"""
    return str(uuid.uuid4())

# ============================================
# HEALTH CHECK
# ============================================
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow(),
        database="MySQL"
    )

# ============================================
# LECTURERS ENDPOINTS
# ============================================
@app.get("/api/lecturers", response_model=List[LecturerResponse])
async def get_lecturers(db: Session = Depends(get_db)):
    """Get all lecturers with their availability"""
    lecturers = db.query(Lecturer).order_by(Lecturer.name).all()
    result = []
    for lecturer in lecturers:
        availability = [
            {"day": a.day, "period": a.period}
            for a in lecturer.availability
        ]
        result.append(LecturerResponse(
            id=lecturer.id,
            name=lecturer.name,
            email=lecturer.email,
            department=lecturer.department,
            availability=availability,
            created_at=lecturer.created_at,
            updated_at=lecturer.updated_at
        ))
    return result

@app.post("/api/lecturers", response_model=LecturerResponse, status_code=201)
async def create_lecturer(lecturer: LecturerCreate, db: Session = Depends(get_db)):
    """Create a new lecturer"""
    lecturer_id = generate_id()
    
    db_lecturer = Lecturer(
        id=lecturer_id,
        name=lecturer.name,
        email=lecturer.email,
        department=lecturer.department
    )
    db.add(db_lecturer)
    
    if lecturer.availability:
        for slot in lecturer.availability:
            db.add(LecturerAvailability(
                id=generate_id(),
                lecturer_id=lecturer_id,
                day=slot.day,
                period=slot.period
            ))
    
    db.commit()
    db.refresh(db_lecturer)
    
    availability = [
        {"day": a.day, "period": a.period}
        for a in db_lecturer.availability
    ]
    return LecturerResponse(
        id=db_lecturer.id,
        name=db_lecturer.name,
        email=db_lecturer.email,
        department=db_lecturer.department,
        availability=availability,
        created_at=db_lecturer.created_at,
        updated_at=db_lecturer.updated_at
    )

@app.put("/api/lecturers/{lecturer_id}", response_model=LecturerResponse)
async def update_lecturer(lecturer_id: str, lecturer: LecturerUpdate, db: Session = Depends(get_db)):
    """Update a lecturer"""
    db_lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id).first()
    if not db_lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    
    if lecturer.name:
        db_lecturer.name = lecturer.name
    if lecturer.email:
        db_lecturer.email = lecturer.email
    if lecturer.department:
        db_lecturer.department = lecturer.department
    
    if lecturer.availability is not None:
        db.query(LecturerAvailability).filter(
            LecturerAvailability.lecturer_id == lecturer_id
        ).delete()
        
        for slot in lecturer.availability:
            db.add(LecturerAvailability(
                id=generate_id(),
                lecturer_id=lecturer_id,
                day=slot.day,
                period=slot.period
            ))
    
    db.commit()
    db.refresh(db_lecturer)
    
    availability = [
        {"day": a.day, "period": a.period}
        for a in db_lecturer.availability
    ]
    return LecturerResponse(
        id=db_lecturer.id,
        name=db_lecturer.name,
        email=db_lecturer.email,
        department=db_lecturer.department,
        availability=availability,
        created_at=db_lecturer.created_at,
        updated_at=db_lecturer.updated_at
    )

@app.delete("/api/lecturers/{lecturer_id}")
async def delete_lecturer(lecturer_id: str, db: Session = Depends(get_db)):
    """Delete a lecturer"""
    db_lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id).first()
    if not db_lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    
    db.delete(db_lecturer)
    db.commit()
    return {"message": "Lecturer deleted successfully"}

# ============================================
# CLASSROOMS ENDPOINTS
# ============================================
@app.get("/api/classrooms", response_model=List[ClassroomResponse])
async def get_classrooms(db: Session = Depends(get_db)):
    """Get all classrooms"""
    classrooms = db.query(Classroom).order_by(Classroom.name).all()
    return classrooms

@app.post("/api/classrooms", response_model=ClassroomResponse, status_code=201)
async def create_classroom(classroom: ClassroomCreate, db: Session = Depends(get_db)):
    """Create a new classroom"""
    db_classroom = Classroom(
        id=generate_id(),
        name=classroom.name,
        capacity=classroom.capacity,
        type=classroom.type
    )
    db.add(db_classroom)
    db.commit()
    db.refresh(db_classroom)
    return db_classroom

@app.put("/api/classrooms/{classroom_id}", response_model=ClassroomResponse)
async def update_classroom(classroom_id: str, classroom: ClassroomUpdate, db: Session = Depends(get_db)):
    """Update a classroom"""
    db_classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not db_classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    if classroom.name:
        db_classroom.name = classroom.name
    if classroom.capacity is not None:
        db_classroom.capacity = classroom.capacity
    if classroom.type:
        db_classroom.type = classroom.type
    
    db.commit()
    db.refresh(db_classroom)
    return db_classroom

@app.delete("/api/classrooms/{classroom_id}")
async def delete_classroom(classroom_id: str, db: Session = Depends(get_db)):
    """Delete a classroom"""
    db_classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not db_classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    db.delete(db_classroom)
    db.commit()
    return {"message": "Classroom deleted successfully"}

# ============================================
# STUDENT GROUPS ENDPOINTS
# ============================================
@app.get("/api/groups", response_model=List[StudentGroupResponse])
async def get_groups(db: Session = Depends(get_db)):
    """Get all student groups"""
    groups = db.query(StudentGroup).order_by(StudentGroup.name).all()
    return groups

@app.post("/api/groups", response_model=StudentGroupResponse, status_code=201)
async def create_group(group: StudentGroupCreate, db: Session = Depends(get_db)):
    """Create a new student group"""
    db_group = StudentGroup(
        id=generate_id(),
        name=group.name,
        size=group.size,
        year=group.year
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.put("/api/groups/{group_id}", response_model=StudentGroupResponse)
async def update_group(group_id: str, group: StudentGroupUpdate, db: Session = Depends(get_db)):
    """Update a student group"""
    db_group = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group.name:
        db_group.name = group.name
    if group.size is not None:
        db_group.size = group.size
    if group.year is not None:
        db_group.year = group.year
    
    db.commit()
    db.refresh(db_group)
    return db_group

@app.delete("/api/groups/{group_id}")
async def delete_group(group_id: str, db: Session = Depends(get_db)):
    """Delete a student group"""
    db_group = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(db_group)
    db.commit()
    return {"message": "Group deleted successfully"}

# ============================================
# COURSES ENDPOINTS
# ============================================
@app.get("/api/courses", response_model=List[CourseResponse])
async def get_courses(db: Session = Depends(get_db)):
    """Get all courses"""
    courses = db.query(Course).order_by(Course.code).all()
    result = []
    for course in courses:
        result.append(CourseResponse(
            id=course.id,
            code=course.code,
            title=course.title,
            lecturerId=course.lecturer_id,
            groupId=course.group_id,
            weeklyHours=course.weekly_hours,
            roomType=course.room_type,
            created_at=course.created_at,
            updated_at=course.updated_at
        ))
    return result

@app.post("/api/courses", response_model=CourseResponse, status_code=201)
async def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    """Create a new course"""
    db_course = Course(
        id=generate_id(),
        code=course.code,
        title=course.title,
        lecturer_id=course.lecturerId,
        group_id=course.groupId,
        weekly_hours=course.weeklyHours,
        room_type=course.roomType
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return CourseResponse(
        id=db_course.id,
        code=db_course.code,
        title=db_course.title,
        lecturerId=db_course.lecturer_id,
        groupId=db_course.group_id,
        weeklyHours=db_course.weekly_hours,
        roomType=db_course.room_type,
        created_at=db_course.created_at,
        updated_at=db_course.updated_at
    )

@app.put("/api/courses/{course_id}", response_model=CourseResponse)
async def update_course(course_id: str, course: CourseUpdate, db: Session = Depends(get_db)):
    """Update a course"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.code:
        db_course.code = course.code
    if course.title:
        db_course.title = course.title
    if course.lecturerId:
        db_course.lecturer_id = course.lecturerId
    if course.groupId:
        db_course.group_id = course.groupId
    if course.weeklyHours is not None:
        db_course.weekly_hours = course.weeklyHours
    if course.roomType:
        db_course.room_type = course.roomType
    
    db.commit()
    db.refresh(db_course)
    
    return CourseResponse(
        id=db_course.id,
        code=db_course.code,
        title=db_course.title,
        lecturerId=db_course.lecturer_id,
        groupId=db_course.group_id,
        weeklyHours=db_course.weekly_hours,
        roomType=db_course.room_type,
        created_at=db_course.created_at,
        updated_at=db_course.updated_at
    )

@app.delete("/api/courses/{course_id}")
async def delete_course(course_id: str, db: Session = Depends(get_db)):
    """Delete a course"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

# ============================================
# ASSIGNMENTS ENDPOINTS
# ============================================
@app.get("/api/assignments", response_model=List[AssignmentResponse])
async def get_assignments(db: Session = Depends(get_db)):
    """Get all assignments"""
    assignments = db.query(Assignment).all()
    result = []
    for assignment in assignments:
        result.append(AssignmentResponse(
            id=assignment.id,
            courseId=assignment.course_id,
            day=assignment.day,
            period=assignment.period,
            classroomId=assignment.classroom_id,
            created_at=assignment.created_at,
            updated_at=assignment.updated_at
        ))
    return result

@app.post("/api/assignments", response_model=AssignmentResponse, status_code=201)
async def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    """Create a new assignment"""
    db_assignment = Assignment(
        id=generate_id(),
        course_id=assignment.courseId,
        day=assignment.day,
        period=assignment.period,
        classroom_id=assignment.classroomId
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    return AssignmentResponse(
        id=db_assignment.id,
        courseId=db_assignment.course_id,
        day=db_assignment.day,
        period=db_assignment.period,
        classroomId=db_assignment.classroom_id,
        created_at=db_assignment.created_at,
        updated_at=db_assignment.updated_at
    )

@app.post("/api/assignments/batch", response_model=dict, status_code=201)
async def batch_create_assignments(assignments: List[AssignmentCreate], db: Session = Depends(get_db)):
    """Create multiple assignments at once"""
    # Delete all existing assignments
    db.query(Assignment).delete()
    
    # Create new assignments
    new_assignments = []
    for assignment in assignments:
        db_assignment = Assignment(
            id=generate_id(),
            course_id=assignment.courseId,
            day=assignment.day,
            period=assignment.period,
            classroom_id=assignment.classroomId
        )
        db.add(db_assignment)
        new_assignments.append(db_assignment)
    
    db.commit()
    return {"message": "Assignments created", "count": len(new_assignments)}

@app.delete("/api/assignments/{assignment_id}")
async def delete_assignment(assignment_id: str, db: Session = Depends(get_db)):
    """Delete an assignment"""
    db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(db_assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}

@app.delete("/api/assignments")
async def delete_all_assignments(db: Session = Depends(get_db)):
    """Delete all assignments"""
    db.query(Assignment).delete()
    db.commit()
    return {"message": "All assignments cleared successfully"}

# ============================================
# CONFLICTS DETECTION
# ============================================
def detect_conflicts(db: Session) -> List[ConflictResponse]:
    """Detect scheduling conflicts"""
    conflicts = []
    
    # Get all assignments with details
    assignments = db.query(Assignment).all()
    
    # Check for lecturer double-booking
    lecturer_slots = {}
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        lecturer = db.query(Lecturer).filter(Lecturer.id == course.lecturer_id).first()
        
        key = f"{course.lecturer_id}-{assignment.day}-{assignment.period}"
        if key not in lecturer_slots:
            lecturer_slots[key] = []
        lecturer_slots[key].append(assignment)
    
    for key, slots in lecturer_slots.items():
        if len(slots) > 1:
            course = db.query(Course).filter(Course.id == slots[0].course_id).first()
            lecturer = db.query(Lecturer).filter(Lecturer.id == course.lecturer_id).first()
            conflicts.append(ConflictResponse(
                type="lecturer-double-booked",
                message=f"Lecturer {lecturer.name} is assigned to multiple courses at the same time",
                assignmentIds=[a.id for a in slots]
            ))
    
    # Check for classroom double-booking
    classroom_slots = {}
    for assignment in assignments:
        key = f"{assignment.classroom_id}-{assignment.day}-{assignment.period}"
        if key not in classroom_slots:
            classroom_slots[key] = []
        classroom_slots[key].append(assignment)
    
    for key, slots in classroom_slots.items():
        if len(slots) > 1:
            classroom = db.query(Classroom).filter(Classroom.id == slots[0].classroom_id).first()
            conflicts.append(ConflictResponse(
                type="classroom-double-booked",
                message=f"Classroom {classroom.name} is assigned to multiple courses at the same time",
                assignmentIds=[a.id for a in slots]
            ))
    
    # Check for group double-booking
    group_slots = {}
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        key = f"{course.group_id}-{assignment.day}-{assignment.period}"
        if key not in group_slots:
            group_slots[key] = []
        group_slots[key].append(assignment)
    
    for key, slots in group_slots.items():
        if len(slots) > 1:
            course = db.query(Course).filter(Course.id == slots[0].course_id).first()
            group = db.query(StudentGroup).filter(StudentGroup.id == course.group_id).first()
            conflicts.append(ConflictResponse(
                type="group-double-booked",
                message=f"Student group {group.name} is assigned to multiple courses at the same time",
                assignmentIds=[a.id for a in slots]
            ))
    
    # Check for room too small
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        group = db.query(StudentGroup).filter(StudentGroup.id == course.group_id).first()
        classroom = db.query(Classroom).filter(Classroom.id == assignment.classroom_id).first()
        
        if classroom.capacity < group.size:
            conflicts.append(ConflictResponse(
                type="room-too-small",
                message=f"Classroom {classroom.name} (capacity: {classroom.capacity}) is too small for group {group.name} (size: {group.size})",
                assignmentIds=[assignment.id]
            ))
    
    # Check for room type mismatch
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        classroom = db.query(Classroom).filter(Classroom.id == assignment.classroom_id).first()
        
        if course.room_type != classroom.type:
            conflicts.append(ConflictResponse(
                type="room-type-mismatch",
                message=f"Course {course.code} requires {course.room_type} room but assigned to {classroom.type} room",
                assignmentIds=[assignment.id]
            ))
    
    # Check for lecturer unavailability
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        lecturer = db.query(Lecturer).filter(Lecturer.id == course.lecturer_id).first()
        
        availability = db.query(LecturerAvailability).filter(
            LecturerAvailability.lecturer_id == course.lecturer_id,
            LecturerAvailability.day == assignment.day,
            LecturerAvailability.period == assignment.period
        ).first()
        
        if not availability:
            has_any_availability = db.query(LecturerAvailability).filter(
                LecturerAvailability.lecturer_id == course.lecturer_id
            ).first()
            
            if has_any_availability:
                conflicts.append(ConflictResponse(
                    type="lecturer-unavailable",
                    message=f"Lecturer {lecturer.name} is not available at day {assignment.day} period {assignment.period}",
                    assignmentIds=[assignment.id]
                ))
    
    return conflicts

@app.get("/api/conflicts", response_model=List[ConflictResponse])
async def get_conflicts(db: Session = Depends(get_db)):
    """Get detected conflicts"""
    return detect_conflicts(db)

# ============================================
# SEED DATA ENDPOINT
# ============================================
@app.post("/api/seed", status_code=201)
async def seed_data(db: Session = Depends(get_db)):
    """Load sample data into the database"""
    
    # Clear existing data
    db.query(Assignment).delete()
    db.query(Course).delete()
    db.query(StudentGroup).delete()
    db.query(Classroom).delete()
    db.query(LecturerAvailability).delete()
    db.query(Lecturer).delete()
    
    # Create seed lecturers
    lecturers_data = [
        {"name": "Dr. Sarah Johnson", "email": "sarah.johnson@uni.edu", "department": "Computer Science"},
        {"name": "Prof. Ahmed Hassan", "email": "ahmed.hassan@uni.edu", "department": "Mathematics"},
        {"name": "Dr. Emily Chen", "email": "emily.chen@uni.edu", "department": "Computer Science"},
        {"name": "Dr. Michael Brown", "email": "michael.brown@uni.edu", "department": "Physics"},
        {"name": "Prof. Lisa Anderson", "email": "lisa.anderson@uni.edu", "department": "Chemistry"},
    ]
    
    lecturer_ids = []
    for lecturer_data in lecturers_data:
        lecturer = Lecturer(
            id=generate_id(),
            name=lecturer_data["name"],
            email=lecturer_data["email"],
            department=lecturer_data["department"]
        )
        db.add(lecturer)
        lecturer_ids.append(lecturer.id)
    
    db.flush()
    
    # Create seed classrooms
    classrooms_data = [
        {"name": "Lecture Hall A", "capacity": 200, "type": "lecture"},
        {"name": "Lecture Hall B", "capacity": 150, "type": "lecture"},
        {"name": "Lab Room 101", "capacity": 40, "type": "lab"},
        {"name": "Lab Room 102", "capacity": 40, "type": "lab"},
        {"name": "Seminar Room C", "capacity": 60, "type": "lecture"},
    ]
    
    classroom_ids = []
    for classroom_data in classrooms_data:
        classroom = Classroom(
            id=generate_id(),
            name=classroom_data["name"],
            capacity=classroom_data["capacity"],
            type=classroom_data["type"]
        )
        db.add(classroom)
        classroom_ids.append(classroom.id)
    
    db.flush()
    
    # Create seed student groups
    groups_data = [
        {"name": "CS-Year1-Group-A", "size": 80, "year": 1},
        {"name": "CS-Year2-Group-A", "size": 75, "year": 2},
        {"name": "CS-Year3-Group-A", "size": 70, "year": 3},
        {"name": "Math-Year1-Group-A", "size": 65, "year": 1},
        {"name": "Physics-Year2-Group-A", "size": 60, "year": 2},
    ]
    
    group_ids = []
    for group_data in groups_data:
        group = StudentGroup(
            id=generate_id(),
            name=group_data["name"],
            size=group_data["size"],
            year=group_data["year"]
        )
        db.add(group)
        group_ids.append(group.id)
    
    db.flush()
    
    # Create seed courses
    courses_data = [
        {"code": "CS101", "title": "Introduction to Programming", "lecturer_idx": 0, "group_idx": 0, "weekly_hours": 4, "room_type": "lecture"},
        {"code": "CS201", "title": "Data Structures", "lecturer_idx": 2, "group_idx": 1, "weekly_hours": 4, "room_type": "lecture"},
        {"code": "CS301", "title": "Advanced Algorithms", "lecturer_idx": 0, "group_idx": 2, "weekly_hours": 3, "room_type": "lecture"},
        {"code": "MATH101", "title": "Calculus I", "lecturer_idx": 1, "group_idx": 3, "weekly_hours": 4, "room_type": "lecture"},
        {"code": "PHYS201", "title": "Classical Mechanics", "lecturer_idx": 3, "group_idx": 4, "weekly_hours": 4, "room_type": "lecture"},
    ]
    
    for course_data in courses_data:
        course = Course(
            id=generate_id(),
            code=course_data["code"],
            title=course_data["title"],
            lecturer_id=lecturer_ids[course_data["lecturer_idx"]],
            group_id=group_ids[course_data["group_idx"]],
            weekly_hours=course_data["weekly_hours"],
            room_type=course_data["room_type"]
        )
        db.add(course)
    
    db.commit()
    return {"message": "Seed data loaded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
