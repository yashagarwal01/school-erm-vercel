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
import { postStudent } from "@/api/protectedApis/admin";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open:boolean) => void;
  createStudent: (payload: any) => void;
};

export default function AddStudentDialog({ open, createStudent,setOpen }: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    studentId: "",
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
    guardian: {
      name: "",
      relation: "",
      phone: "",
      email: "",
    },
    father: {
      name: "",
      contact: { phone: "", email: "" },
    },
    mother: {
      name: "",
      contact: { phone: "", email: "" },
    },
    status: "Active",
  });

  const validateParentDetails = () => {
    const hasFather = form.father.name.trim() !== "";
    const hasMother = form.mother.name.trim() !== "";

    // Rule 1: At least one parent
    if (!hasFather && !hasMother) {
      return {
        valid: false,
        message: "At least one parent (Father or Mother) is required.",
      };
    }

    // Rule 2: If father exists, contact required
    if (
      hasFather &&
      !form.father.contact.phone.trim() &&
      !form.father.contact.email.trim()
    ) {
      return {
        valid: false,
        message: "Father contact (phone or email) is required.",
      };
    }

    // Rule 3: If mother exists, contact required
    if (
      hasMother &&
      !form.mother.contact.phone.trim() &&
      !form.mother.contact.email.trim()
    ) {
      return {
        valid: false,
        message: "Mother contact (phone or email) is required.",
      };
    }

    return { valid: true, message: "" };
  };

  const parentValidation = validateParentDetails();

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

  const resetForm = () => {
    setStep(1);
    setForm({
      studentId: "",
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
      guardian: {
        name: "",
        relation: "",
        phone: "",
        email: "",
      },
      father: {
        name: "",
        contact: { phone: "", email: "" },
      },
      mother: {
        name: "",
        contact: { phone: "", email: "" },
      },
      status: "Active",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Student — Step {step} of 3
            </DialogTitle>
          </DialogHeader>

          {/* ================= STEP 1: REQUIRED ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Student ID *</Label>
                <Input
                  value={form.studentId}
                  onChange={(e) =>
                    updateField("studentId", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      updateField("firstName", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      updateField("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    updateField("dob", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) => updateField("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div>
                <Label>Phone *</Label>
                <Input
                  value={form.contact.phone}
                  onChange={(e) =>
                    updateField("contact.phone", e.target.value)
                  }
                />
              </div>

              <Button
                className="w-full"
                disabled={
                  !form.studentId ||
                  !form.firstName ||
                  !form.dob ||
                  !form.contact.phone
                }
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </div>
          )}

          {/* ================= STEP 2: OPTIONAL DETAILS ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {!parentValidation.valid && (
                <p className="text-sm text-red-500">
                  {parentValidation.message}
                </p>
              )}
              <h4 className="font-semibold">Contact</h4>

              <Input
                placeholder="Email"
                value={form.contact.email}
                onChange={(e) =>
                  updateField("contact.email", e.target.value)
                }
              />

              <Input
                placeholder="Street"
                value={form.contact.address.street}
                onChange={(e) =>
                  updateField("contact.address.street", e.target.value)
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={form.contact.address.city}
                  onChange={(e) =>
                    updateField("contact.address.city", e.target.value)
                  }
                />
                <Input
                  placeholder="State"
                  value={form.contact.address.state}
                  onChange={(e) =>
                    updateField("contact.address.state", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Zip"
                  value={form.contact.address.zip}
                  onChange={(e) =>
                    updateField("contact.address.zip", e.target.value)
                  }
                />
                <Input
                  placeholder="Country"
                  value={form.contact.address.country}
                  onChange={(e) =>
                    updateField("contact.address.country", e.target.value)
                  }
                />
              </div>

              <h4 className="font-semibold">Father</h4>

              <Input
                placeholder="Father Name"
                value={form.father.name}
                onChange={(e) =>
                  updateField("father.name", e.target.value)
                }
              />
              <Input
                placeholder="Father Phone"
                value={form.father.contact.phone}
                onChange={(e) =>
                  updateField("father.contact.phone", e.target.value)
                }
              />
              <Input
                placeholder="Father Email"
                value={form.father.contact.email}
                onChange={(e) =>
                  updateField("father.contact.email", e.target.value)
                }
              />

              <h4 className="font-semibold">Mother</h4>

              <Input
                placeholder="Mother Name"
                value={form.mother.name}
                onChange={(e) =>
                  updateField("mother.name", e.target.value)
                }
              />
              <Input
                placeholder="Mother Phone"
                value={form.mother.contact.phone}
                onChange={(e) =>
                  updateField("mother.contact.phone", e.target.value)
                }
              />
              <Input
                placeholder="Mother Email"
                value={form.mother.contact.email}
                onChange={(e) =>
                  updateField("mother.contact.email", e.target.value)
                }
              />

              <h4 className="font-semibold">Guardian (Optional)</h4>

              <Input
                placeholder="Guardian Name"
                value={form.guardian.name}
                onChange={(e) =>
                  updateField("guardian.name", e.target.value)
                }
              />
              <Input
                placeholder="Relation"
                value={form.guardian.relation}
                onChange={(e) =>
                  updateField("guardian.relation", e.target.value)
                }
              />
              <Input
                placeholder="Guardian Phone"
                value={form.guardian.phone}
                onChange={(e) =>
                  updateField("guardian.phone", e.target.value)
                }
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  disabled={!parentValidation.valid}
                  onClick={() => setStep(3)}
                >
                  Review
                </Button>

              </div>
            </div>
          )}

          {/* ================= STEP 3: REVIEW ================= */}
          {step === 3 && (
            <div className="space-y-2 text-sm">
              <p><b>ID:</b> {form.studentId}</p>
              <p><b>Name:</b> {form.firstName} {form.lastName}</p>
              <p><b>DOB:</b> {form.dob}</p>
              <p><b>Gender:</b> {form.gender || "—"}</p>
              <p><b>Phone:</b> {form.contact.phone}</p>
              <p><b>Email:</b> {form.contact.email || "—"}</p>
              <p><b>Address:</b> {Object.values(form.contact.address).filter(Boolean).join(", ") || "—"}</p>
              <p><b>Father:</b> {form.father.name || "—"}</p>
              <p><b>Mother:</b> {form.mother.name || "—"}</p>
              <p><b>Guardian:</b> {form.guardian.name || "—"}</p>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    createStudent(form)
                    console.log("FINAL DATA:", form);
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Save Student
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
  );
}
