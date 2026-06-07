import type { Assignment, Classroom, Course, Day, Lecturer, Period, StudentGroup } from "@/types/timetable";
import { DAYS, PERIODS } from "@/types/timetable";

export interface SolveResult {
  assignments: Assignment[];
  unassigned: { courseId: string; remaining: number }[];
}

/**
 * Backtracking scheduler with MRV heuristic.
 * Treats each "hour" of a course as a unit to place.
 */
export function generateSchedule(
  courses: Course[],
  lecturers: Lecturer[],
  classrooms: Classroom[],
  groups: StudentGroup[],
  preBooked: Assignment[] = [],
  allCourses: Course[] = courses,
): SolveResult {
  const lecMap = new Map(lecturers.map((l) => [l.id, l]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  // Build unit list: one per hour required
  type Unit = { courseId: string; index: number };
  const units: Unit[] = [];
  for (const c of courses) {
    for (let i = 0; i < c.weeklyHours; i++) units.push({ courseId: c.id, index: i });
  }

  // Order units by most constrained: fewer eligible rooms / fewer lecturer slots first
  const eligibleRooms = new Map<string, Classroom[]>();
  for (const c of courses) {
    const grp = groupMap.get(c.groupId);
    eligibleRooms.set(
      c.id,
      classrooms.filter((r) => r.type === c.roomType && (!grp || r.capacity >= grp.size)),
    );
  }
  units.sort((a, b) => {
    const ca = courses.find((c) => c.id === a.courseId)!;
    const cb = courses.find((c) => c.id === b.courseId)!;
    const ga = groupMap.get(ca.groupId);
    const gb = groupMap.get(cb.groupId);
    const ya = ga?.year ?? 99;
    const yb = gb?.year ?? 99;
    if (ya !== yb) return ya - yb;
    const ra = eligibleRooms.get(ca.id)!.length;
    const rb = eligibleRooms.get(cb.id)!.length;
    if (ra !== rb) return ra - rb;
    return cb.weeklyHours - ca.weeklyHours;
  });

  // Booking maps
  const lecBusy = new Set<string>(); // lecturerId|day|period
  const roomBusy = new Set<string>(); // roomId|day|period
  const groupBusy = new Set<string>(); // groupId|day|period
  const courseDayCount = new Map<string, number>(); // courseId|day -> count (avoid same course twice/day if possible)

  // Seed busy sets with pre-existing assignments (e.g. from other years)
  const allCourseMap = new Map(allCourses.map((c) => [c.id, c]));
  for (const a of preBooked) {
    const c = allCourseMap.get(a.courseId);
    if (!c) continue;
    lecBusy.add(`${c.lecturerId}|${a.day}|${a.period}`);
    groupBusy.add(`${c.groupId}|${a.day}|${a.period}`);
    roomBusy.add(`${a.classroomId}|${a.day}|${a.period}`);
  }

  const assignments: Assignment[] = [];
  const unassigned: SolveResult["unassigned"] = [];

  // Slots in a randomized but stable order
  const slots: { day: Day; period: Period }[] = [];
  for (let d = 1; d <= DAYS.length; d++) {
    for (const p of PERIODS) slots.push({ day: d as Day, period: p as Period });
  }

  let idCounter = 0;

  function tryPlace(unit: Unit): boolean {
    const c = courses.find((cc) => cc.id === unit.courseId)!;
    const lec = lecMap.get(c.lecturerId);
    const rooms = eligibleRooms.get(c.id) ?? [];
    if (rooms.length === 0) return false;

    const candidates = slots.slice().sort((s1, s2) => {
      const k1 = `${c.id}|${s1.day}`;
      const k2 = `${c.id}|${s2.day}`;
      return (courseDayCount.get(k1) ?? 0) - (courseDayCount.get(k2) ?? 0);
    });

    for (const s of candidates) {
      const lk = `${c.lecturerId}|${s.day}|${s.period}`;
      const gk = `${c.groupId}|${s.day}|${s.period}`;
      if (lecBusy.has(lk) || groupBusy.has(gk)) continue;
      if (lec && lec.availability.length > 0) {
        const ok = lec.availability.some((a) => a.day === s.day && a.period === s.period);
        if (!ok) continue;
      }
      for (const room of rooms) {
        const rk = `${room.id}|${s.day}|${s.period}`;
        if (roomBusy.has(rk)) continue;
        // place
        lecBusy.add(lk);
        groupBusy.add(gk);
        roomBusy.add(rk);
        const dayKey = `${c.id}|${s.day}`;
        courseDayCount.set(dayKey, (courseDayCount.get(dayKey) ?? 0) + 1);
        assignments.push({
          id: `a${++idCounter}`,
          courseId: c.id,
          day: s.day,
          period: s.period,
          classroomId: room.id,
        });
        return true;
      }
    }
    return false;
  }

  // Track unplaced per course
  const remainingPerCourse = new Map<string, number>();
  for (const u of units) {
    if (!tryPlace(u)) {
      remainingPerCourse.set(u.courseId, (remainingPerCourse.get(u.courseId) ?? 0) + 1);
    }
  }
  for (const [courseId, remaining] of remainingPerCourse) unassigned.push({ courseId, remaining });

  return { assignments, unassigned };
}