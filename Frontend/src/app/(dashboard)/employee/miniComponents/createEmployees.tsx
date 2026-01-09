"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { postStudent } from "@/api/protectedApis/admin";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  createEmployee: (payload: any) => void;
};


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

const STANDARDS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const SECTIONS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female", "Other"];

export default function AddEmployeeDialog({ open, createEmployee, setOpen }: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<any>({
    // employeeId: "",
    employeeType: "",
    standards: [],
    isClassTeacher: false,
    classTeacher: {
      class: "",
      section: "",
    },
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    contact: {
      phone: "",
      email: "",
    },
    salary: "",
    joiningDate: "",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Employee — Step {step} of 3</DialogTitle>
          </DialogHeader>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* <Input
                placeholder="Employee ID *"
                value={form.employeeId}
                // disabled
                onChange={(e) => updateField("employeeId", e.target.value)}
              /> */}

              <Select
                value={form.employeeType}
                onValueChange={(v) => updateField("employeeType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Employee Type *" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name *"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
                <Input
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>

              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender *" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                />
              </div>

              <Input
                placeholder="Phone *"
                value={form.contact.phone}
                onChange={(e) => updateField("contact.phone", e.target.value)}
              />

              <Input
                placeholder="Email *"
                value={form.contact.email}
                onChange={(e) => updateField("contact.email", e.target.value)}
              />

              <Button
                className="w-full"
                disabled={
                  // !form.employeeId ||
                  !form.employeeType ||
                  !form.firstName ||
                  !form.contact.phone ||
                  !form.contact.email ||
                  !form.dob
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
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) => updateField("salary", e.target.value)}
              />

              <div>
                <Label>Joining Date *</Label>
                <Input
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => updateField("joiningDate", e.target.value)}
                />
              </div>

              {form.employeeType === "Teacher" && (
                <>
                  <div>
                    <Label>Teaching Standards</Label>
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

                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      checked={form.isClassTeacher}
                      onCheckedChange={(v) =>
                        updateField("isClassTeacher", v)
                      }
                    />
                    <Label>Assign as Class Teacher</Label>
                  </div>

                  {form.isClassTeacher && (
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={form.classTeacher.class}
                        onValueChange={(v) =>
                          updateField("classTeacher.class", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {STANDARDS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={form.classTeacher.section}
                        onValueChange={(v) =>
                          updateField("classTeacher.section", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  disabled={!form.joiningDate}
                  onClick={() => setStep(3)}
                >
                  Review
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-2 text-sm">
              <p><b>Name:</b> {form.firstName} {form.lastName}</p>
              <p><b>DOB:</b> {form.dob}</p>
              <p><b>Phone:</b> {form.contact.phone}</p>
              <p><b>Email:</b> {form.contact.email}</p>

              {form.isClassTeacher && (
                <p>
                  <b>Class Teacher:</b> Class {form.classTeacher.class} - {form.classTeacher.section}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  onClick={() => {
                    createEmployee(form);
                    setOpen(false);
                  }}
                >
                  Save Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
  );
}
