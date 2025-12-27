"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";

/* ================= MOCK DATA ================= */

const mockEmployees = [
  {
    id: 1,
    employeeId: "EMP-001",
    name: "Amit Verma",
    type: "Teacher",
    email: "amit@gmail.com",
    phone: "9876543210",
    status: "Active",
  },
];

/* ================= CONSTANTS ================= */

const EMPLOYEE_TYPES = [
  "Teacher",
  "Principal",
  "VicePrincipal",
  "Accountant",
  "Clerk",
  "Librarian",
  "Peon",
  "Driver",
  "Admin",
  "Other",
];

const STANDARDS = [
  "1","2","3","4","5","6","7","8","9","10","11","12"
];

/* ================= PAGE ================= */

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  /* ================= FORM STATE ================= */

  const [form, setForm] = useState<any>({
    employeeId: "",
    employeeType: "",
    standards: [],
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    contact: {
      phone: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
    },
    salary: "",
    joiningDate: "",
    leavingDate: "",
    status: "Active",
  });

  /* ================= HELPERS ================= */

  const updateField = (path: string, value: any) => {
    setForm((prev: any) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const toggleStandard = (std: string) => {
    setForm((prev: any) => ({
      ...prev,
      standards: prev.standards.includes(std)
        ? prev.standards.filter((s: string) => s !== std)
        : [...prev.standards, std],
    }));
  };

  const resetForm = () => {
    setStep(1);
    setForm({
      employeeId: "",
      employeeType: "",
      standards: [],
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      contact: {
        phone: "",
        email: "",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        },
      },
      salary: "",
      joiningDate: "",
      leavingDate: "",
      status: "Active",
    });
  };

  /* ================= SEARCH ================= */

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return mockEmployees.filter(
      (e) =>
        e.employeeId.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q)
    );
  }, [search]);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Employees</h1>

        <div className="flex gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.employeeId}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.type}</TableCell>
                  <TableCell>{e.phone}</TableCell>
                  <TableCell>{e.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= ADD EMPLOYEE DIALOG ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Employee — Step {step} of 3
            </DialogTitle>
          </DialogHeader>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Employee ID *</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) =>
                    updateField("employeeId", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Employee Type *</Label>
                <Select
                  value={form.employeeType}
                  onValueChange={(v) => updateField("employeeType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name *"
                  value={form.firstName}
                  onChange={(e) =>
                    updateField("firstName", e.target.value)
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) =>
                    updateField("lastName", e.target.value)
                  }
                />
              </div>

              <Input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  updateField("dob", e.target.value)
                }
              />

              <Input
                placeholder="Phone *"
                value={form.contact.phone}
                onChange={(e) =>
                  updateField("contact.phone", e.target.value)
                }
              />

              <Button
                className="w-full"
                disabled={
                  !form.employeeId ||
                  !form.employeeType ||
                  !form.firstName ||
                  !form.contact.phone
                }
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                placeholder="Email"
                value={form.contact.email}
                onChange={(e) =>
                  updateField("contact.email", e.target.value)
                }
              />

              <Input
                placeholder="Salary"
                type="number"
                value={form.salary}
                onChange={(e) =>
                  updateField("salary", e.target.value)
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Joining Date *</Label>
                  <Input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      updateField("joiningDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Leaving Date</Label>
                  <Input
                    type="date"
                    value={form.leavingDate}
                    onChange={(e) =>
                      updateField("leavingDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {form.employeeType === "Teacher" && (
                <div>
                  <Label>Standards (Classes)</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {STANDARDS.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={
                          form.standards.includes(s)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleStandard(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Review</Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-2 text-sm">
              <p><b>ID:</b> {form.employeeId}</p>
              <p><b>Name:</b> {form.firstName} {form.lastName}</p>
              <p><b>Type:</b> {form.employeeType}</p>
              <p><b>Phone:</b> {form.contact.phone}</p>
              <p><b>Salary:</b> {form.salary || "—"}</p>
              <p><b>Joining:</b> {form.joiningDate}</p>
              <p><b>Leaving:</b> {form.leavingDate || "—"}</p>
              <p><b>Standards:</b> {form.standards.join(", ") || "—"}</p>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    console.log("EMPLOYEE DATA:", form);
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Save Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
