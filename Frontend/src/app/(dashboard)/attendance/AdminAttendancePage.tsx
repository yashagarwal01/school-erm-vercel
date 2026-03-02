"use client";

import { useEffect, useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Plus, ShieldCheck, Eye } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

import {
  adminGetAttendanceByClassAndDate,
  adminGetAttendanceRange,
  updateAttendancePermissions,
} from "@/api/protectedApis/attendance";
import { getEmployee } from "@/api/protectedApis/admin";

/* ─── Types ─── */

type ClassOption = { _id: string; className: string; section: string };

type StudentRow = {
  studentUserId: { _id: string; name: string };
  rollNumber: number;
  status: "present" | "absent" | "leave" | "holiday" | "unmarked";
};

type AttendanceDoc = {
  _id: string;
  classId: { _id: string; className: string; section: string };
  date: string;
  status: "not_taken" | "taken";
  isHoliday: boolean;
  holidayReason?: string;
  takenBy?: { _id: string; name: string };
  allowedToTake: { _id: string; name: string }[];
  students: StudentRow[];
};

type Employee = {
  id: string;
  name: string;
  employeeUserId: string;
};

const STATUS_COLOR: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  leave: "bg-amber-100 text-amber-700",
  holiday: "bg-sky-100 text-sky-700",
  unmarked: "bg-gray-100 text-gray-500",
};

/* ─── Class dropdown fetched from existing /api/classes ─── */
import { getAllClasses } from "@/api/protectedApis/class";

