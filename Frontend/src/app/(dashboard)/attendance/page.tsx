"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  getAttendanceByClassAndDate,
  updateAttendance,
} from "@/api/protectedApis/attendance";

export default function AttendancePage() {
  const classId = "695f94dd611d91e3f4b72bab";

  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ATTENDANCE ================= */

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const attendance = await getAttendanceByClassAndDate(
          classId,
          today
        );

        setAttendanceId(attendance._id);
        setStudents(attendance.students);
      } catch (err: any) {
        toast.error(err.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId]);

  /* ================= HANDLERS ================= */

  const updateStatus = (
    studentId: string,
    status: "present" | "absent" | "leave"
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentUserId._id === studentId
          ? { ...s, status }
          : s
      )
    );
  };

  const saveAttendance = async () => {
    try {
      await updateAttendance(attendanceId!, {
        students: students.map((s) => ({
          studentUserId: s.studentUserId._id,
          rollNumber: s.rollNumber,
          status: s.status,
        })),
      });

      toast.success("Attendance saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save attendance");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* ===== Header ===== */}
      <Card>
        <CardHeader className="text-lg font-semibold">
          Mark Attendance
        </CardHeader>
      </Card>

      {/* ===== Student List ===== */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Roll</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-center">Present</th>
                <th className="p-3 text-center">Absent</th>
                <th className="p-3 text-center">Leave</th>
              </tr>
            </thead>

            <tbody>
  {students.map((row) => (
    <tr key={row.studentUserId._id} className="border-b">
      <td className="p-3">{row.rollNumber}</td>
      <td className="p-3">{row.studentUserId.name}</td>

      {/* 🔑 ONE RadioGroup */}
      <RadioGroup
        value={row.status}
        onValueChange={(v) =>
          updateStatus(
            row.studentUserId._id,
            v as "present" | "absent" | "leave"
          )
        }
        className="contents"  // 👈 IMPORTANT
      >
        <td className="text-center">
          <RadioGroupItem value="present" />
        </td>

        <td className="text-center">
          <RadioGroupItem value="absent" />
        </td>

        <td className="text-center">
          <RadioGroupItem value="leave" />
        </td>
      </RadioGroup>
    </tr>
  ))}
</tbody>

          </table>
        </CardContent>
      </Card>

      {/* ===== Save Button ===== */}
      <div className="flex justify-end">
        <Button onClick={saveAttendance}>
          Save Attendance
        </Button>
      </div>
    </div>
  );
}
