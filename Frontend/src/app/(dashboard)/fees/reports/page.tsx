"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import FeesNav from "@/components/fees/FeesNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getClassFeeOverview } from "@/api/protectedApis/fees";
import { downloadReceipt } from "@/api/protectedApis/fees";
import { getAllClasses } from "@/api/protectedApis/class";

/* ================= TYPES ================= */

type ClassItem = { _id: string; className: string; section?: string };
type StudentRow = {
  studentUserId: { _id: string; name: string; loginId: string };
  rollNumber: number;
  status: "PAID" | "PARTIAL" | "PENDING";
  dueAmount: number;
  payment: {
    _id: string;
    amountPaid: number;
    paymentMode: string;
    paidDate: string;
  } | null;
};

const classLabel = (c: ClassItem) =>
  `${c.className}${c.section ? ` - ${c.section}` : ""}`;

const getCurrentAcademicYear = () => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3
    ? `${y}-${String(y + 1).slice(2)}`
    : `${y - 1}-${String(y).slice(2)}`;
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

/* ================= PAGE ================= */

export default function FeeReportsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllClasses()
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  const handleLoad = async () => {
    if (!selectedClass) {
      toast.error("Select a class");
      return;
    }
    try {
      const data = await getClassFeeOverview(selectedClass, academicYear, month);
      setRows(data);
      setLoaded(true);
    } catch {
      toast.error("Failed to load fee report");
    }
  };

  /* ---- SUMMARY ---- */

  const totalStudents = rows.length;
  const paidCount = rows.filter((r) => r.status === "PAID").length;
  const pendingCount = rows.filter((r) => r.status === "PENDING").length;
  const totalCollected = rows.reduce(
    (s, r) => s + (r.payment?.amountPaid ?? 0),
    0
  );
  const totalDue = rows
    .filter((r) => r.status === "PENDING")
    .reduce((s, r) => s + r.dueAmount, 0);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fees</h1>
      <FeesNav />

      {/* ===== FILTERS ===== */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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

            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                className="w-32"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Month (YYYY-MM)</Label>
              <Input
                className="w-36"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="2025-06"
              />
            </div>

            <Button onClick={handleLoad}>Load Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== SUMMARY CARDS ===== */}
      {loaded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Paid</p>
              <p className="text-2xl font-bold text-emerald-600">
                {paidCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Collected</p>
              <p className="text-xl font-bold text-emerald-600">
                ₹ {totalCollected.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                Due: ₹ {totalDue.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== TABLE ===== */}
      {loaded && (
        <Card>
          <CardHeader>
            <span className="font-semibold text-base">
              {loaded && month ? `Fee Report — ${formatMonth(month)}` : "Fee Report"}
            </span>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No data found for the selected filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Login ID</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows
                    .slice()
                    .sort((a, b) => a.rollNumber - b.rollNumber)
                    .map((r) => (
                      <TableRow key={r.studentUserId._id}>
                        <TableCell>{r.rollNumber}</TableCell>
                        <TableCell className="font-medium">
                          {r.studentUserId.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {r.studentUserId.loginId}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹ {r.dueAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.payment
                            ? `₹ ${r.payment.amountPaid.toLocaleString(
                                "en-IN"
                              )}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.payment?.paymentMode ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.payment?.paidDate
                            ? new Date(r.payment.paidDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.status === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : r.status === "PARTIAL"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {r.payment && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download Receipt"
                              onClick={() => downloadReceipt(r.payment!._id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
