"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ClassDetails from "./miniComponents/ClassDetails";


/* ================= TYPES ================= */

type Teacher = {
  _id: string;
  name: string;
  employeeUserId?: string;
};

type ClassListItem = {
  _id: string;
  className: string;
  section: string;
};

/* ================= API ================= */

import { getAllClasses, createClass } from "@/api/protectedApis/class";
import { getEmployee } from "@/api/protectedApis/admin";

/* ================= COMPONENT ================= */

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState(new Date());

  // Add Class dialog state
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");
  const [addClassLoading, setAddClassLoading] = useState(false);

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  /* ================= FETCH CLASSES & TEACHERS (ONCE) ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [classesRes, teachersRes] = await Promise.all([
          getAllClasses(),
          getEmployee({ page: 0, limit: 0, search: "" }), // Fetch all teachers
        ]);

        setClasses(classesRes);
        setTeachers(teachersRes.data.data);

        // Set first class as active
        if (classesRes.length > 0) {
          setActiveClassId(classesRes[0]._id);
        }
      } catch (err) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= FILTERED CLASSES ================= */

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;

    const query = searchQuery.toLowerCase();
    return classes.filter(
      (cls) =>
        cls.className.toLowerCase().includes(query) ||
        cls.section.toLowerCase().includes(query)
    );
  }, [classes, searchQuery]);

  /* ================= MEMOIZED TEACHERS ================= */

  const memoizedTeachers = useMemo(() => teachers, [teachers]);

  /* ================= ACTIVE CLASS ================= */

  const activeClass = useMemo(
    () => classes.find((cls) => cls._id === activeClassId),
    [classes, activeClassId]
  );

  /* ================= CREATE CLASS ================= */

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Class name is required");
      return;
    }

    try {
      setAddClassLoading(true);
      const payload: { className: string; section?: string; classTeacherId?: string } = {
        className: newClassName.trim(),
      };
      if (newSection.trim()) payload.section = newSection.trim();
      if (newTeacherId) payload.classTeacherId = newTeacherId;

      const created = await createClass(payload);

      setClasses((prev) => [...prev, created]);
      setActiveClassId(created._id);

      setAddClassOpen(false);
      setNewClassName("");
      setNewSection("");
      setNewTeacherId("");

      toast.success(`Class ${created.className} created`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "";
      if (msg === "CLASS_ALREADY_EXISTS") {
        toast.error("A class with this name and section already exists");
      } else {
        toast.error("Failed to create class");
      }
    } finally {
      setAddClassLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      

{/* ================= HEADER WITH CLASS SELECTOR ================= */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold">Classes Management</h2>
      {activeClass && (
        <p className="text-sm text-muted-foreground">
          Class {activeClass.className} • Section {activeClass.section}
        </p>
      )}
    </div>

    <div className="flex items-center gap-3">
      {/* Add Class Dialog */}
      <Dialog open={addClassOpen} onOpenChange={(val) => {
        setAddClassOpen(val);
        if (!val) { setNewClassName(""); setNewSection(""); setNewTeacherId(""); }
      }}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="className">Class Name <span className="text-destructive">*</span></Label>
              <Input
                id="className"
                placeholder="e.g. 10, 9A, Grade 5"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="section">Section <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="section"
                placeholder="e.g. A, B, Science"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacher">Class Teacher <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <select
                id="teacher"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={newTeacherId}
                onChange={(e) => setNewTeacherId(e.target.value)}
              >
                <option value="">— Select teacher —</option>
                {teachers.map((t) => (
                  <option key={t.employeeUserId ?? t._id} value={t.employeeUserId ?? t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddClassOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass} disabled={addClassLoading || !newClassName.trim()}>
                {addClassLoading ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Selector Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Select Class
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Class</DialogTitle>
          </DialogHeader>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Class List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No classes found
              </p>
            ) : (
              filteredClasses.map((cls) => (
                <Button
                  key={cls._id}
                  variant={activeClassId === cls._id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveClassId(cls._id)}
                >
                  Class {cls.className} - Section {cls.section}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Clock */}
      <div className="text-sm font-medium">
        {format(time, "hh:mm:ss a")}
      </div>
    </div>
  </CardHeader>
</Card>

      {/* ================= CLASS DETAILS ================= */}
      {activeClassId ? (
        <ClassDetails
          classId={activeClassId}
          teachers={memoizedTeachers}
        />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Select a class to view details
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}