"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Employees", href: "/employee", icon: Users },
  // { label: "Users", href: "/users", icon: Users },
  { label: "Attendance", href: "/attendance", icon: Users },
  { label: "Holidays", href: "/holidays", icon: Users },
];

function Sidebar({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="p-5 text-xl font-bold border-b">
        School ERP
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r hidden md:block">
        <Sidebar />
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b px-4 py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold">School ERP</h1>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
