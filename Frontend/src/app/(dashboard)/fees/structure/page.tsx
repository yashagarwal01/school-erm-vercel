"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
} from "@/api/protectedApis/fees";
import { getAllClasses } from "@/api/protectedApis/class";

/* ================= TYPES ================= */

type Component = { name: string; amount: number };
type ClassItem = { _id: string; className: string; section?: string };
type FeeStructure = {
  _id: string;
  classId: ClassItem | string;
  academicYear: string;
  feeType: string;
  components: Component[];
  totalAmount: number;
};
type FormState = {
  classId: string;
  academicYear: string;
  feeType: string;
  components: Component[];
};

/* ================= HELPERS ================= */

const classLabel = (c: ClassItem) =>
  `${c.className}${c.section ? ` - ${c.section}` : ""}`;

const getCurrentAcademicYear = () => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3
    ? `${y}-${String(y + 1).slice(2)}`
    : `${y - 1}-${String(y).slice(2)}`;
};

const emptyForm = (): FormState => ({
  classId: "",
  academicYear: getCurrentAcademicYear(),
  feeType: "MONTHLY",
  components: [{ name: "", amount: 0 }],
});

/* ================= PAGE ================= */

export default function FeeStructurePage() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [filterClass, setFilterClass] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  /* ---- FETCH ---- */

  const fetchStructures = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterClass !== "all") params.classId = filterClass;
      if (filterYear !== "all") params.academicYear = filterYear;
      const data = await getFeeStructures(params);
      setStructures(data);
    } catch {
      toast.error("Failed to fetch fee structures");
    }
  };

  useEffect(() => {
    getAllClasses()
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  useEffect(() => {
    fetchStructures();
  }, [filterClass, filterYear]);

  /* ---- COMPONENT HELPERS ---- */

  const addRow = () =>
    setForm((f) => ({
      ...f,
      components: [...f.components, { name: "", amount: 0 }],
    }));

  const removeRow = (i: number) =>
    setForm((f) => ({
      ...f,
      components: f.components.filter((_, idx) => idx !== i),
    }));

  const updateRow = (i: number, field: keyof Component, value: string) => {
    setForm((f) => {
      const comps = [...f.components];
      comps[i] = {
        ...comps[i],
        [field]: field === "amount" ? Number(value) : value,
      };
      return { ...f, components: comps };
    });
  };

  const total = form.components.reduce((s, c) => s + (c.amount || 0), 0);

  /* ---- SUBMIT ---- */

  const handleSubmit = async () => {
    if (!form.classId || !form.academicYear) {
      toast.error("Select class and academic year");
      return;
    }
    if (form.components.some((c) => !c.name || c.amount <= 0)) {
      toast.error("Fill all fee components with valid amounts");
      return;
    }
    try {
      if (editId) {
        await updateFeeStructure(editId, { components: form.components });
        toast.success("Fee structure updated");
      } else {
        await createFeeStructure(form);
        toast.success("Fee structure created");
      }
      setOpen(false);
      setEditId(null);
      setForm(emptyForm());
      fetchStructures();
    } catch {
      toast.error("Failed to save fee structure");
    }
  };

  const openEdit = (s: FeeStructure) => {
    const cId =
      typeof s.classId === "object" ? (s.classId as ClassItem)._id : s.classId;
    setForm({
      classId: cId,
      academicYear: s.academicYear,
      feeType: s.feeType,
      components: s.components.map((c) => ({ ...c })),
    });
    setEditId(s._id);
    setOpen(true);
  };

  const getClassLabel = (s: FeeStructure) => {
    if (typeof s.classId === "object") return classLabel(s.classId as ClassItem);
    const found = classes.find((c) => c._id === s.classId);
    return found ? classLabel(found) : "-";
  };

  const uniqueYears = [...new Set(structures.map((s) => s.academicYear))];

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fees</h1>
      <FeesNav />

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fee Structures</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm(emptyForm());
                setEditId(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Structure
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Fee Structure" : "Create Fee Structure"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Class */}
              <div className="space-y-1">
                <Label>Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}
                  disabled={!!editId}
                >
                  <SelectTrigger>
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

              {/* Academic Year + Fee Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Academic Year</Label>
                  <Input
                    placeholder="2024-25"
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, academicYear: e.target.value }))
                    }
                    disabled={!!editId}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fee Type</Label>
                  <Select
                    value={form.feeType}
                    onValueChange={(v) => setForm((f) => ({ ...f, feeType: v }))}
                    disabled={!!editId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="ANNUALLY">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fee Components */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Fee Components</Label>
                  <Button variant="outline" size="sm" onClick={addRow}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>

                {form.components.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Tuition Fee"
                      className="flex-1"
                      value={c.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="₹ amount"
                      className="w-32"
                      value={c.amount || ""}
                      onChange={(e) => updateRow(i, "amount", e.target.value)}
                    />
                    {form.components.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end text-sm font-semibold text-slate-700 pr-12 pt-1">
                  Total: ₹ {total.toLocaleString("en-IN")}
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editId ? "Update Structure" : "Save Structure"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-44">
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

        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Academic year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ===== TABLE ===== */}
      <Card>
        <CardHeader>
          <span className="font-semibold text-base">All Fee Structures</span>
        </CardHeader>
        <CardContent>
          {structures.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No fee structures found. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead className="text-right">Total / Period</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">
                      {getClassLabel(s)}
                    </TableCell>
                    <TableCell>{s.academicYear}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                        {s.feeType}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {s.components.map((c) => c.name).join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹ {s.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
