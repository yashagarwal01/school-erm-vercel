"use client";

import FeesNav from "@/components/fees/FeesNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FeeCollectionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Fees</h1>
      <FeesNav />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Collect Fees</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Admission No / Student</Label>
            <Input placeholder="Search student..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Fee</Label>
              <Input value="₹25,000" disabled />
            </div>

            <div>
              <Label>Due Amount</Label>
              <Input value="₹10,000" disabled />
            </div>
          </div>

          <div>
            <Label>Pay Amount</Label>
            <Input placeholder="Enter amount" />
          </div>

          <div>
            <Label>Payment Mode</Label>
            <Input placeholder="Cash / UPI / Bank" />
          </div>

          <Button className="w-full">
            Collect Fee
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
