import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Assignment,
  Classroom,
  Course,
  Lecturer,
  StudentGroup,
} from "@/types/timetable";
import { seedClassrooms, seedCourses, seedGroups, seedLecturers } from "@/lib/seed";

const uid = () => Math.random().toString(36).slice(2, 10);

interface State {
  lecturers: Lecturer[];
  classrooms: Classroom[];
  groups: StudentGroup[];
  courses: Course[];
  assignments: Assignment[];

  addLecturer: (l: Omit<Lecturer, "id">) => void;
  updateLecturer: (id: string, l: Partial<Lecturer>) => void;
  removeLecturer: (id: string) => void;

  addClassroom: (r: Omit<Classroom, "id">) => void;
  updateClassroom: (id: string, r: Partial<Classroom>) => void;
  removeClassroom: (id: string) => void;

  addGroup: (g: Omit<StudentGroup, "id">) => void;
  updateGroup: (id: string, g: Partial<StudentGroup>) => void;
  removeGroup: (id: string) => void;

  addCourse: (c: Omit<Course, "id">) => void;
  updateCourse: (id: string, c: Partial<Course>) => void;
  removeCourse: (id: string) => void;

  setAssignments: (a: Assignment[]) => void;
  clearAssignments: () => void;

  loadSeed: () => void;
  resetAll: () => void;
}

export const useTimetableStore = create<State>()(
  persist(
    (set) => ({
      lecturers: seedLecturers,
      classrooms: seedClassrooms,
      groups: seedGroups,
      courses: seedCourses,
      assignments: [],

      addLecturer: (l) => set((s) => ({ lecturers: [...s.lecturers, { ...l, id: uid() }] })),
      updateLecturer: (id, l) => set((s) => ({ lecturers: s.lecturers.map((x) => (x.id === id ? { ...x, ...l } : x)) })),
      removeLecturer: (id) => set((s) => ({ lecturers: s.lecturers.filter((x) => x.id !== id) })),

      addClassroom: (r) => set((s) => ({ classrooms: [...s.classrooms, { ...r, id: uid() }] })),
      updateClassroom: (id, r) => set((s) => ({ classrooms: s.classrooms.map((x) => (x.id === id ? { ...x, ...r } : x)) })),
      removeClassroom: (id) => set((s) => ({ classrooms: s.classrooms.filter((x) => x.id !== id) })),

      addGroup: (g) => set((s) => ({ groups: [...s.groups, { ...g, id: uid() }] })),
      updateGroup: (id, g) => set((s) => ({ groups: s.groups.map((x) => (x.id === id ? { ...x, ...g } : x)) })),
      removeGroup: (id) => set((s) => ({ groups: s.groups.filter((x) => x.id !== id) })),

      addCourse: (c) => set((s) => ({ courses: [...s.courses, { ...c, id: uid() }] })),
      updateCourse: (id, c) => set((s) => ({ courses: s.courses.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCourse: (id) => set((s) => ({ courses: s.courses.filter((x) => x.id !== id) })),

      setAssignments: (a) => set({ assignments: a }),
      clearAssignments: () => set({ assignments: [] }),

      loadSeed: () =>
        set({
          lecturers: seedLecturers,
          classrooms: seedClassrooms,
          groups: seedGroups,
          courses: seedCourses,
          assignments: [],
        }),
      resetAll: () =>
        set({ lecturers: [], classrooms: [], groups: [], courses: [], assignments: [] }),
    }),
    {
      name: "timetable-store",
      version: 2,
      migrate: (state: any, version) => {
        if (state && Array.isArray(state.groups)) {
          state.groups = state.groups.map((g: any) => ({
            ...g,
            year: g.year === 1 || g.year === 2 || g.year === 3 ? g.year : 1,
          }));
        }
        return state;
      },
    },
  ),
);