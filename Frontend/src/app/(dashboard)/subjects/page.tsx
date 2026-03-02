"use client";

import { useEffect, useState } from "react";
import { Plus, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubjects, createSubjectBulk } from "@/api/protectedApis/subject";
import { getExams } from "@/api/protectedApis/exam";
import { getAllClasses } from "@/api/protectedApis/class";
import { getTeachers } from "@/api/protectedApis/admin";

/* ================= TYPES ================= */

type Exam = { _id: string; name: string; academicYear: string };
type ClassItem = { _id: string; className: string; section?: string };
type Teacher = { employeeUserId: { _id: string; name: string } | string; firstName: string; lastName?: string };
type Subject = {
  _id: string;
  subjectName: string;
  examId: Exam | string;
  classId: ClassItem | string;
  maxMarks: number;
  teacherId?: { _id: string; name: string } | string | null;
};

/* ================= HELPERS ================= */

const classLabel = (c: ClassItem) =>
  `${c.className}${c.section ? ` - ${c.section}` : ""}`;

/* ================= PAGE ================= */

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Filters
  const [filterExam, setFilterExam] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  // Form
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [examId, setExamId] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [maxMarks, setMaxMarks] = useState("");
  const [teacherId, setTeacherId] = useState("none");
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */

  const fetchSubjects = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterExam !== "all") params.examId = filterExam;
      if (filterClass !== "all") params.classId = filterClass;
      const data = await getSubjects(params);
      setSubjects(data);
    } catch {
      toast.error("Failed to fetch subjects");
    }
  };

  useEffect(() => {
    Promise.all([getExams(), getAllClasses(), getTeachers()])
      .then(([e, c, t]) => {
        setExams(e);
        setClasses(c);
        setTeachers(t);
      })
      .catch(() => toast.error("Failed to load reference data"));
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [filterExam, filterClass]);

  /* ================= CLASS MULTI-SELECT HELPERS ================= */

  const allSelected = classes.length > 0 && selectedClassIds.length === classes.length;
  const someSelected = selectedClassIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map((c) => c._id));
    }
  };

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= CREATE ================= */

  const resetForm = () => {
    setSubjectName("");
    setExamId("");
    setSelectedClassIds([]);
    setMaxMarks("");
    setTeacherId("none");
  };

  const handleCreate = async () => {
    if (!subjectName || !examId || selectedClassIds.length === 0 || !maxMarks) {
      toast.error(
        selectedClassIds.length === 0
          ? "Select at least one class"
          : "Fill all fields"
      );
      return;
    }
    setSaving(true);
    try {
      await createSubjectBulk({
        subjectName,
        examId,
        classIds: selectedClassIds,
        maxMarks: Number(maxMarks),
        teacherId: teacherId === "none" ? null : teacherId,
      });
      toast.success(
        selectedClassIds.length === 1
          ? "Subject created"
          : `Subject created for ${selectedClassIds.length} classes`
      );
      setOpen(false);
      resetForm();
      fetchSubjects();
    } catch {
      toast.error("Failed to create subject");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DISPLAY HELPERS ================= */

  const getExamLabel = (s: Subject) => {
    if (typeof s.examId === "object" && s.examId) return s.examId.name;
    const found = exams.find((e) => e._id === s.examId);
    return found?.name ?? "-";
  };

  const getClassLabel = (s: Subject) => {
    if (typeof s.classId === "object" && s.classId)
      return classLabel(s.classId as ClassItem);
    const found = classes.find((c) => c._id === s.classId);
    return found ? classLabel(found) : "-";
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subject Management</h1>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Subject
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Subject Name */}
              <div className="space-y-1">
                <Label>Subject Name</Label>
                <Input
                  placeholder="e.g. Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>

              {/* Exam */}
              <div className="space-y-1">
                <Label>Exam</Label>
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.name} ({e.academicYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Classes — multi-select checklist */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Classes</Label>
                  {selectedClassIds.length > 0 && (
                    <span className="text-xs text-violet-600 font-medium">
                      {selectedClassIds.length} selected
                    </span>
                  )}
                </div>

                <div className="border rounded-md overflow-hidden">
                  {/* All Classes toggle */}
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold bg-gray-50 border-b hover:bg-gray-100 transition"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
                    ) : someSelected ? (
                      /* indeterminate look */
                      <span className="w-4 h-4 border-2 border-violet-400 rounded flex items-center justify-center shrink-0">
                        <span className="w-2 h-0.5 bg-violet-400 rounded" />
                      </span>
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    All Classes
                  </button>

                  {/* Individual class checkboxes */}
                  <div className="max-h-44 overflow-y-auto divide-y">
                    {classes.map((c) => {
                      const checked = selectedClassIds.includes(c._id);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => toggleClass(c._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition text-left"
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span className={checked ? "text-gray-900" : "text-gray-600"}>
                            {classLabel(c)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Max Marks */}
              <div className="space-y-1">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>

              {/* Subject Teacher */}
              <div className="space-y-1">
                <Label>Subject Teacher <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {teachers.map((t) => {
                      const uid = typeof t.employeeUserId === "object"
                        ? (t.employeeUserId as { _id: string; name: string })._id
                        : t.employeeUserId as string;
                      const label = `${t.firstName}${t.lastName ? " " + t.lastName : ""}`;
                      return (
                        <SelectItem key={uid} value={uid}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Save Subject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterExam} onValueChange={setFilterExam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e._id} value={e._id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {classLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ===== TABLE ===== */}
      <Card>
        <CardHeader>
          <span className="font-semibold text-lg">All Subjects</span>
        </CardHeader>

        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No subjects found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Max Marks</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {subjects.map((s, i) => {
                  const teacherName = typeof s.teacherId === "object" && s.teacherId
                    ? (s.teacherId as { _id: string; name: string }).name
                    : "—";
                  return (
                    <TableRow key={s._id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {s.subjectName}
                      </TableCell>
                      <TableCell>{getExamLabel(s)}</TableCell>
                      <TableCell>{getClassLabel(s)}</TableCell>
                      <TableCell>{teacherName}</TableCell>
                      <TableCell className="text-right">{s.maxMarks}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
