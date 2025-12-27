"use client";

import { useState, useMemo, useEffect } from "react";
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


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { getStudent, postStudent } from "@/api/protectedApis/admin"
import { toast } from "sonner";
import AddStudentDialog from "./miniComponents/createStudent"
import BulkUploadStudents from "./miniComponents/BulkUploadStudents";

type StudentListItem = {
  id: number;
  studentId: string;       // admission no / student id
  name: string;
  fatherName: string;
  email: string;
  phone: string;
};


/* ================= PAGE ================= */

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<StudentListItem[]>([]);





  /* ================= FORM STATE ================= */



  /* ================= HELPERS ================= */



  /* ================= SEARCH ================= */

  const fetchStudents = async () => {
    const response = await getStudent();


    if (response.data) {
      setStudents(response.data)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  /* ================= SEARCH FILTER ================= */

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }, [search, students]);

  const createStudent = async (payload: any) => {
    try {
      const response = await postStudent(payload)



      toast.success("Student Created Successfully", {
        description: "The student record has been added.",
      });
    } catch (err) {
      toast.error("Error Creating Student");
    }
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Students</h1>

        <div className="flex gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button onClick={() => setOpenBulk(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student Bulk
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.studentId}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.fatherName}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddStudentDialog open={open} createStudent={createStudent} setOpen={setOpen} />
      <BulkUploadStudents open={openBulk}  setOpen={setOpenBulk} />
    </div>
  );
}
