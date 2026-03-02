"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { getExams } from "@/api/protectedApis/exam";
import { getSubjects } from "@/api/protectedApis/subject";
import { getAllClasses, getClassById } from "@/api/protectedApis/class";
import {
  addMarks,
  getStudentMarks,
  getStudentExams,
  getClassResult,
} from "@/api/protectedApis/mark";
import { getUserId, getloginType } from "@/lib/storage";

/* ================= TYPES ================= */

type Exam = { _id: string; name: string; academicYear: string };
type ClassItem = { _id: string; className: string; section?: string };
type SubjectItem = {
  _id: string;
  subjectName: string;
  maxMarks: number;
  teacherId?: { _id: string; name: string } | string | null;
};
type Student = {
  studentUserId: { _id: string; name: string };
  rollNumber: number;
};

const classLabel = (c: ClassItem) =>
  `${c.className}${c.section ? ` - ${c.section}` : ""}`;

/* ================= TEACHER VIEW ================= */

function TeacherMarksPage() {
  const userId = getUserId();

  /* ── Step 1: selectors ── */
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  /* ── After load ── */
  const [authorizedSubjects, setAuthorizedSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loaded, setLoaded] = useState(false);

  /* ── Step 2: selected subject ── */
  const [activeSubject, setActiveSubject] = useState<SubjectItem | null>(null);

  /* ── Step 3: marks input — marksMap[studentUserId] = value ── */
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /* ================= INIT ================= */

  useEffect(() => {
    Promise.all([getExams(), getAllClasses()])
      .then(([e, c]) => {
        setExams(e);
        setClasses(c);
      })
      .catch(() => toast.error("Failed to load reference data"));
  }, []);

  /* ================= LOAD ================= */

  const handleLoad = async () => {
    if (!selectedExam || !selectedClass) {
      toast.error("Select both exam and class");
      return;
    }
    try {
      const [subjectData, classData] = await Promise.all([
        getSubjects({ examId: selectedExam, classId: selectedClass }),
        getClassById(selectedClass),
      ]);

      // Determine if logged-in user is the class teacher
      const ctId =
        typeof classData.classTeacherId === "object"
          ? classData.classTeacherId?._id
          : classData.classTeacherId;
      const isClassTeacher = String(ctId) === userId;

      // Filter subjects: class teacher sees all; subject teacher sees only assigned subjects
      const allowed: SubjectItem[] = isClassTeacher
        ? subjectData
        : subjectData.filter((s: SubjectItem) => {
            const tid =
              typeof s.teacherId === "object" ? s.teacherId?._id : s.teacherId;
            return String(tid) === userId;
          });

      setAuthorizedSubjects(allowed);
      setStudents(classData.students ?? []);
      setActiveSubject(null);
      setMarksMap({});
      setLoaded(true);
    } catch {
      toast.error("Failed to load data");
    }
  };

  /* ================= SUBJECT SELECT ================= */

  const handleSubjectSelect = async (subject: SubjectItem) => {
    setActiveSubject(subject);
    setMarksMap({});

    // Pre-fill existing marks for this subject
    try {
      const existingMarks = await getClassResult(selectedExam);
      const map: Record<string, string> = {};
      (existingMarks ?? []).forEach((m: any) => {
        const subId =
          typeof m.subjectId === "object" ? m.subjectId?._id : m.subjectId;
        if (subId === subject._id) {
          const sId = String(m.studentUserId?._id ?? m.studentUserId ?? "");
          map[sId] = String(m.marksObtained);
        }
      });
      setMarksMap(map);
    } catch {
      /* pre-fill failure is non-fatal */
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!activeSubject) return;

    const sorted = [...students].sort((a, b) => a.rollNumber - b.rollNumber);

    // Validate: all students must have marks
    const missing = sorted.filter((s) => {
      const val = marksMap[s.studentUserId._id];
      return val === undefined || val.trim() === "";
    });
    if (missing.length > 0) {
      toast.error(
        `Enter marks for all ${students.length} students (${missing.length} missing)`
      );
      return;
    }

    // Validate: marks within range
    const outOfRange = sorted.find((s) => {
      const val = Number(marksMap[s.studentUserId._id]);
      return val < 0 || val > activeSubject.maxMarks;
    });
    if (outOfRange) {
      toast.error(`Marks must be between 0 and ${activeSubject.maxMarks}`);
      return;
    }

    const marks = sorted.map((s) => ({
      classId: selectedClass,
      studentUserId: s.studentUserId._id,
      rollNumber: s.rollNumber,
      subjectId: activeSubject._id,
      examId: selectedExam,
      marksObtained: Number(marksMap[s.studentUserId._id]),
    }));

    setSaving(true);
    try {
      await addMarks(marks);
      toast.success("Marks saved successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  const sortedStudents = [...students].sort((a, b) => a.rollNumber - b.rollNumber);
  const filledCount = sortedStudents.filter(
    (s) => marksMap[s.studentUserId._id] !== undefined && marksMap[s.studentUserId._id].trim() !== ""
  ).length;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <h1 className="text-2xl font-bold">Marks Entry</h1>

      {/* ===== STEP 1: Exam + Class ===== */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Exam</p>
              <Select
                value={selectedExam}
                onValueChange={(v) => {
                  setSelectedExam(v);
                  setLoaded(false);
                  setActiveSubject(null);
                }}
              >
                <SelectTrigger className="w-48">
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

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Class</p>
              <Select
                value={selectedClass}
                onValueChange={(v) => {
                  setSelectedClass(v);
                  setLoaded(false);
                  setActiveSubject(null);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {classLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleLoad}>Load Subjects</Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== STEP 2: Subject Selection ===== */}
      {loaded && authorizedSubjects.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No subjects assigned to you for this exam and class.
        </p>
      )}

      {loaded && authorizedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <span className="font-semibold text-lg">Select a Subject</span>
            <p className="text-sm text-slate-400 font-normal mt-0.5">
              Marks are entered one subject at a time
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {authorizedSubjects.map((sub) => {
                const isActive = activeSubject?._id === sub._id;
                return (
                  <button
                    key={sub._id}
                    onClick={() => handleSubjectSelect(sub)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {sub.subjectName}
                    <span
                      className={`ml-2 text-xs ${
                        isActive ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      / {sub.maxMarks}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 3: Marks Entry Table ===== */}
      {activeSubject && sortedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-lg">
                  {activeSubject.subjectName}
                </span>
                <p className="text-sm text-slate-400 font-normal mt-0.5">
                  Max marks: {activeSubject.maxMarks} &nbsp;·&nbsp; {filledCount} / {sortedStudents.length} filled
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Save Marks"}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center w-36">
                    Marks (/ {activeSubject.maxMarks})
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedStudents.map((s) => {
                  const val = marksMap[s.studentUserId._id] ?? "";
                  const isEmpty = val.trim() === "";
                  return (
                    <TableRow key={s.studentUserId._id}>
                      <TableCell>{s.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {s.studentUserId.name}
                      </TableCell>
                      <TableCell className="p-1 text-center">
                        <Input
                          type="number"
                          className={`w-24 text-center mx-auto ${
                            isEmpty ? "border-amber-300 bg-amber-50" : ""
                          }`}
                          min={0}
                          max={activeSubject.maxMarks}
                          value={val}
                          onChange={(e) =>
                            setMarksMap((prev) => ({
                              ...prev,
                              [s.studentUserId._id]: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ================= STUDENT VIEW ================= */

function StudentMarksPage() {
  const studentId = getUserId();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [marks, setMarks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStudentExams(studentId)
      .then(setExams)
      .catch(() => toast.error("Failed to load exams"));
  }, [studentId]);

  const handleLoad = async () => {
    if (!selectedExam) {
      toast.error("Select an exam");
      return;
    }
    try {
      const data = await getStudentMarks(studentId, selectedExam);
      setMarks(data);
      setLoaded(true);
    } catch {
      toast.error("Failed to load marks");
    }
  };

  const total = marks.reduce((sum, m) => sum + (m.marksObtained ?? 0), 0);
  const maxTotal = marks.reduce(
    (sum, m) => sum + (m.subjectId?.maxMarks ?? 0),
    0
  );
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Marks</h1>
      </div>

      {/* ===== EXAM SELECTOR ===== */}
      {exams.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          No exams found. Your marks have not been entered yet.
        </p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Select Exam</p>
                <Select
                  value={selectedExam}
                  onValueChange={(v) => {
                    setSelectedExam(v);
                    setLoaded(false);
                  }}
                >
                  <SelectTrigger className="w-48">
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
              <Button onClick={handleLoad}>View Marks</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== RESULTS ===== */}
      {loaded && marks.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No marks found for this exam.
        </p>
      )}

      {loaded && marks.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Total Marks</p>
                <p className="text-2xl font-bold">
                  {total} / {maxTotal}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Percentage</p>
                <p className="text-2xl font-bold">{pct}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-500">Subjects</p>
                <p className="text-2xl font-bold">{marks.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subject-wise table */}
          <Card>
            <CardHeader>
              <span className="font-semibold text-lg">Subject-wise Marks</span>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Obtained</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m, i) => {
                    const subName =
                      typeof m.subjectId === "object"
                        ? m.subjectId?.subjectName
                        : "-";
                    const maxM =
                      typeof m.subjectId === "object"
                        ? (m.subjectId?.maxMarks ?? 0)
                        : 0;
                    const p =
                      maxM > 0
                        ? Math.round((m.marksObtained / maxM) * 100)
                        : 0;
                    return (
                      <TableRow key={m._id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{subName}</TableCell>
                        <TableCell className="text-right">
                          {m.marksObtained}
                        </TableCell>
                        <TableCell className="text-right">{maxM}</TableCell>
                        <TableCell className="text-right">{p}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/* ================= PAGE ROUTER ================= */

export default function MarksPage() {
  const [loginType, setLoginType] = useState<string | null>(null);

  useEffect(() => {
    setLoginType(getloginType());
  }, []);

  if (!loginType) return null;

  if (loginType === "student") return <StudentMarksPage />;
  return <TeacherMarksPage />;
}
