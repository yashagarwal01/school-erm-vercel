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
import { getEmployee, postEmployee } from "@/api/protectedApis/admin";
import { toast } from "sonner";
import AddEmployeeDialog from "./miniComponents/createEmployees";

/* ================= PAGE ================= */

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH EMPLOYEES ================= */

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await getEmployee({
        page,
        limit,
        search: debouncedSearch,
      });
      setEmployees(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch]);

  /* ================= CREATE EMPLOYEE ================= */

  const createEmployee = async (payload: any) => {
    try {
      await postEmployee(payload);
      toast.success("Employee created successfully");
      setOpen(false);
      fetchEmployees(); // refresh list
    } catch (err) {
      toast.error("Error creating employee");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>

        <div className="flex gap-3 items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search..."
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
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No employees found
                  </TableCell>
                </TableRow>
              )}

              {employees.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>{e.employeeId}</TableCell>
                  <TableCell>
                    {e.firstName} {e.lastName}
                  </TableCell>
                  <TableCell>{e.employeeType}</TableCell>
                  <TableCell>{e.contact?.phone || "-"}</TableCell>
                  <TableCell>{e.contact?.email || "-"}</TableCell>
                  <TableCell>{e.status || "Active"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD EMPLOYEE MODAL */}
      <AddEmployeeDialog
        open={open}
        setOpen={setOpen}
        createEmployee={createEmployee}
      />
    </div>
  );
}
