"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import clsx from "clsx";
import axios from "axios";
import { DateRange } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHolidays, postHolidays } from "@/api/protectedApis/holidays"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ================= TYPES ================= */
type Holiday = {
  _id: string;
  dateFrom: string;
  dateTo: string;
  title: string;
  type: string;
};


type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

/* ================= HELPERS ================= */

const generateCalendarDays = (month: Date): CalendarDay[] => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const startWeekDay = start.getDay();

  const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1);
  const prevMonthEnd = endOfMonth(prevMonth);

  const prevDays: CalendarDay[] = [];
  for (let i = startWeekDay - 1; i >= 0; i--) {
    const d = new Date(prevMonthEnd);
    d.setDate(prevMonthEnd.getDate() - i);
    prevDays.push({ date: d, isCurrentMonth: false });
  }

  const currentDays: CalendarDay[] = eachDayOfInterval({
    start,
    end,
  }).map((d) => ({ date: d, isCurrentMonth: true }));

  const totalSoFar = prevDays.length + currentDays.length;
  const nextDaysCount = 35 - totalSoFar;

  const nextDays: CalendarDay[] = [];
  for (let i = 1; i <= Math.max(0, nextDaysCount); i++) {
    nextDays.push({
      date: new Date(month.getFullYear(), month.getMonth() + 1, i),
      isCurrentMonth: false,
    });
  }

  return [...prevDays, ...currentDays, ...nextDays];
};

/* ================= PAGE ================= */

export default function HolidaysPage() {
  const [month, setMonth] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("SCHOOL");
  const [open, setOpen] = useState(false);

  /* ================= FETCH ================= */

  const fetchHolidays = async () => {
    try {
      const monthStr = format(month, "yyyy-MM");
      const res = await getHolidays(monthStr);

      setHolidays(res?.data);
    } catch {
      toast.error("Failed to fetch holidays");
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [month]);

  /* ================= MAP ================= */

  const holidayMap = useMemo(() => {
    const map: Record<string, Holiday> = {};

    holidays.forEach((h) => {
      const start = new Date(h.dateFrom);
      const end = new Date(h.dateTo);

      eachDayOfInterval({ start, end }).forEach((d) => {
        map[format(d, "yyyy-MM-dd")] = h;
      });
    });

    return map;
  }, [holidays]);


  const calendarDays = useMemo(
    () => generateCalendarDays(month),
    [month]
  );

  /* ================= CREATE ================= */

  const createHoliday = async () => {
    if (!range?.from || !range?.to || !title) {
      toast.error("Select date range and enter title");
      return;
    }

    try {
      await postHolidays({
        startDate: range.from,
        endDate: range.to,
        title,
        type,
        appliesToAllClasses: true,
      })

      toast.success("Holiday created");
      setOpen(false);
      setRange(undefined);
      setTitle("");
      fetchHolidays();
    } catch {
      toast.error("Failed to create holiday");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className=" space-y-6">
      {/* ===== HEADER ===== */}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Holiday Management</h1>



        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Holiday</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Holiday</DialogTitle>
            </DialogHeader>

            <div className="flex gap-6">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={(d) => d.getMonth() !== month.getMonth()}
              />

              <div className="space-y-3 w-64">
                <Input
                  placeholder="Holiday title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHOOL">School</SelectItem>
                    <SelectItem value="FESTIVAL">Festival</SelectItem>
                    <SelectItem value="NATIONAL">National</SelectItem>
                    <SelectItem value="GOVT ORDER">
                      Govt Order
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={createHoliday}
                  className="w-full"
                >
                  Save Holiday
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== MONTH VIEW ===== */}
      <Card>
        <CardHeader className="flex  justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="text-lg font-semibold">
              {format(month, "MMMM yyyy")}
            </span>

            <Button
              size="icon"
              variant="outline"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Week header */}
          <div className="grid grid-cols-7 text-center font-medium mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (d) => (
                <div key={d}>{d}</div>
              )
            )}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const key = format(date, "yyyy-MM-dd");
              const isSunday = date.getDay() === 0;
              const holiday = holidayMap[key];
              const isHoliday =
                isCurrentMonth && (isSunday || !!holiday);

              return (
                <div
                  key={key}
                  className={clsx(
                    "h-20 rounded-md border flex flex-col items-center justify-center text-sm",
                    !isCurrentMonth &&
                    "bg-gray-100 text-gray-400 cursor-not-allowed",
                    isCurrentMonth &&
                    isHoliday &&
                    "bg-red-500 text-white",
                    isCurrentMonth &&
                    !isHoliday &&
                    "bg-white"
                  )}
                >
                  <div className="font-semibold">
                    {format(date, "d")}
                  </div>

                  {isCurrentMonth && holiday && (
                    <div className="text-xs text-center px-1">
                      {holiday.title}
                    </div>
                  )}

                  {isCurrentMonth && isSunday && !holiday && (
                    <div className="text-xs">Sunday</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
