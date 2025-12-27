"use client";

import FeesNav from "@/components/fees/FeesNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeeStructurePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Fees</h1>
      <FeesNav />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Structure</CardTitle>
          <Button>Add Structure</Button>
        </CardHeader>

        <CardContent>
          <div className="text-muted-foreground">
            Class-wise fee structure will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
