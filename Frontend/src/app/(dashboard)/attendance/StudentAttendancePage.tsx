"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle2, XCircle, Clock, BookOpen, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

// ─── Replace with your actual API call ───────────────────────────────────────
import { getStudentMonthlyAttendance } from "@/api/protectedApis/attendance";
import { getUserId } from "@/lib/storage";
// Expected shape: StudentAttendanceRecord[]
// ─────────────────────────────────────────────────────────────────────────────

/* ===================== TYPES ===================== */

type DayStatus = "present" | "absent" | "leave" | "holiday" | "unmarked";

type StudentAttendanceRecord = {
  date: string;           // "2025-01-15"
  status: DayStatus;
  className: string;
  section: string;
  isHoliday: boolean;
  holidayReason?: string;
};

type SummaryStats = {
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
};

/* ===================== HELPERS ===================== */

function computeStats(records: StudentAttendanceRecord[]): SummaryStats {
  const workingDays = records.filter((r) => !r.isHoliday);
  const present = workingDays.filter((r) => r.status === "present").length;
  const absent = workingDays.filter((r) => r.status === "absent").length;
  const leave = workingDays.filter((r) => r.status === "leave").length;
  const total = workingDays.length;
  return {
    total,
    present,
    absent,
    leave,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
}

const STATUS_META: Record<DayStatus, { label: string; color: string; bg: string; dot: string }> = {
  present: { label: "Present", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  absent:  { label: "Absent",  color: "text-red-700",     bg: "bg-red-50 border-red-200",       dot: "bg-red-500"     },
  leave:   { label: "Leave",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-400"   },
  holiday: { label: "Holiday", color: "text-sky-700",     bg: "bg-sky-50 border-sky-200",       dot: "bg-sky-400"     },
  unmarked:{ label: "—",       color: "text-gray-400",    bg: "bg-gray-50 border-gray-100",     dot: "bg-gray-300"    },
};

/* ===================== COMPONENT ===================== */

export default function StudentAttendancePage() {
  const studentUserId = getUserId()

  const [month, setMonth] = useState<Date>(new Date());
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentAttendanceRecord | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  /* ─── Fetch on month change ─── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSelected(null);
      try {
        const from = format(startOfMonth(month), "yyyy-MM-dd");
        const to   = format(endOfMonth(month),   "yyyy-MM-dd");
        const res: StudentAttendanceRecord[] = await getStudentMonthlyAttendance(studentUserId, from, to);
        setRecords(res ?? []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  const stats = computeStats(records);

  /* ─── Build a quick lookup for calendar coloring ─── */
  const dayMap = new Map<string, DayStatus>();
  records.forEach((r) => dayMap.set(r.date, r.isHoliday ? "holiday" : r.status));

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  const getStatus = (d: Date): DayStatus => dayMap.get(format(d, "yyyy-MM-dd")) ?? "unmarked";

  /* ─── Stat card ─── */
  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    sub,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    sub?: string;
  }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-6 space-y-6 font-sans">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Attendance</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {records[0]?.className
              ? `Class ${records[0].className} · Section ${records[0].section}`
              : "Your attendance overview"}
          </p>
        </div>

        {/* Month picker */}
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl border-gray-200 text-gray-700 shadow-sm">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              {format(month, "MMMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 w-auto">
            <Calendar
              mode="single"
              selected={month}
              onSelect={(d:any) => {
                if (d) { setMonth(d); setCalOpen(false); }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Attendance"
          value={`${stats.percentage}%`}
          color="bg-violet-100 text-violet-600"
          sub={`${stats.present} of ${stats.total} days`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Present"
          value={stats.present}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={XCircle}
          label="Absent"
          value={stats.absent}
          color="bg-red-100 text-red-500"
        />
        <StatCard
          icon={Clock}
          label="Leave"
          value={stats.leave}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* ─── ATTENDANCE % BAR ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Monthly Progress</span>
          <span
            className={`text-sm font-bold ${
              stats.percentage >= 75 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {stats.percentage}%
            {stats.percentage < 75 && (
              <span className="ml-1 text-xs font-normal text-red-400">(Below 75%)</span>
            )}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              stats.percentage >= 75 ? "bg-emerald-500" : "bg-red-400"
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 mt-2">
          <span>0%</span>
          <span className="text-amber-500 font-medium">75% required</span>
          <span>100%</span>
        </div>
      </div>

      {/* ─── CALENDAR GRID ─── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-400">
          Loading attendance…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">
              {format(month, "MMMM yyyy")} — Day View
            </h2>
            {/* Legend */}
            <div className="flex gap-3 flex-wrap">
              {(["present", "absent", "leave", "holiday"] as DayStatus[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                  {STATUS_META[s].label}
                </span>
              ))}
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Blank cells for offset */}
          {(() => {
            const firstDay = days[0].getDay(); // 0=Sun
            const cells: React.ReactNode[] = [];

            for (let i = 0; i < firstDay; i++) {
              cells.push(<div key={`blank-${i}`} />);
            }

            days.forEach((day:any) => {
              const st = getStatus(day);
              const meta = STATUS_META[st];
              const rec = records.find((r) => r.date === format(day, "yyyy-MM-dd"));
              const isSelected = selected && isSameDay(new Date(selected.date), day);

              cells.push(
                <button
                  key={day.toISOString()}
                  onClick={() => rec && setSelected(rec === selected ? null : rec)}
                  className={`
                    m-0.5 rounded-xl p-1.5 flex flex-col items-center
                    border transition-all duration-150 cursor-pointer
                    ${meta.bg}
                    ${isSelected ? "ring-2 ring-offset-1 ring-violet-400 scale-105" : "hover:scale-105"}
                    ${st === "unmarked" ? "opacity-40" : ""}
                  `}
                >
                  <span className="text-xs font-semibold text-gray-700">{format(day, "d")}</span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${meta.dot}`} />
                </button>
              );
            });

            return <div className="grid grid-cols-7">{cells}</div>;
          })()}
        </div>
      )}

      {/* ─── DETAIL PANEL (shown when a day is clicked) ─── */}
      {selected && (
        <div className={`rounded-2xl border p-5 shadow-sm ${STATUS_META[selected.isHoliday ? "holiday" : selected.status].bg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${STATUS_META[selected.isHoliday ? "holiday" : selected.status].dot}`} />
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {format(new Date(selected.date), "EEEE, dd MMMM yyyy")}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${STATUS_META[selected.isHoliday ? "holiday" : selected.status].color}`}>
                {selected.isHoliday
                  ? `Holiday${selected.holidayReason ? ` — ${selected.holidayReason}` : ""}`
                  : STATUS_META[selected.status].label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIST VIEW ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-800 text-sm">All Records</h2>
          <span className="ml-auto text-xs text-gray-400">{records.length} days</span>
        </div>

        {records.length === 0 && !loading && (
          <div className="p-10 text-center text-sm text-gray-400">
            No attendance records for this month.
          </div>
        )}

        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {records.map((r) => {
            const st = r.isHoliday ? "holiday" : r.status;
            const meta = STATUS_META[st];
            return (
              <div
                key={r.date}
                className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="w-28 text-xs text-gray-500 font-medium">
                  {format(new Date(r.date), "dd MMM, EEE")}
                </span>
                <span
                  className={`
                    ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border
                    ${meta.bg} ${meta.color}
                  `}
                >
                  {r.isHoliday ? (r.holidayReason ?? "Holiday") : meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
