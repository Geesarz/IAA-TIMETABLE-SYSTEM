from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
import enum

class Lecturer(Base):
    __tablename__ = "lecturers"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    department = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    availability = relationship("LecturerAvailability", back_populates="lecturer", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="lecturer")
    
    __table_args__ = (
        Index('idx_lecturer_email', 'email'),
    )

class LecturerAvailability(Base):
    __tablename__ = "lecturer_availability"
    
    id = Column(String(36), primary_key=True)
    lecturer_id = Column(String(36), ForeignKey("lecturers.id", ondelete="CASCADE"), nullable=False)
    day = Column(Integer, nullable=False)  # 1-5 (Mon-Fri)
    period = Column(Integer, nullable=False)  # 1-8
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lecturer = relationship("Lecturer", back_populates="availability")
    
    __table_args__ = (
        Index('idx_availability_lecturer', 'lecturer_id'),
    )

class Classroom(Base):
    __tablename__ = "classrooms"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False)  # 'lecture' or 'lab'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assignments = relationship("Assignment", back_populates="classroom")

class StudentGroup(Base):
    __tablename__ = "student_groups"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)  # 1, 2, 3
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    courses = relationship("Course", back_populates="group")
    
    __table_args__ = (
        Index('idx_group_year', 'year'),
    )

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String(36), primary_key=True)
    code = Column(String(50), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    lecturer_id = Column(String(36), ForeignKey("lecturers.id", ondelete="RESTRICT"), nullable=False)
    group_id = Column(String(36), ForeignKey("student_groups.id", ondelete="RESTRICT"), nullable=False)
    weekly_hours = Column(Integer, nullable=False)
    room_type = Column(String(50), nullable=False)  # 'lecture' or 'lab'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    lecturer = relationship("Lecturer", back_populates="courses")
    group = relationship("StudentGroup", back_populates="courses")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_course_code', 'code'),
        Index('idx_course_lecturer', 'lecturer_id'),
        Index('idx_course_group', 'group_id'),
    )

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(String(36), primary_key=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    day = Column(Integer, nullable=False)  # 1-5
    period = Column(Integer, nullable=False)  # 1-8
    classroom_id = Column(String(36), ForeignKey("classrooms.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    course = relationship("Course", back_populates="assignments")
    classroom = relationship("Classroom", back_populates="assignments")
    
    __table_args__ = (
        Index('idx_assignment_course', 'course_id'),
        Index('idx_assignment_classroom', 'classroom_id'),
        Index('idx_assignment_slot', 'day', 'period'),
    )
