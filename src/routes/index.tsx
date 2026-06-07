import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useTimetableStore } from "@/store/timetable-store";
import { detectConflicts } from "@/lib/conflicts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { GraduationCap, Building2, BookOpen, CalendarDays, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Timetable Admin" },
      { name: "description", content: "Manage lecturers, classrooms, courses and generate conflict-free timetables." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lecturers, classrooms, courses, groups, assignments, loadSeed, resetAll } = useTimetableStore();
  const conflicts = detectConflicts(assignments, courses, lecturers, classrooms, groups);
  const stats = [
    { label: "Lecturers", value: lecturers.length, to: "/lecturers", icon: GraduationCap },
    { label: "Classrooms", value: classrooms.length, to: "/classrooms", icon: Building2 },
    { label: "Student Groups", value: groups.length, to: "/courses", icon: Users },
    { label: "Courses", value: courses.length, to: "/courses", icon: BookOpen },
    { label: "Scheduled Slots", value: assignments.length, to: "/timetable", icon: CalendarDays },
    { label: "Conflicts", value: conflicts.length, to: "/conflicts", icon: AlertTriangle },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your scheduling data."
        actions={
          <>
            <Button variant="outline" onClick={() => { loadSeed(); toast.success("Seed data loaded"); }}>Load Seed Data</Button>
            <Button variant="ghost" onClick={() => { if (confirm("Wipe all data?")) { resetAll(); toast.success("All data cleared"); } }}>Reset</Button>
          </>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">{s.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{s.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <Card>
          <CardHeader><CardTitle>Getting started</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Add lecturers, classrooms, student groups and courses (or load seed data).</p>
            <p>2. Open the Timetable page and click <span className="font-medium text-foreground">Generate</span> to run the constraint solver.</p>
            <p>3. Review conflicts in the Conflicts tab and adjust inputs as needed.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
