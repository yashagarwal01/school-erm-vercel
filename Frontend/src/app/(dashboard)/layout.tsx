"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Employees", href: "/employee", icon: Users },
  { label: "Users", href: "/users", icon: Users },
  { label: "Attendance", href: "/attendance", icon: Users },
  // { label: "Fees", href: "/fees/collect", icon: IndianRupee },
  // { label: "Reports", href: "/reports", icon: FileBarChart },
  // { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-5 text-xl font-bold border-b">
          School ERP
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
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
          <Button variant="ghost" className="w-full justify-start gap-3">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
