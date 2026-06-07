import { createFileRoute, Link } from "@tanstack/react-router";
import { useTimetableStore } from "@/store/timetable-store";
import { PageHeader } from "@/components/PageHeader";
import { detectConflicts } from "@/lib/conflicts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/conflicts")({
  head: () => ({ meta: [{ title: "Conflicts — Timetable Admin" }] }),
  component: ConflictsPage,
});

function ConflictsPage() {
  const { assignments, courses, lecturers, classrooms, groups } = useTimetableStore();
  const conflicts = detectConflicts(assignments, courses, lecturers, classrooms, groups);

  return (
    <div>
      <PageHeader
        title="Conflicts"
        description="Issues detected in the current schedule."
        actions={<Button asChild variant="outline"><Link to="/timetable">Open Timetable</Link></Button>}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {conflicts.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <div className="font-medium">No conflicts detected</div>
            <p className="text-sm text-muted-foreground mt-1">Your current schedule is clean.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <Card key={i}>
                <CardContent className="py-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">{c.type.replace(/-/g, " ")}</Badge>
                    </div>
                    <div className="mt-1 text-sm">{c.message}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}