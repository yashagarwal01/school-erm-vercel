"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

import FeesNav from "@/components/fees/FeesNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMyFeeOverview,
  createRazorpayOrder,
  verifyRazorpayPayment,
  downloadReceipt,
} from "@/api/protectedApis/fees";

/* ================= TYPES ================= */

type MonthEntry = {
  month: string;
  dueAmount: number;
  status: "PAID" | "PARTIAL" | "PENDING";
  payment: {
    _id: string;
    amountPaid: number;
    paymentMode: string;
    receiptNumber: string;
  } | null;
};

type Overview = {
  classId: string;
  className: string;
  section?: string;
  structure: {
    _id: string;
    totalAmount: number;
    components: { name: string; amount: number }[];
  } | null;
  months: MonthEntry[];
  summary: {
    totalPaid: number;
    totalDue: number;
    paidMonths: number;
    pendingMonths: number;
  };
};

/* ================= HELPERS ================= */

const getCurrentAcademicYear = () => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3
    ? `${y}-${String(y + 1).slice(2)}`
    : `${y - 1}-${String(y).slice(2)}`;
};

const formatMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

/** Dynamically load Razorpay checkout script */
const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ================= PAGE ================= */

export default function MyFeesPage() {
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [overview, setOverview] = useState<Overview | null>(null);
  const [paying, setPaying] = useState<string | null>(null); // month being paid

  /* ---- FETCH ---- */

  const fetchOverview = useCallback(async () => {
    try {
      const data = await getMyFeeOverview(academicYear);
      setOverview(data);
    } catch {
      toast.error("Failed to load your fee details");
    }
  }, [academicYear]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /* ---- PAY ONLINE ---- */

  const handlePayOnline = async (monthEntry: MonthEntry) => {
    if (!overview?.structure) {
      toast.error("No fee structure found");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Check your connection.");
      return;
    }

    setPaying(monthEntry.month);
    try {
      const order = await createRazorpayOrder({
        amount: monthEntry.dueAmount,
        feeStructureId: overview.structure._id,
        month: monthEntry.month,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "School Fee Payment",
        description: `Fee for ${formatMonth(monthEntry.month)}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              classId: overview.classId,
              feeStructureId: overview.structure!._id,
              month: monthEntry.month,
              amountPaid: monthEntry.dueAmount,
            });
            toast.success(`Payment successful for ${formatMonth(monthEntry.month)}`);
            fetchOverview();
          } catch {
            toast.error("Payment verification failed. Contact admin.");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") ?? "",
        },
        theme: { color: "#0f172a" },
        modal: {
          ondismiss: () => setPaying(null),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(null);
      });
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment");
      setPaying(null);
    }
  };

  /* ================= RENDER ================= */

  const paidMonths = overview?.months.filter((m) => m.status === "PAID") ?? [];
  const pendingMonths =
    overview?.months.filter((m) => m.status === "PENDING") ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fees</h1>

      {/* ===== ACADEMIC YEAR ===== */}
      <div className="flex gap-3 items-end">
        <div className="space-y-1">
          <Label>Academic Year</Label>
          <Input
            className="w-36"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchOverview}>
          Refresh
        </Button>
      </div>

      {overview && !overview.structure ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            No fee structure assigned for your class yet. Contact admin.
          </CardContent>
        </Card>
      ) : overview ? (
        <>
          {/* ===== SUMMARY CARDS ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Class</p>
                <p className="text-lg font-bold">
                  {overview.className}
                  {overview.section ? ` - ${overview.section}` : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Monthly Fee</p>
                <p className="text-lg font-bold">
                  ₹ {(overview.structure?.totalAmount ?? 0).toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Total Paid</p>
                <p className="text-lg font-bold text-emerald-600">
                  ₹ {overview.summary.totalPaid.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400">
                  {overview.summary.paidMonths} months
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Total Pending</p>
                <p className="text-lg font-bold text-red-600">
                  ₹ {overview.summary.totalDue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400">
                  {overview.summary.pendingMonths} months
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ===== FEE BREAKDOWN (components) ===== */}
          {overview.structure && overview.structure.components.length > 0 && (
            <Card>
              <CardHeader>
                <span className="font-semibold text-sm">Fee Breakdown</span>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {overview.structure.components.map((c, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-8 bg-slate-50 rounded-lg px-4 py-2 text-sm min-w-40"
                    >
                      <span className="text-slate-600">{c.name}</span>
                      <span className="font-semibold">
                        ₹ {c.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== MONTH GRID ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending months */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-sm text-red-600">
                    Pending ({pendingMonths.length})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingMonths.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    All fees are paid!
                  </p>
                ) : (
                  pendingMonths.map((m) => (
                    <div
                      key={m.month}
                      className="flex items-center justify-between border rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {formatMonth(m.month)}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹ {m.dueAmount.toLocaleString("en-IN")} due
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePayOnline(m)}
                        disabled={paying === m.month}
                      >
                        <CreditCard className="h-3 w-3 mr-1.5" />
                        {paying === m.month ? "Opening..." : "Pay Online"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Paid months */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-sm text-emerald-600">
                    Paid ({paidMonths.length})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {paidMonths.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No payments yet
                  </p>
                ) : (
                  paidMonths.map((m) => (
                    <div
                      key={m.month}
                      className="flex items-center justify-between border border-emerald-100 rounded-lg px-4 py-3 bg-emerald-50"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {formatMonth(m.month)}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹ {m.payment!.amountPaid.toLocaleString("en-IN")} ·{" "}
                          {m.payment!.paymentMode} ·{" "}
                          <span className="font-medium">
                            {m.payment!.receiptNumber}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(m.payment!._id)}
                      >
                        <FileText className="h-3 w-3 mr-1.5" />
                        Receipt
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">Loading...</p>
      )}
    </div>
  );
}
