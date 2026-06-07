export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const PERIOD_LABELS: Record<number, string> = {
  1: "08:00–09:00",
  2: "09:00–10:00",
  3: "10:00–11:00",
  4: "11:00–12:00",
  5: "13:00–14:00",
  6: "14:00–15:00",
  7: "15:00–16:00",
  8: "16:00–17:00",
};

export type Day = 1 | 2 | 3 | 4 | 5;
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type RoomType = "lecture" | "lab";

export interface Slot {
  day: Day;
  period: Period;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  /** Slots when the lecturer is AVAILABLE. Empty = available everywhere. */
  availability: Slot[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
}

export interface StudentGroup {
  id: string;
  name: string;
  size: number;
  year: 1 | 2 | 3;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  lecturerId: string;
  groupId: string;
  weeklyHours: number;
  roomType: RoomType;
}

export interface Assignment {
  id: string;
  courseId: string;
  day: Day;
  period: Period;
  classroomId: string;
}

export type ConflictType =
  | "lecturer-double-booked"
  | "classroom-double-booked"
  | "group-double-booked"
  | "lecturer-unavailable"
  | "room-too-small"
  | "room-type-mismatch";

export interface Conflict {
  type: ConflictType;
  message: string;
  assignmentIds: string[];
}