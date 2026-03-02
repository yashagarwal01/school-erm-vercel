"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { getAvailableStudents, addStudentToClass } from "@/api/protectedApis/class";

/* ================= TYPES ================= */

type AvailableStudent = {
  _id: string;
  name: string;
  loginId: string;
};

type Props = {
  classId: string;
  onStudentAdded: () => void;
};

/* ================= COMPONENT ================= */

export default function AddStudentDialog({ classId, onStudentAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AvailableStudent | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  /* ================= FETCH AVAILABLE STUDENTS ================= */

  useEffect(() => {
    if (!open) return;

    const fetchStudents = async () => {
      try {
        setFetching(true);
        const data = await getAvailableStudents();
        setStudents(data);
      } catch {
        toast.error("Failed to fetch available students");
      } finally {
        setFetching(false);
      }
    };

    fetchStudents();
  }, [open]);

  /* ================= RESET ON CLOSE ================= */

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setSelectedStudent(null);
      setRollNumber("");
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    if (!rollNumber || isNaN(Number(rollNumber)) || Number(rollNumber) <= 0) {
      toast.error("Please enter a valid roll number");
      return;
    }

    try {
      setLoading(true);
      await addStudentToClass(classId, {
        rollNumber: Number(rollNumber),
        userId: selectedStudent._id,
      });
      toast.success(`${selectedStudent.name} added to class`);
      handleOpenChange(false);
      onStudentAdded();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "";
      if (msg === "ROLL_NUMBER_ALREADY_EXISTS") {
        toast.error("Roll number already taken in this class");
      } else if (msg === "STUDENT_ALREADY_IN_CLASS") {
        toast.error("Student is already in this class");
      } else if (msg === "STUDENT_ALREADY_IN_ANOTHER_CLASS") {
        toast.error("Student is already enrolled in another class");
      } else {
        toast.error("Failed to add student");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Student to Class</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student selector */}
          <div className="space-y-1.5">
            <Label>Select Student</Label>
            {fetching ? (
              <p className="text-sm text-muted-foreground">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available students. All students are already enrolled in a class.
              </p>
            ) : (
              <>
                {selectedStudent && (
                  <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/40">
                    <span className="text-sm font-medium">{selectedStudent.name}</span>
                    <span className="text-xs text-muted-foreground">{selectedStudent.loginId}</span>
                  </div>
                )}
                <Command className="border rounded-md">
                  <CommandInput placeholder="Search by name or ID..." />
                  <CommandList className="max-h-48">
                    <CommandEmpty>No students found.</CommandEmpty>
                    {students.map((s) => (
                      <CommandItem
                        key={s._id}
                        value={`${s.name} ${s.loginId}`}
                        onSelect={() => setSelectedStudent(s)}
                        className={selectedStudent?._id === s._id ? "bg-accent" : ""}
                      >
                        <span className="flex-1">{s.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.loginId}</span>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </>
            )}
          </div>

          {/* Roll number */}
          <div className="space-y-1.5">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              type="number"
              min={1}
              placeholder="e.g. 1"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedStudent || !rollNumber}
            >
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
