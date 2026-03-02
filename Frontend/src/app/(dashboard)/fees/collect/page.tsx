"use client";

import { useEffect, useState } from "react";
import { Search, FileText } from "lucide-react";
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
import {
  collectFee,
  getStudentFeeOverview,
  downloadReceipt,
} from "@/api/protectedApis/fees";
import { getAllClasses, getClassById } from "@/api/protectedApis/class";

/* ================= TYPES ================= */

type ClassItem = { _id: string; className: string; section?: string };
type Student = {
  studentUserId: { _id: string; name: string; loginId: string };
  rollNumber: number;
};
type MonthEntry = {
  month: string;
  dueAmount: number;
  status: "PAID" | "PARTIAL" | "PENDING";
  payment: { _id: string; amountPaid: number; paymentMode: string } | null;
};
type Overview = {
  classId: string;
  structure: { _id: string; totalAmount: number; components: any[] } | null;
  months: MonthEntry[];
  summary: {
    totalPaid: number;
    totalDue: number;
    paidMonths: number;
    pendingMonths: number;
  };
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

const formatMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

/* ================= PAGE ================= */

export default function FeeCollectionPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [overview, setOverview] = useState<Overview | null>(null);

  // Collect form
  const [selectedMonth, setSelectedMonth] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("CASH");
  const [txnId, setTxnId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [collecting, setCollecting] = useState(false);

  /* ---- LOAD CLASSES ---- */

  useEffect(() => {
    getAllClasses()
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  /* ---- LOAD STUDENTS WHEN CLASS SELECTED ---- */

  useEffect(() => {
    if (!selectedClass) return;
    setStudents([]);
    setSelectedStudent(null);
    setOverview(null);
    getClassById(selectedClass)
      .then((cls: any) => setStudents(cls?.students ?? []))
      .catch(() => toast.error("Failed to load students"));
  }, [selectedClass]);

  /* ---- LOAD STUDENT OVERVIEW ---- */

  const loadOverview = async (student: Student) => {
    setSelectedStudent(student);
    setOverview(null);
    try {
      const data = await getStudentFeeOverview(
        student.studentUserId._id,
        academicYear
      );
      setOverview(data);
      const firstPending = data.months.find(
        (m: MonthEntry) => m.status === "PENDING"
      );
      if (firstPending) {
        setSelectedMonth(firstPending.month);
        setPayAmount(String(firstPending.dueAmount));
      }
    } catch {
      toast.error("Failed to load student fee overview");
    }
  };

  /* ---- COLLECT ---- */

  const handleCollect = async () => {
    if (!selectedStudent || !selectedMonth || !payAmount) {
      toast.error("Select student, month and enter amount");
      return;
    }
    if (!overview?.structure) {
      toast.error("No fee structure found for this student's class");
      return;
    }
    setCollecting(true);
    try {
      await collectFee({
        studentUserId: selectedStudent.studentUserId._id,
        classId: overview.classId,
        feeStructureId: overview.structure._id,
        month: selectedMonth,
        amountPaid: Number(payAmount),
        paymentMode: payMode,
        transactionId: txnId || undefined,
        remarks: remarks || undefined,
      });
      toast.success("Fee collected successfully");
      setTxnId("");
      setRemarks("");
      await loadOverview(selectedStudent);
    } catch {
      toast.error("Failed to collect fee");
    } finally {
      setCollecting(false);
    }
  };

  /* ---- FILTERED STUDENTS ---- */

  const filteredStudents = students.filter((s) => {
    const q = searchText.toLowerCase();
    return (
      s.studentUserId?.name?.toLowerCase().includes(q) ||
      s.studentUserId?.loginId?.toLowerCase().includes(q)
    );
  });

  const pendingMonths =
    overview?.months.filter((m) => m.status === "PENDING") ?? [];

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fees</h1>
      <FeesNav />

      {/* ===== FILTERS ===== */}
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
            className="w-36"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== STUDENT LIST ===== */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <span className="font-semibold text-base">Select Student</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-8"
                placeholder="Search by name or ID"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {selectedClass
                    ? "No students found"
                    : "Select a class first"}
                </p>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s.studentUserId._id}
                    onClick={() => loadOverview(s)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                      selectedStudent?.studentUserId._id ===
                      s.studentUserId._id
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium">{s.studentUserId.name}</div>
                    <div className="text-xs opacity-70">
                      Roll {s.rollNumber} · {s.studentUserId.loginId}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* ===== FEE STATUS + COLLECTION ===== */}
        <div className="lg:col-span-2 space-y-4">
          {!overview ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Select a student to view their fee status
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ₹ {overview?.summary?.totalPaid.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹ {overview?.summary?.totalDue.toLocaleString("en-IN")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500">Months Due</p>
                    <p className="text-xl font-bold">
                      {overview?.summary?.pendingMonths}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Status Table */}
              <Card>
                <CardHeader>
                  <span className="font-semibold text-sm">
                    Monthly Fee Status — {selectedStudent?.studentUserId.name}
                  </span>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Due</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.months.map((m) => (
                        <TableRow key={m.month}>
                          <TableCell>{formatMonth(m.month)}</TableCell>
                          <TableCell className="text-right">
                            ₹ {m.dueAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            {m.payment
                              ? `₹ ${m.payment.amountPaid.toLocaleString(
                                  "en-IN"
                                )}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {m.payment?.paymentMode ?? "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                m.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : m.status === "PARTIAL"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {m.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {m.payment && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Download Receipt"
                                onClick={() =>
                                  downloadReceipt(m.payment!._id)
                                }
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Collect Form */}
              {pendingMonths.length > 0 && (
                <Card>
                  <CardHeader>
                    <span className="font-semibold text-sm">Collect Fee</span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Month</Label>
                        <Select
                          value={selectedMonth}
                          onValueChange={(v) => {
                            setSelectedMonth(v);
                            const entry = overview.months.find(
                              (m) => m.month === v
                            );
                            if (entry)
                              setPayAmount(String(entry.dueAmount));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {pendingMonths.map((m) => (
                              <SelectItem key={m.month} value={m.month}>
                                {formatMonth(m.month)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Payment Mode</Label>
                        <Select value={payMode} onValueChange={setPayMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Transaction ID (optional)</Label>
                        <Input
                          placeholder="UPI / bank ref"
                          value={txnId}
                          onChange={(e) => setTxnId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Remarks (optional)</Label>
                      <Input
                        placeholder="Any notes"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCollect}
                      disabled={collecting}
                    >
                      {collecting ? "Processing..." : "Collect Fee"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
