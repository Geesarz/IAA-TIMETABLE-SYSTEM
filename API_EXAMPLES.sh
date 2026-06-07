#!/bin/bash

# API Testing Examples
# Replace BASE_URL with your actual API endpoint

BASE_URL="http://localhost:5173/api"

echo "=== Class Harmony API Testing Examples ==="
echo ""

# Health Check
echo "1. Health Check:"
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Create a Lecturer
echo "2. Create Lecturer:"
curl -X POST "$BASE_URL/lecturers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Alice Smith",
    "email": "alice.smith@university.edu",
    "department": "Computer Science",
    "availability": [
      {"day": 1, "period": 2},
      {"day": 3, "period": 3},
      {"day": 5, "period": 1}
    ]
  }'
echo ""
echo ""

# Get All Lecturers
echo "3. Get All Lecturers:"
curl -X GET "$BASE_URL/lecturers" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Create a Classroom
echo "4. Create Classroom:"
curl -X POST "$BASE_URL/classrooms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A101",
    "capacity": 150,
    "type": "lecture"
  }'
echo ""
echo ""

# Get All Classrooms
echo "5. Get All Classrooms:"
curl -X GET "$BASE_URL/classrooms" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Create a Student Group
echo "6. Create Student Group:"
curl -X POST "$BASE_URL/groups" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CS Year 1 Group A",
    "size": 85,
    "year": 1
  }'
echo ""
echo ""

# Get All Student Groups
echo "7. Get All Student Groups:"
curl -X GET "$BASE_URL/groups" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Create a Course
# Note: Replace lecturer_id and group_id with actual UUIDs from previous requests
echo "8. Create Course (Update IDs as needed):"
echo "LECTURER_ID=\"your-lecturer-uuid\""
echo "GROUP_ID=\"your-group-uuid\""
echo ""
echo "curl -X POST \"$BASE_URL/courses\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"code\": \"CS101\","
echo "    \"title\": \"Introduction to Programming\","
echo "    \"lecturerId\": \"LECTURER_ID\","
echo "    \"groupId\": \"GROUP_ID\","
echo "    \"weeklyHours\": 4,"
echo "    \"roomType\": \"lecture\""
echo "  }'"
echo ""
echo ""

# Get All Courses
echo "9. Get All Courses:"
curl -X GET "$BASE_URL/courses" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Get All Assignments
echo "10. Get All Assignments (Timetable):"
curl -X GET "$BASE_URL/assignments" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Get Conflicts
echo "11. Get Conflicts:"
curl -X GET "$BASE_URL/conflicts" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Load Seed Data
echo "12. Load Seed Data:"
curl -X POST "$BASE_URL/seed" \
  -H "Content-Type: application/json"
echo ""
echo ""

echo "=== End of Examples ==="
echo ""
echo "Notes:"
echo "- Replace 'localhost:5173' with your actual API URL"
echo "- Replace UUIDs with actual values from your database"
echo "- Days: 1=Monday, 2=Tuesday, ..., 5=Friday"
echo "- Periods: 1-8 (see PERIOD_LABELS in types/timetable.ts)"
