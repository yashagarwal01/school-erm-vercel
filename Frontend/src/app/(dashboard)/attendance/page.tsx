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
  status: "present" | "absent" | "leave" | "unmarked";
};

type AttendanceDoc = {
  _id: string;
  classId: {
    _id: string;
    className: string;
    section: string;
  };
  status: string;
  isHoliday: boolean;
  holidayReason?: string;
  holidayDescription?: string;
  students: StudentRow[];
};

export default function AttendancePage() {
  const schoolId = "695f94dd611d91e3f4b72bab";

  const [attendanceList, setAttendanceList] = useState<AttendanceDoc[]>([]);
  const [selectedAttendanceId, setSelectedAttendanceId] =
    useState<string | null>(null);
  const [activeAttendance, setActiveAttendance] =
    useState<AttendanceDoc | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState(new Date());

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
      const res: AttendanceDoc[] =
        await getAttendanceByClassAndDate(schoolId, dateStr);

      if (!res || res.length === 0) {
        setAttendanceList([]);
        setActiveAttendance(null);
        setAttendanceId(null);
        setStudents([]);
        return;
      }

      setAttendanceList(res);

      // ✅ select first class by default
      const first = res[0];
      setActiveAttendance(first);
      setAttendanceId(first._id);

      // ✅ CLONE students (no reference sharing)
      setStudents(first.students.map((s) => ({ ...s })));
    } finally {
      setLoading(false);
    }
  };

  fetchAttendance();
}, [selectedDate]);


  /* ================= HANDLERS ================= */

  const onClassChange = (id: string) => {
  const found = attendanceList.find((a) => a._id === id);
  if (!found) return;

  // ✅ full reset
  setActiveAttendance(found);
  setAttendanceId(found._id);
  setStudents(found.students.map((s) => ({ ...s })));
};


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

  await updateAttendance(attendanceId, {
    students: students.map((s) => ({
      studentUserId: s.studentUserId._id,
      rollNumber: s.rollNumber,
      status: s.status,
    })),
  });

  toast.success("Attendance saved");
};


  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  const meta = attendanceList.find(
    (a) => a._id === selectedAttendanceId
  );

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Mark Attendance</h2>
            {meta && (
              <p className="text-sm text-muted-foreground">
                Class {meta.classId.className} • Section{" "}
                {meta.classId.section}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {attendanceList.length > 1 && activeAttendance && (
  <select
    className="border rounded px-2 py-1 text-sm"
    value={activeAttendance._id}
    onChange={(e) => onClassChange(e.target.value)}
  >
    {attendanceList.map((a) => (
      <option key={a._id} value={a._id}>
        Class {a.classId.className} - {a.classId.section}
      </option>
    ))}
  </select>
)}


            <div className="text-sm font-medium">
              {format(time, "hh:mm:ss a")}
            </div>

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
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      {/* ================= HOLIDAY ================= */}
      {meta?.isHoliday && (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <h3 className="text-lg font-semibold text-red-600">
              {meta.holidayReason || "Holiday"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Attendance marking is disabled for this day.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ================= TABLE ================= */}
      {!meta?.isHoliday && students.length > 0 && (
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

                    <td colSpan={3} className="p-0">
                      <RadioGroup
                        value={
                          row.status === "unmarked"
                            ? undefined
                            : row.status
                        }
                        onValueChange={(v) =>
                          updateStatus(
                            row.studentUserId._id,
                            v as any
                          )
                        }
                        className="grid grid-cols-3"
                      >
                        <div className="p-3 text-center">
                          <RadioGroupItem
                            value="present"
                            className="
                              border-green-500
                              data-[state=checked]:bg-green-500
                              data-[state=checked]:border-green-500
                              data-[state=checked]:text-white
                            "
                          />
                        </div>

                        <div className="p-3 text-center">
                          <RadioGroupItem
                            value="absent"
                            className="
                              border-red-500
                              data-[state=checked]:bg-red-500
                              data-[state=checked]:border-red-500
                              data-[state=checked]:text-white
                            "
                          />
                        </div>

                        <div className="p-3 text-center">
                          <RadioGroupItem
                            value="leave"
                            className="
                              border-yellow-500
                              data-[state=checked]:bg-yellow-500
                              data-[state=checked]:border-yellow-500
                              data-[state=checked]:text-white
                            "
                          />
                        </div>
                      </RadioGroup>
                    </td>
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
