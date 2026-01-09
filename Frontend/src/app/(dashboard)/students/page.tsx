"use client";

import { useState, useEffect } from "react";
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
import { Plus, Search } from "lucide-react";
import { getStudent, postStudent } from "@/api/protectedApis/admin";
import { toast } from "sonner";
import AddStudentDialog from "./miniComponents/createStudent";
import BulkUploadStudents from "./miniComponents/BulkUploadStudents";

/* ================= TYPES ================= */

type StudentListItem = {
  id: string;
  studentId: string;
  name: string;
  fatherName: string;
  email: string;
  phone: string;
};

/* ================= PAGE ================= */

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);

  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // reset page on new search
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH STUDENTS ================= */

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await getStudent({
        page,
        limit,
        search: debouncedSearch,
      });

      setStudents(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch]);

  /* ================= CREATE STUDENT ================= */

  const createStudent = async (payload: any) => {
    try {
      await postStudent(payload);
      toast.success("Student Created Successfully");
      setOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error("Error Creating Student");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>

        <div className="flex gap-3 items-center">
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
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.fatherName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddStudentDialog
        open={open}
        setOpen={setOpen}
        createStudent={createStudent}
      />

      <BulkUploadStudents open={openBulk} setOpen={setOpenBulk} />
    </div>
  );
}
