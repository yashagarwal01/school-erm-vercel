import { useState } from "react";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function EditTeacherDialog({
  teachers,
  classData,
  handleAssignTeacher,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Pencil Button */}
      <DialogTrigger asChild>
        <button className="p-1 hover:bg-muted rounded">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      {/* Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Class Teacher</DialogTitle>
        </DialogHeader>

        {/* Searchable Teacher List */}
        <Command>
          <CommandInput placeholder="Search teachers..." />

          <CommandList>
            <CommandEmpty>No teachers found.</CommandEmpty>

            {teachers.map((teacher) => (
              <CommandItem
                key={teacher.employeeUserId}
                value={teacher.name}
                onSelect={() => {
                  handleAssignTeacher(teacher);
                  setOpen(false);
                }}
              >
                {teacher.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
