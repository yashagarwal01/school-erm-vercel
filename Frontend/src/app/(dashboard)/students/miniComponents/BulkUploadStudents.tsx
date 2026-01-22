"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* =====================
   TYPES
===================== */

type Props = {
  open: boolean;
  setOpen: (open:boolean) => void;
};

/* =====================
   STUDENT FIELD OPTIONS
===================== */

const STUDENT_FIELDS = [
  { label: "Student ID", path: "studentId", required: true },
  { label: "First Name", path: "firstName" },
  { label: "Last Name", path: "lastName" },
  { label: "DOB", path: "dob" },
  { label: "Gender", path: "gender" },

  { label: "Phone", path: "contact.phone", required: true },
  { label: "Email", path: "contact.email" },

  { label: "Street", path: "contact.address.street" },
  { label: "City", path: "contact.address.city" },
  { label: "State", path: "contact.address.state" },
  { label: "Zip", path: "contact.address.zip" },
  { label: "Country", path: "contact.address.country" },

  { label: "Guardian Name", path: "guardian.name" },
  { label: "Guardian Relation", path: "guardian.relation" },
  { label: "Guardian Phone", path: "guardian.phone" },
  { label: "Guardian Email", path: "guardian.email" },

  { label: "Father Name", path: "father.name" },
  { label: "Father Phone", path: "father.contact.phone" },
  { label: "Father Email", path: "father.contact.email" },

  { label: "Mother Name", path: "mother.name" },
  { label: "Mother Phone", path: "mother.contact.phone" },
  { label: "Mother Email", path: "mother.contact.email" },
];

/* =====================
   HELPERS
===================== */

const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split(".");
  let curr = obj;

  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      curr[key] = value;
    } else {
      curr[key] = curr[key] || {};
      curr = curr[key];
    }
  });
};

const readExcel = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0] as string[];
  const rows = data.slice(1) as any[][];

  return { headers, rows };
};

/* =====================
   COMPONENT
===================== */

export default function BulkUploadStudents({
  open,
  setOpen,
}: Props) {
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /* =====================
     FILE UPLOAD
  ===================== */

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const { headers, rows } = await readExcel(file);
      setExcelHeaders(headers);
      setRows(rows);
      toast.success("Excel loaded successfully");
    } catch {
      toast.error("Failed to read Excel");
    }
  };

  /* =====================
     VALIDATION
  ===================== */

  const validateMapping = () => {
    for (const field of STUDENT_FIELDS) {
      if (field.required && !mapping[field.path]) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  /* =====================
     GENERATE JSON
  ===================== */

  const generateStudents = () => {
    if (!validateMapping()) return;

    const students = rows.map((row) => {
      const student: any = { status: "Active" };

      STUDENT_FIELDS.forEach((field) => {
        const header = mapping[field.path];
        if (!header) return;

        const colIndex = excelHeaders.indexOf(header);
        if (colIndex === -1) return;

        const value = row[colIndex];
        if (value === undefined || value === null || value === "") return;

        setNestedValue(student, field.path, value);
      });

      return student;
    });

    return students;
  };

  /* =====================
     SUBMIT
  ===================== */

  const handleGenerateAndUpload = async () => {
    const students = generateStudents();
    if (!students?.length) return;

    setLoading(true);
    try {
      // await postStudents(students)
      toast.success(`${students.length} students ready`);
      
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     UI
  ===================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
        </DialogHeader>

        {/* File */}
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
        />

        {/* Mapping */}
        {excelHeaders.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="font-semibold">Map Student Fields</p>

            {STUDENT_FIELDS.map((field) => (
              <div
                key={field.path}
                className="flex items-center gap-3 border rounded p-2"
              >
                <div className="w-1/2 text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </div>

                <select
                  className="w-1/2 border rounded px-2 py-1 text-sm"
                  value={mapping[field.path] || ""}
                  onChange={(e) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field.path]: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Excel Column --</option>
                  {excelHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <Button
          className="w-full mt-4"
          onClick={handleGenerateAndUpload}
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate & Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
