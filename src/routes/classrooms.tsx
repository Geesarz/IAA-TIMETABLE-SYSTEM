import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTimetableStore } from "@/store/timetable-store";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Classroom, RoomType } from "@/types/timetable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/classrooms")({
  head: () => ({ meta: [{ title: "Classrooms — Timetable Admin" }] }),
  component: ClassroomsPage,
});

const empty: Omit<Classroom, "id"> = { name: "", capacity: 30, type: "lecture" };

function ClassroomsPage() {
  const { classrooms, addClassroom, updateClassroom, removeClassroom } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Omit<Classroom, "id">>(empty);

  function startNew() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(c: Classroom) { setEditing(c); setForm({ name: c.name, capacity: c.capacity, type: c.type }); setOpen(true); }
  function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (form.capacity <= 0) { toast.error("Capacity must be > 0"); return; }
    if (editing) updateClassroom(editing.id, form);
    else addClassroom(form);
    toast.success(editing ? "Updated" : "Added");
    setOpen(false);
  }

  return (
    <div>
      <PageHeader title="Classrooms" description="Allocate physical spaces for lectures and labs."
        actions={<Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />Add Classroom</Button>} />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
            <TableBody>
              {classrooms.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No classrooms yet</TableCell></TableRow>}
              {classrooms.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant={c.type === "lab" ? "secondary" : "outline"}>{c.type}</Badge></TableCell>
                  <TableCell>{c.capacity}</TableCell>
                  <TableCell><div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { removeClassroom(c.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Classroom" : "Add Classroom"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="lecture">Lecture</SelectItem><SelectItem value="lab">Lab</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}