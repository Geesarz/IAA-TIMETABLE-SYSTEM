import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTimetableStore } from "@/store/timetable-store";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DAYS, PERIODS, type Day, type Lecturer, type Period, type Slot } from "@/types/timetable";
import { toast } from "sonner";

export const Route = createFileRoute("/lecturers")({
  head: () => ({ meta: [{ title: "Lecturers — Timetable Admin" }] }),
  component: LecturersPage,
});

const empty: Omit<Lecturer, "id"> = { name: "", email: "", department: "", availability: [] };

function LecturersPage() {
  const { lecturers, addLecturer, updateLecturer, removeLecturer } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lecturer | null>(null);
  const [form, setForm] = useState<Omit<Lecturer, "id">>(empty);

  function startNew() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(l: Lecturer) { setEditing(l); setForm({ name: l.name, email: l.email, department: l.department, availability: l.availability }); setOpen(true); }
  function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (editing) { updateLecturer(editing.id, form); toast.success("Updated"); }
    else { addLecturer(form); toast.success("Added"); }
    setOpen(false);
  }
  function toggleSlot(day: Day, period: Period) {
    const exists = form.availability.some((s) => s.day === day && s.period === period);
    const next: Slot[] = exists
      ? form.availability.filter((s) => !(s.day === day && s.period === period))
      : [...form.availability, { day, period }];
    setForm({ ...form, availability: next });
  }

  return (
    <div>
      <PageHeader
        title="Lecturers"
        description="Manage teaching staff and their weekly availability."
        actions={<Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />Add Lecturer</Button>}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead>
                <TableHead>Availability</TableHead><TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No lecturers yet</TableCell></TableRow>
              )}
              {lecturers.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.email}</TableCell>
                  <TableCell>{l.department}</TableCell>
                  <TableCell className="text-muted-foreground">{l.availability.length === 0 ? "Anytime" : `${l.availability.length} slots`}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { removeLecturer(l.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Lecturer" : "Add Lecturer"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="grid gap-2">
              <Label>Availability <span className="text-muted-foreground font-normal">(leave empty for "anytime")</span></Label>
              <div className="overflow-auto">
                <table className="text-xs">
                  <thead><tr><th></th>{DAYS.map((d) => <th key={d} className="px-2 py-1 font-medium">{d}</th>)}</tr></thead>
                  <tbody>
                    {PERIODS.map((p) => (
                      <tr key={p}>
                        <td className="pr-2 text-muted-foreground">P{p}</td>
                        {DAYS.map((_, di) => {
                          const day = (di + 1) as Day;
                          const checked = form.availability.some((s) => s.day === day && s.period === p);
                          return <td key={di} className="text-center px-1"><Checkbox checked={checked} onCheckedChange={() => toggleSlot(day, p as Period)} /></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}