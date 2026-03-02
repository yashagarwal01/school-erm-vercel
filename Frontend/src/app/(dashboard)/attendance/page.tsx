"use client";

import { useEffect, useState } from "react";
import StudentAttendancePage from "./StudentAttendancePage";
import TeacherAttendancePage from "./TeacherAttendancePage";
import AdminAttendancePage from "./AdminAttendancePage";
import { getloginType } from "@/lib/storage";

export default function AttendancePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loginType = getloginType()
    setRole(loginType ?? "student");
  }, []);

  if (!role) return null;

  if (role === "admin" || role === "superAdmin") {
    return <AdminAttendancePage />;
  }

  if (role === "teacher") {
    return <TeacherAttendancePage />;
  }

  return <StudentAttendancePage />;
}