import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, GraduationCap, Building2, BookOpen, AlertTriangle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimetableStore } from "@/store/timetable-store";
import { detectConflicts } from "@/lib/conflicts";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lecturers", label: "Lecturers", icon: GraduationCap },
  { to: "/classrooms", label: "Classrooms", icon: Building2 },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/conflicts", label: "Conflicts", icon: AlertTriangle },
] as const;

export function AppLayout() {
  const location = useLocation();
  const { assignments, courses, lecturers, classrooms, groups } = useTimetableStore();
  const conflictCount = detectConflicts(assignments, courses, lecturers, classrooms, groups).length;
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const navList = (
    <nav className="flex-1 p-3 space-y-1">
      {nav.map((item) => {
        const active = location.pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60",
            )}
          >
            <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.label}</span>
            {item.to === "/conflicts" && conflictCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{conflictCount}</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">T</div>
      <div>
        <div className="font-semibold leading-tight">Timetable</div>
        <div className="text-xs text-muted-foreground">Admin Console</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 border-r bg-sidebar text-sidebar-foreground flex-col">
        <div className="px-6 py-5 border-b border-sidebar-border">{brand}</div>
        {navList}
        <div className="p-4 text-xs text-muted-foreground border-t border-sidebar-border">
          Frontend-only demo. Wire to your API later.
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-card px-4 py-3">
          {brand}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
              <SheetHeader className="px-6 py-5 border-b border-sidebar-border text-left">
                <SheetTitle className="p-0">{brand}</SheetTitle>
              </SheetHeader>
              {navList}
            </SheetContent>
          </Sheet>
        </header>
        <Outlet />
      </main>
    </div>
  );
}