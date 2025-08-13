"use client";

import { Card } from "@/components/ui/card";

export default function WagesPayoutsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Wages Payout Requests</h2>
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Accountants initiate wage payout requests. Managers review and approve. Chair disburses. Track the status of all wage payouts here.
        </p>
        {/* Placeholder for payout requests table */}
        <div className="text-center text-muted-foreground">Wage payout requests table coming soon...</div>
      </Card>
    </div>
  );
}
