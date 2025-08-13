"use client";

import { Card } from "@/components/ui/card";

export default function SalaryPayoutsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Salary Payout Requests</h2>
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Accountants initiate payout requests. Managers review and approve. Chair disburses. Track the status of all salary payouts here.
        </p>
        {/* Placeholder for payout requests table */}
        <div className="text-center text-muted-foreground">Payout requests table coming soon...</div>
      </Card>
    </div>
  );
}
