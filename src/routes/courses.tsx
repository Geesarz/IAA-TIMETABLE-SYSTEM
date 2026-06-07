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
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import type { Course, RoomType, StudentGroup } from "@/types/timetable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses & Groups — Timetable Admin" }] }),
  component: CoursesPage,
});

const empty: Omit<Course, "id"> = { code: "", title: "", lecturerId: "", groupId: "", weeklyHours: 2, roomType: "lecture" };

function CoursesPage() {
  const { courses, lecturers, groups, addCourse, updateCourse, removeCourse, addGroup, updateGroup, removeGroup } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, "id">>(empty);

  function startNew() { setEditing(null); setForm({ ...empty, lecturerId: lecturers[0]?.id ?? "", groupId: groups[0]?.id ?? "" }); setOpen(true); }
  function startEdit(c: Course) { setEditing(c); setForm({ code: c.code, title: c.title, lecturerId: c.lecturerId, groupId: c.groupId, weeklyHours: c.weeklyHours, roomType: c.roomType }); setOpen(true); }
  function save() {
    if (!form.code.trim() || !form.title.trim()) { toast.error("Code & title required"); return; }
    if (!form.lecturerId || !form.groupId) { toast.error("Pick lecturer and group"); return; }
    if (editing) updateCourse(editing.id, form); else addCourse(form);
    toast.success(editing ? "Updated" : "Added"); setOpen(false);
  }

  // Group dialog
  const [gOpen, setGOpen] = useState(false);
  const [gEditing, setGEditing] = useState<StudentGroup | null>(null);
  const [gForm, setGForm] = useState<Omit<StudentGroup, "id">>({ name: "", size: 30, year: 1 });
  function gStartNew() { setGEditing(null); setGForm({ name: "", size: 30, year: 1 }); setGOpen(true); }
  function gStartEdit(g: StudentGroup) { setGEditing(g); setGForm({ name: g.name, size: g.size, year: g.year }); setGOpen(true); }
  function gSave() {
    if (!gForm.name.trim()) { toast.error("Name required"); return; }
    if (gEditing) updateGroup(gEditing.id, gForm); else addGroup(gForm);
    toast.success("Saved"); setGOpen(false);
  }

  return (
    <div>
      <PageHeader title="Courses & Groups" description="Define courses and the student groups that take them." />
      <div className="p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="courses">
          <TabsList><TabsTrigger value="courses">Courses</TabsTrigger><TabsTrigger value="groups">Student Groups</TabsTrigger></TabsList>

          <TabsContent value="courses" className="mt-4">
            <div className="flex justify-end mb-3"><Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />Add Course</Button></div>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Lecturer</TableHead><TableHead>Group</TableHead><TableHead>Hrs/wk</TableHead><TableHead>Room</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {courses.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No courses yet</TableCell></TableRow>}
                  {courses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.code}</TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{lecturers.find((l) => l.id === c.lecturerId)?.name ?? "—"}</TableCell>
                      <TableCell>{groups.find((g) => g.id === c.groupId)?.name ?? "—"}</TableCell>
                      <TableCell>{c.weeklyHours}</TableCell>
                      <TableCell className="capitalize">{c.roomType}</TableCell>
                      <TableCell><div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { removeCourse(c.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <div className="flex justify-end mb-3"><Button onClick={gStartNew}><Plus className="h-4 w-4 mr-1" />Add Group</Button></div>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Year</TableHead><TableHead>Size</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {groups.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No groups yet</TableCell></TableRow>}
                  {groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium flex items-center gap-2"><UsersIcon className="h-4 w-4 text-muted-foreground" />{g.name}</TableCell>
                      <TableCell>Year {g.year}</TableCell>
                      <TableCell>{g.size}</TableCell>
                      <TableCell><div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => gStartEdit(g)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { removeGroup(g.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Hours / week</Label><Input type="number" min={1} max={10} value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: Number(e.target.value) })} /></div>
            </div>
            <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Lecturer</Label>
                <Select value={form.lecturerId} onValueChange={(v) => setForm({ ...form, lecturerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                  <SelectContent>{lecturers.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Student Group</Label>
                <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>{groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Room Type</Label>
              <Select value={form.roomType} onValueChange={(v) => setForm({ ...form, roomType: v as RoomType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="lecture">Lecture</SelectItem><SelectItem value="lab">Lab</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={gOpen} onOpenChange={setGOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{gEditing ? "Edit Group" : "Add Group"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Year</Label>
                <Select value={String(gForm.year)} onValueChange={(v) => setGForm({ ...gForm, year: Number(v) as 1 | 2 | 3 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Size</Label><Input type="number" min={1} value={gForm.size} onChange={(e) => setGForm({ ...gForm, size: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setGOpen(false)}>Cancel</Button><Button onClick={gSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}