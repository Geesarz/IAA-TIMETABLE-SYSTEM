import type { Lecturer, Classroom, StudentGroup, Course } from "@/types/timetable";

export const seedLecturers: Lecturer[] = [
  { id: "l1", name: "Dr. Ada Lovelace", email: "ada@uni.edu", department: "Computer Science", availability: [] },
  { id: "l2", name: "Prof. Alan Turing", email: "alan@uni.edu", department: "Computer Science", availability: [] },
  { id: "l3", name: "Dr. Marie Curie", email: "marie@uni.edu", department: "Physics", availability: [] },
  { id: "l4", name: "Dr. Carl Gauss", email: "gauss@uni.edu", department: "Mathematics", availability: [] },
];

export const seedClassrooms: Classroom[] = [
  { id: "r1", name: "Room A101", capacity: 60, type: "lecture" },
  { id: "r2", name: "Room A102", capacity: 40, type: "lecture" },
  { id: "r3", name: "Lab B201", capacity: 30, type: "lab" },
  { id: "r4", name: "Lab B202", capacity: 25, type: "lab" },
];

export const seedGroups: StudentGroup[] = [
  { id: "g1", name: "CS Year 1", size: 50, year: 1 },
  { id: "g2", name: "CS Year 2", size: 40, year: 2 },
  { id: "g3", name: "Physics Year 1", size: 30, year: 1 },
  { id: "g4", name: "Math Year 1", size: 35, year: 1 },
  { id: "g5", name: "CS Year 3", size: 35, year: 3 },
  { id: "g6", name: "Physics Year 2", size: 28, year: 2 },
];

export const seedCourses: Course[] = [
  { id: "c1", code: "CS101", title: "Intro to Programming", lecturerId: "l1", groupId: "g1", weeklyHours: 3, roomType: "lecture" },
  { id: "c2", code: "CS102", title: "Programming Lab",      lecturerId: "l1", groupId: "g1", weeklyHours: 2, roomType: "lab" },
  { id: "c3", code: "CS201", title: "Algorithms",           lecturerId: "l2", groupId: "g2", weeklyHours: 3, roomType: "lecture" },
  { id: "c4", code: "CS202", title: "Operating Systems",    lecturerId: "l2", groupId: "g2", weeklyHours: 2, roomType: "lecture" },
  { id: "c5", code: "PH101", title: "Classical Mechanics",  lecturerId: "l3", groupId: "g3", weeklyHours: 3, roomType: "lecture" },
  { id: "c6", code: "PH102", title: "Physics Lab",          lecturerId: "l3", groupId: "g3", weeklyHours: 2, roomType: "lab" },
  { id: "c7", code: "MA101", title: "Calculus I",           lecturerId: "l4", groupId: "g4", weeklyHours: 3, roomType: "lecture" },
  { id: "c8", code: "MA102", title: "Linear Algebra",       lecturerId: "l4", groupId: "g1", weeklyHours: 2, roomType: "lecture" },
  { id: "c9",  code: "CS301", title: "Databases",            lecturerId: "l2", groupId: "g5", weeklyHours: 3, roomType: "lecture" },
  { id: "c10", code: "CS302", title: "Software Engineering", lecturerId: "l1", groupId: "g5", weeklyHours: 2, roomType: "lecture" },
  { id: "c11", code: "PH201", title: "Electromagnetism",     lecturerId: "l3", groupId: "g6", weeklyHours: 3, roomType: "lecture" },
];