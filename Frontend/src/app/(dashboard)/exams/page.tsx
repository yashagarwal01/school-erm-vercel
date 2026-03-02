"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getExams, createExam } from "@/api/protectedApis/exam";

/* ================= TYPES ================= */

type Exam = {
  _id: string;
  name: string;
  academicYear: string;
  createdAt: string;
};

/* ================= PAGE ================= */

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  /* ================= FETCH ================= */

  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch {
      toast.error("Failed to fetch exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!name || !academicYear) {
      toast.error("Enter exam name and academic year");
      return;
    }
    try {
      await createExam({ name, academicYear });
      toast.success("Exam created");
      setOpen(false);
      setName("");
      setAcademicYear("");
      fetchExams();
    } catch {
      toast.error("Failed to create exam");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Management</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Exam</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Exam Name</Label>
                <Input
                  placeholder="e.g. Mid Term"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Academic Year</Label>
                <Input
                  placeholder="e.g. 2024-25"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleCreate}>
                Save Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== TABLE ===== */}
      <Card>
        <CardHeader>
          <span className="font-semibold text-lg">All Exams</span>
        </CardHeader>

        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No exams found. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {exams.map((exam, i) => (
                  <TableRow key={exam._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.academicYear}</TableCell>
                    <TableCell>
                      {format(new Date(exam.createdAt), "dd MMM yyyy")}
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
