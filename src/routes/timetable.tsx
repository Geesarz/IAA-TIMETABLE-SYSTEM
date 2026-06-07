import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTimetableStore } from "@/store/timetable-store";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sparkles, Trash2, Download } from "lucide-react";
import { generateSchedule } from "@/lib/scheduler";
import { detectConflicts } from "@/lib/conflicts";
import { DAYS, PERIOD_LABELS, PERIODS, type Day, type Period } from "@/types/timetable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Timetable Admin" }] }),
  component: TimetablePage,
});

type FilterMode = "year" | "group" | "lecturer" | "classroom";

function colorFor(department: string) {
  let h = 0;
  for (let i = 0; i < department.length; i++) h = (h * 31 + department.charCodeAt(i)) % 360;
  return `oklch(0.92 0.05 ${h})`;
}

function TimetablePage() {
  const { courses, lecturers, classrooms, groups, assignments, setAssignments, clearAssignments } = useTimetableStore();
  const [mode, setMode] = useState<FilterMode>("year");
  const [filter, setFilter] = useState<string>("all");

  const conflicts = useMemo(
    () => detectConflicts(assignments, courses, lecturers, classrooms, groups),
    [assignments, courses, lecturers, classrooms, groups],
  );
  const conflictAids = new Set(conflicts.flatMap((c) => c.assignmentIds));

  function handleGenerate(year?: 1 | 2 | 3) {
    if (courses.length === 0) { toast.error("Add some courses first"); return; }
    if (year) {
      const yearGroupIds = new Set(groups.filter((g) => g.year === year).map((g) => g.id));
      const yearCourses = courses.filter((c) => yearGroupIds.has(c.groupId));
      if (yearCourses.length === 0) { toast.error(`No courses for Year ${year}`); return; }
      // Keep assignments from other years intact, and pre-book them so the
      // solver does not reuse the same lecturer/room/slot across years.
      const otherCourseIds = new Set(courses.filter((c) => !yearGroupIds.has(c.groupId)).map((c) => c.id));
      const kept = assignments.filter((a) => otherCourseIds.has(a.courseId));
      const result = generateSchedule(yearCourses, lecturers, classrooms, groups, kept, courses);
      setAssignments([...kept, ...result.assignments]);
      if (result.unassigned.length > 0) {
        toast.warning(`Year ${year}: ${result.unassigned.reduce((a, x) => a + x.remaining, 0)} unit(s) could not be placed.`);
      } else {
        toast.success(`Year ${year}: scheduled ${result.assignments.length} slots.`);
      }
      setMode("year"); setFilter(String(year));
      return;
    }
    // Generate all years sequentially so each year's schedule is built independently
    const allYears: (1 | 2 | 3)[] = [1, 2, 3];
    let combined: typeof assignments = [];
    let totalUnassigned = 0;
    for (const y of allYears) {
      const yearGroupIds = new Set(groups.filter((g) => g.year === y).map((g) => g.id));
      const yearCourses = courses.filter((c) => yearGroupIds.has(c.groupId));
      if (yearCourses.length === 0) continue;
      const result = generateSchedule(yearCourses, lecturers, classrooms, groups, combined, courses);
      // Re-id to avoid collisions across years
      const offset = combined.length;
      combined = [
        ...combined,
        ...result.assignments.map((a, i) => ({ ...a, id: `a${offset + i + 1}` })),
      ];
      totalUnassigned += result.unassigned.reduce((a, x) => a + x.remaining, 0);
    }
    // Fallback: if no group has a year set (e.g. legacy data), schedule all courses together
    if (combined.length === 0 && groups.every((g) => !g.year)) {
      const result = generateSchedule(courses, lecturers, classrooms, groups, [], courses);
      combined = result.assignments;
      totalUnassigned = result.unassigned.reduce((a, x) => a + x.remaining, 0);
    }
    setAssignments(combined);
    if (totalUnassigned > 0) toast.warning(`${totalUnassigned} unit(s) could not be placed.`);
    else toast.success(`Scheduled ${combined.length} slots across all years.`);
  }

  const filtered = useMemo(() => {
    if (filter === "all") return assignments;
    return assignments.filter((a) => {
      const c = courses.find((cc) => cc.id === a.courseId);
      if (!c) return false;
      if (mode === "year") {
        const g = groups.find((gg) => gg.id === c.groupId);
        return g ? String(g.year) === filter : false;
      }
      if (mode === "group") return c.groupId === filter;
      if (mode === "lecturer") return c.lecturerId === filter;
      return a.classroomId === filter;
    });
  }, [assignments, courses, groups, mode, filter]);

  const filterOptions: { id: string; name: string }[] =
    mode === "year"
      ? [
          { id: "1", name: "Year 1" },
          { id: "2", name: "Year 2" },
          { id: "3", name: "Year 3" },
        ]
      : mode === "group"
      ? groups
      : mode === "lecturer"
      ? lecturers
      : classrooms;

  // Build grid lookup
  const grid = new Map<string, typeof assignments>();
  for (const a of filtered) {
    const k = `${a.day}-${a.period}`;
    grid.set(k, [...(grid.get(k) ?? []), a]);
  }

  function exportCsv() {
    if (assignments.length === 0) { toast.error("Nothing to export"); return; }
    const rows = [["Day", "Time", "Year", "Group", "Course Code", "Course Title", "Lecturer", "Classroom"]];
    const dayNames = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];
    const sorted = [...assignments].sort((a, b) => a.day - b.day || a.period - b.period);
    for (const a of sorted) {
      const c = courses.find((cc) => cc.id === a.courseId);
      const g = c ? groups.find((gg) => gg.id === c.groupId) : undefined;
      const lec = c ? lecturers.find((l) => l.id === c.lecturerId) : undefined;
      const room = classrooms.find((r) => r.id === a.classroomId);
      rows.push([
        dayNames[a.day] ?? String(a.day),
        PERIOD_LABELS[a.period] ?? String(a.period),
        g ? `Year ${g.year}` : "",
        g?.name ?? "",
        c?.code ?? "",
        c?.title ?? "",
        lec?.name ?? "",
        room?.name ?? "",
      ]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timetable-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Timetable exported");
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Auto-generate a conflict-free weekly schedule and view by group, lecturer, or classroom."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={assignments.length === 0}>
              <Download className="h-4 w-4 mr-1" />Export
            </Button>
            <Button variant="outline" onClick={() => { clearAssignments(); toast.success("Cleared"); }} disabled={assignments.length === 0}>
              <Trash2 className="h-4 w-4 mr-1" />Clear
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button><Sparkles className="h-4 w-4 mr-1" />Generate</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleGenerate()}>All years</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleGenerate(1)}>Year 1 only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerate(2)}>Year 2 only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerate(3)}>Year 3 only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={mode} onValueChange={(v) => { setMode(v as FilterMode); setFilter("all"); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="year">By Year</SelectItem>
              <SelectItem value="group">By Student Group</SelectItem>
              <SelectItem value="lecturer">By Lecturer</SelectItem>
              <SelectItem value="classroom">By Classroom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filterOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground ml-auto">
            {assignments.length} scheduled · <span className={conflicts.length > 0 ? "text-destructive" : ""}>{conflicts.length} conflict{conflicts.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="bg-muted/50 sticky left-0 z-10 px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b w-32">Time</th>
                {DAYS.map((d) => <th key={d} className="bg-muted/50 px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p}>
                  <td className="sticky left-0 bg-card px-3 py-2 text-xs text-muted-foreground border-b align-top whitespace-nowrap">{PERIOD_LABELS[p]}</td>
                  {DAYS.map((_, di) => {
                    const day = (di + 1) as Day;
                    const cells = grid.get(`${day}-${p as Period}`) ?? [];
                    return (
                      <td key={di} className="border-b border-l align-top p-1.5 min-w-[160px]">
                        <div className="space-y-1">
                          {cells.map((a) => {
                            const c = courses.find((cc) => cc.id === a.courseId);
                            const lec = c ? lecturers.find((l) => l.id === c.lecturerId) : undefined;
                            const room = classrooms.find((r) => r.id === a.classroomId);
                            const grp = c ? groups.find((g) => g.id === c.groupId) : undefined;
                            const hasConflict = conflictAids.has(a.id);
                            return (
                              <div
                                key={a.id}
                                className={cn("rounded-md p-2 text-xs border", hasConflict && "border-destructive ring-1 ring-destructive")}
                                style={{ backgroundColor: hasConflict ? undefined : colorFor(lec?.department ?? "") }}
                              >
                                <div className="font-semibold">{c?.code} <span className="font-normal text-muted-foreground">· {c?.title}</span></div>
                                <div className="text-muted-foreground mt-0.5">{lec?.name}</div>
                                <div className="text-muted-foreground">{room?.name} · {grp?.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}