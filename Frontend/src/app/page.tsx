"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800">
          EduERP
        </h1>

        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </header>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Smart ERP Solution for
            <span className="text-primary block mt-2">
              Schools & Institutions
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            Manage students, teachers, fees, attendance, and reports —
            all in one secure and scalable ERP platform.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight size={18} />
              </Button>
            </Link>

            <Button size="lg" variant="outline">
              Request Demo
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-slate-800">
            Why Choose EduERP?
          </h3>

          <ul className="space-y-4">
            {[
              "Student & Staff Management",
              "Fees & Accounting",
              "Attendance & Reports",
              "Secure Role-Based Access",
              "Bulk Upload & Automation",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckCircle className="text-primary" size={20} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900">
            Powerful Features Built for Growth
          </h3>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Student Management",
                desc: "Centralized student profiles with documents, guardians, and history.",
              },
              {
                title: "Fees & Payments",
                desc: "Track dues, receipts, reports, and payment modes effortlessly.",
              },
              {
                title: "Admin Dashboard",
                desc: "Insightful dashboards with real-time analytics and reports.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border rounded-xl p-6 hover:shadow-lg transition"
              >
                <h4 className="text-lg font-semibold text-slate-800">
                  {f.title}
                </h4>
                <p className="mt-2 text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 text-center">
        <h3 className="text-3xl font-bold text-slate-900">
          Ready to simplify your operations?
        </h3>
        <p className="mt-4 text-slate-600">
          Login now and start managing your institution smarter.
        </p>

        <Link href="/login">
          <Button size="lg" className="mt-6">
            Go to Login
          </Button>
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} EduERP. All rights reserved.
      </footer>
    </main>
  );
}
