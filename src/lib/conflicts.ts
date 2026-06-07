import type { Assignment, Classroom, Conflict, Course, Lecturer, StudentGroup } from "@/types/timetable";

export function detectConflicts(
  assignments: Assignment[],
  courses: Course[],
  lecturers: Lecturer[],
  classrooms: Classroom[],
  groups: StudentGroup[],
): Conflict[] {
  const conflicts: Conflict[] = [];
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const lecMap = new Map(lecturers.map((l) => [l.id, l]));
  const roomMap = new Map(classrooms.map((r) => [r.id, r]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  // Pairwise checks via slot maps
  const byLec = new Map<string, Assignment[]>();
  const byRoom = new Map<string, Assignment[]>();
  const byGroup = new Map<string, Assignment[]>();

  for (const a of assignments) {
    const c = courseMap.get(a.courseId);
    if (!c) continue;
    const slotKey = `${a.day}-${a.period}`;
    const lk = `${c.lecturerId}|${slotKey}`;
    const rk = `${a.classroomId}|${slotKey}`;
    const gk = `${c.groupId}|${slotKey}`;
    byLec.set(lk, [...(byLec.get(lk) ?? []), a]);
    byRoom.set(rk, [...(byRoom.get(rk) ?? []), a]);
    byGroup.set(gk, [...(byGroup.get(gk) ?? []), a]);
  }

  for (const [, list] of byLec) if (list.length > 1) {
    const c = courseMap.get(list[0].courseId);
    const lec = c ? lecMap.get(c.lecturerId) : undefined;
    conflicts.push({
      type: "lecturer-double-booked",
      message: `Lecturer ${lec?.name ?? "?"} is booked for ${list.length} classes at the same time.`,
      assignmentIds: list.map((a) => a.id),
    });
  }
  for (const [, list] of byRoom) if (list.length > 1) {
    const room = roomMap.get(list[0].classroomId);
    conflicts.push({
      type: "classroom-double-booked",
      message: `Classroom ${room?.name ?? "?"} is booked for ${list.length} classes at the same time.`,
      assignmentIds: list.map((a) => a.id),
    });
  }
  for (const [, list] of byGroup) if (list.length > 1) {
    const c = courseMap.get(list[0].courseId);
    const grp = c ? groupMap.get(c.groupId) : undefined;
    conflicts.push({
      type: "group-double-booked",
      message: `Student group ${grp?.name ?? "?"} has ${list.length} classes at the same time.`,
      assignmentIds: list.map((a) => a.id),
    });
  }

  for (const a of assignments) {
    const c = courseMap.get(a.courseId);
    if (!c) continue;
    const lec = lecMap.get(c.lecturerId);
    const room = roomMap.get(a.classroomId);
    const grp = groupMap.get(c.groupId);
    if (lec && lec.availability.length > 0) {
      const ok = lec.availability.some((s) => s.day === a.day && s.period === a.period);
      if (!ok) {
        conflicts.push({
          type: "lecturer-unavailable",
          message: `Lecturer ${lec.name} is not available for ${c.code}.`,
          assignmentIds: [a.id],
        });
      }
    }
    if (room && grp && room.capacity < grp.size) {
      conflicts.push({
        type: "room-too-small",
        message: `${room.name} (cap ${room.capacity}) is too small for ${grp.name} (${grp.size}).`,
        assignmentIds: [a.id],
      });
    }
    if (room && room.type !== c.roomType) {
      conflicts.push({
        type: "room-type-mismatch",
        message: `${c.code} needs a ${c.roomType} room but ${room.name} is a ${room.type}.`,
        assignmentIds: [a.id],
      });
    }
  }

  return conflicts;
}