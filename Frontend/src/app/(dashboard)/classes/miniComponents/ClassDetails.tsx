"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import EditTeacherDialog  from "./EditTeacherDialog"

/* ================= TYPES ================= */

type Student = {
  studentUserId: {
    _id: string,
    name: string
  }
  rollNumber: number;
};

type Teacher = {
  _id: string;
  name: string;
};

type ClassDoc = {
  _id: string;
  className: string;
  section: string;
  students: Student[];
  classTeacherId?: Teacher | null;
};

/* ================= API ================= */

import {
  getClassById,
  addStudentToClass,
  removeStudentFromClass,
  assignClassTeacher,
  removeClassTeacher,
} from "@/api/protectedApis/class";

/* ================= PROPS ================= */

type ClassDetailsProps = {
  classId: string;
  teachers: Teacher[];
};

/* ================= COMPONENT ================= */

export default function ClassDetails({ classId, teachers }: ClassDetailsProps) {
  const [classData, setClassData] = useState<ClassDoc | null>(null);
  const [loading, setLoading] = useState(false);

  // Teacher search state
  const [teacherSearch, setTeacherSearch] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(teachers);

  /* ================= FETCH CLASS DATA ================= */

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const res = await getClassById(classId);
        setClassData(res);
      } catch (err) {
        toast.error("Failed to fetch class details");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  /* ================= FILTER TEACHERS ON SEARCH ================= */

  useEffect(() => {
    if (!teacherSearch.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [teacherSearch, teachers]);

  /* ================= ACTIONS ================= */

  const handleAddStudent = async (studentId: string) => {
    if (!classData) return;

    try {
      await addStudentToClass(classData._id, studentId);
      toast.success("Student added");

      // Refresh class data
      const updated = await getClassById(classId);
      setClassData(updated);
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!classData) return;

    try {
      await removeStudentFromClass(classData._id, studentId);

      setClassData({
        ...classData,
        students: classData.students.filter(
          (s) => s.studentUserId._id !== studentId
        ),
      });

      toast.success("Student removed");
    } catch (err) {
      toast.error("Failed to remove student");
    }
  };
  const handleAssignTeacher = async (teacher: any) => {
    if (!classData || !teacher) return;

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to add ${teacher.name} as the class teacher of ${classData.className} ${classData.section}?`
    );

    if (!isConfirmed) return;

    try {
      const updatedCls = await assignClassTeacher(
        classData._id,
        teacher.employeeUserId
      );

      setClassData(updatedCls);

      toast.success("Class teacher assigned");
    } catch (err) {
      toast.error("Failed to assign teacher");
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <Card className="col-span-8">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Loading class details...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <Card className="col-span-8">
      <CardHeader className="space-y-3">
        <h2 className="text-lg font-semibold">
          Class {classData.className} - {classData.section}
        </h2>

        {/* ================= TEACHER SELECTION ================= */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Class Teacher</label>

          <div className="flex items-center justify-between border rounded-md px-3 py-2">
            <span className="text-sm">
              {classData.classTeacherId?.name || "No teacher assigned"}
            </span>

            <EditTeacherDialog
              teachers={teachers}
              classData={classData}
              handleAssignTeacher={handleAssignTeacher}
            />
          </div>
        </div>

      </CardHeader>

      {/* ================= STUDENTS ================= */}
      <CardContent>
        <h3 className="font-medium mb-3">Students</h3>

        {classData.students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No students in this class
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Roll</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {classData.students.map((s) => (
                <tr key={s.studentUserId._id} className="border-b">
                  <td className="p-2">{s.rollNumber}</td>
                  <td className="p-2">{s.studentUserId.name}</td>
                  <td className="p-2 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleRemoveStudent(s.studentUserId._id)
                      }
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4">
          <Button
            onClick={() => handleAddStudent("STUDENT_ID")}
          >
            Add Student
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}