/* ─── Component ─── */

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState<"view" | "permissions">("view");

  /* ── Shared: class list ── */
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    getAllClasses().then((res: any) => {
      const list: ClassOption[] = (res?.data ?? res ?? []).map((c: any) => ({
        _id: c._id,
        className: c.className,
        section: c.section ?? "",
      }));
      setClasses(list);
      if (list.length > 0) setSelectedClassId(list[0]._id);
    });
  }, []);

  /* ══════════════════════════════════════
      TAB 1 — VIEW ATTENDANCE
  ══════════════════════════════════════ */
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewRecord, setViewRecord] = useState<AttendanceDoc | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchViewAttendance = async () => {
    if (!selectedClassId) return;
    setViewLoading(true);
    try {
      const dateStr = format(viewDate, "yyyy-MM-dd");
      const res = await adminGetAttendanceByClassAndDate(selectedClassId, dateStr);
      setViewRecord(res ?? null);
    } catch {
      setViewRecord(null);
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view" && selectedClassId) {
      fetchViewAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClassId, viewDate]);

  /* ══════════════════════════════════════
      TAB 2 — MANAGE PERMISSIONS
  ══════════════════════════════════════ */
  const [permMonth, setPermMonth] = useState<Date>(new Date());
  const [permRecords, setPermRecords] = useState<AttendanceDoc[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllowed, setEditAllowed] = useState<{ _id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [addTeacherId, setAddTeacherId] = useState<string>("");

  // Fetch employees once
  useEffect(() => {
    getEmployee(0, 0, "").then((res: any) => {
      const list: Employee[] = (res?.data?.data ?? []).map((e: any) => ({
        id: e.id,
        name: e.name,
        employeeUserId: e.employeeUserId,
      }));
      setEmployees(list);
    });
  }, []);

  const fetchPermRecords = async () => {
    if (!selectedClassId) return;
    setPermLoading(true);
    setEditingId(null);
    try {
      const from = format(startOfMonth(permMonth), "yyyy-MM-dd");
      const to = format(endOfMonth(permMonth), "yyyy-MM-dd");
      const res = await adminGetAttendanceRange(selectedClassId, from, to);
      setPermRecords(res ?? []);
    } catch {
      setPermRecords([]);
    } finally {
      setPermLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "permissions" && selectedClassId) {
      fetchPermRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedClassId, permMonth]);

  const startEditing = (record: AttendanceDoc) => {
    setEditingId(record._id);
    setEditAllowed([...record.allowedToTake]);
    setAddTeacherId("");
  };

  const removeTeacher = (userId: string) => {
    setEditAllowed((prev) => prev.filter((t) => t._id !== userId));
  };

  const addTeacher = () => {
    if (!addTeacherId) return;
    const emp = employees.find((e) => e.employeeUserId === addTeacherId);
    if (!emp) return;
    if (editAllowed.some((t) => t._id === addTeacherId)) return;
    setEditAllowed((prev) => [...prev, { _id: addTeacherId, name: emp.name }]);
    setAddTeacherId("");
  };

  const savePermissions = async (attendanceId: string) => {
    try {
      await updateAttendancePermissions(
        attendanceId,
        editAllowed.map((t) => t._id)
      );
      toast.success("Permissions updated");
      setEditingId(null);
      fetchPermRecords();
    } catch {
      toast.error("Failed to update permissions");
    }
  };

  /* ─── shared class + date controls ─── */
  const ClassSelector = () => (
    <select
      className="border rounded px-3 py-1.5 text-sm"
      value={selectedClassId}
      onChange={(e) => setSelectedClassId(e.target.value)}
    >
      {classes.map((c) => (
        <option key={c._id} value={c._id}>
          Class {c.className} {c.section ? `– ${c.section}` : ""}
        </option>
      ))}
    </select>
  );

  /* ══════════════════════════════════════
      RENDER
  ══════════════════════════════════════ */
  return (
    <div className="p-6 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Attendance — Admin</h1>

        {/* Tabs */}
        <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === "view"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Eye className="w-4 h-4" />
            View Attendance
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === "permissions"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Manage Permissions
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TAB 1 — VIEW ATTENDANCE
      ══════════════════════════════════════ */}
      {activeTab === "view" && (
        <>
          {/* Controls */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 flex-wrap py-4">
              <ClassSelector />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(viewDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={viewDate}
                    onSelect={(d) => d && setViewDate(d)}
                  />
                </PopoverContent>
              </Popover>

              {viewRecord && (
                <span
                  className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                    viewRecord.isHoliday
                      ? "bg-sky-100 text-sky-700"
                      : viewRecord.status === "taken"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {viewRecord.isHoliday
                    ? `Holiday${viewRecord.holidayReason ? ` — ${viewRecord.holidayReason}` : ""}`
                    : viewRecord.status === "taken"
                    ? "Taken"
                    : "Not Taken"}
                </span>
              )}
            </CardHeader>
          </Card>

          {/* Content */}
          {viewLoading ? (
            <p className="text-sm text-gray-400 p-4">Loading…</p>
          ) : !viewRecord ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-gray-400">
                No attendance record found for this class on the selected date.
              </CardContent>
            </Card>
          ) : viewRecord.isHoliday ? (
            <Card>
              <CardContent className="p-10 text-center space-y-1">
                <p className="text-sky-700 font-semibold text-lg">
                  {viewRecord.holidayReason ?? "Holiday"}
                </p>
                <p className="text-sm text-gray-400">
                  No attendance for this day.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              {viewRecord.takenBy && (
                <div className="px-5 pt-4 text-sm text-gray-500">
                  Marked by:{" "}
                  <span className="font-medium text-gray-700">
                    {viewRecord.takenBy.name}
                  </span>
                </div>
              )}
              <CardContent className="p-0 mt-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <th className="p-3 text-left">Roll</th>
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewRecord.students.map((row) => (
                      <tr key={row.studentUserId._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{row.rollNumber}</td>
                        <td className="p-3 text-sm">{row.studentUserId.name}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              STATUS_COLOR[row.status] ?? STATUS_COLOR.unmarked
                            }`}
                          >
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — MANAGE PERMISSIONS
      ══════════════════════════════════════ */}
      {activeTab === "permissions" && (
        <>
          {/* Controls */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 flex-wrap py-4">
              <ClassSelector />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(permMonth, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={permMonth}
                    onSelect={(d) => d && setPermMonth(d)}
                  />
                </PopoverContent>
              </Popover>

              <p className="ml-auto text-xs text-gray-400">
                {permRecords.length} records
              </p>
            </CardHeader>
          </Card>

          {/* Records table */}
          {permLoading ? (
            <p className="text-sm text-gray-400 p-4">Loading…</p>
          ) : permRecords.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-gray-400">
                No attendance records for this month.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Allowed Teachers</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permRecords.map((rec) => (
                      <Fragment key={rec._id}>
                        <tr className="border-b hover:bg-gray-50 align-top">
                          <td className="p-3 text-sm font-medium">
                            {format(new Date(rec.date), "dd MMM, EEE")}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                rec.isHoliday
                                  ? "bg-sky-100 text-sky-700"
                                  : rec.status === "taken"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {rec.isHoliday ? "Holiday" : rec.status === "taken" ? "Taken" : "Not Taken"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {rec.allowedToTake.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">None</span>
                              ) : (
                                rec.allowedToTake.map((t) => (
                                  <span
                                    key={t._id}
                                    className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full"
                                  >
                                    {t.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            {!rec.isHoliday && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  editingId === rec._id
                                    ? setEditingId(null)
                                    : startEditing(rec)
                                }
                              >
                                {editingId === rec._id ? "Cancel" : "Edit"}
                              </Button>
                            )}
                          </td>
                        </tr>

                        {/* ─── Inline editor ─── */}
                        {editingId === rec._id && (
                          <tr className="bg-violet-50 border-b">
                            <td colSpan={4} className="p-4">
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-gray-700">
                                  Edit permissions for{" "}
                                  {format(new Date(rec.date), "dd MMM yyyy")}
                                </p>

                                {/* Current teachers */}
                                <div className="flex flex-wrap gap-2">
                                  {editAllowed.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">
                                      No teachers assigned
                                    </span>
                                  )}
                                  {editAllowed.map((t) => (
                                    <span
                                      key={t._id}
                                      className="flex items-center gap-1 text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-full"
                                    >
                                      {t.name}
                                      <button
                                        onClick={() => removeTeacher(t._id)}
                                        className="hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>

                                {/* Add teacher */}
                                <div className="flex items-center gap-2">
                                  <select
                                    className="border rounded px-3 py-1.5 text-sm flex-1 max-w-xs"
                                    value={addTeacherId}
                                    onChange={(e) => setAddTeacherId(e.target.value)}
                                  >
                                    <option value="">Select teacher to add…</option>
                                    {employees
                                      .filter(
                                        (e) =>
                                          e.employeeUserId &&
                                          !editAllowed.some((t) => t._id === e.employeeUserId)
                                      )
                                      .map((e) => (
                                        <option key={e.employeeUserId} value={e.employeeUserId}>
                                          {e.name}
                                        </option>
                                      ))}
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addTeacher}
                                    disabled={!addTeacherId}
                                    className="gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </Button>
                                </div>

                                {/* Save */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => savePermissions(rec._id)}
                                  >
                                    Save Permissions
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
