"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  getAttendanceByClassAndDate,
  updateAttendance,
} from "@/api/protectedApis/attendance";

/* ================= TYPES ================= */

type StudentRow = {
  studentUserId: {
    _id: string;
    name: string;
  };
  rollNumber: number;
  status: "present" | "absent" | "leave" | "holiday";
};

export default function AttendancePage() {
  const classId = "695f94dd611d91e3f4b72bab";

  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState(new Date());

  const [meta, setMeta] = useState<{
    className: string;
    section: string;
    status: string;
  } | null>(null);

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  /* ================= FETCH ATTENDANCE ================= */

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const dateStr = format(selectedDate, "yyyy-MM-dd");

        const res = await getAttendanceByClassAndDate(
          classId,
          dateStr
        );

        setAttendanceId(res._id);
        setStudents(res.students || []);

        setMeta({
          className: res.classId?.className,
          section: res.classId?.section,
          status: res.status,
        });
      } catch (err: any) {
        setAttendanceId(null);
        setStudents([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId, selectedDate]);

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
    if (!attendanceId) return;

    try {
      await updateAttendance(attendanceId, {
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

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">

          {/* Left */}
          <div>
            <h2 className="text-lg font-semibold">
              Mark Attendance
            </h2>

            {meta && (
              <p className="text-sm text-muted-foreground">
                Class {meta.className} • Section {meta.section}
              </p>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="text-sm font-medium">
              {format(time, "hh:mm:ss a")}
            </div>

            {/* Calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        </CardHeader>
      </Card>

      {/* ================= NO DATA ================= */}
      {students.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No attendance data to show for selected date
          </CardContent>
        </Card>
      )}

      {/* ================= TABLE ================= */}
      {students.length > 0 && (
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
                  <tr
                    key={row.studentUserId._id}
                    className="border-b"
                  >
                    <td className="p-3">{row.rollNumber}</td>
                    <td className="p-3">
                      {row.studentUserId.name}
                    </td>

                    {/* ONE radio group per student */}
                    <RadioGroup
                      value={
                        row.status === "holiday"
                          ? undefined
                          : row.status
                      }
                      onValueChange={(v) =>
                        updateStatus(
                          row.studentUserId._id,
                          v as any
                        )
                      }
                      className="contents"
                    >
                      <td className="p-3 text-center align-middle">
                        <RadioGroupItem
                          value="present"
                          className="
      border-green-500
      data-[state=checked]:bg-green-500
      data-[state=checked]:border-green-500
      data-[state=checked]:text-green-500
    "
                        />
                      </td>

                      <td className="p-3 text-center align-middle">
                        <RadioGroupItem
                          value="absent"
                          className="
      border-red-500
      data-[state=checked]:bg-red-500
      data-[state=checked]:border-red-500
      data-[state=checked]:text-white
    "
                        />
                      </td>

                      <td className="p-3 text-center align-middle">
                        <RadioGroupItem
                          value="leave"
                          className="
      border-yellow-500
      data-[state=checked]:bg-yellow-500
      data-[state=checked]:border-yellow-500
      data-[state=checked]:text-white
    "
                        />
                      </td>


                    </RadioGroup>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ================= SAVE ================= */}
      <div className="flex justify-end">
        <Button
          onClick={saveAttendance}
          disabled={!attendanceId || students.length === 0}
        >
          Save Attendance
        </Button>
      </div>
    </div>
  );
}
