"use client";

import FeesNav from "@/components/fees/FeesNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FeeDiscountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Fees</h1>
      <FeesNav />

      <Card>
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p>• General Discount</p>
          <p>• Principal Approved Discount</p>
          <p className="text-muted-foreground text-sm">
            Discount rules & approvals will be managed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
