"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SalaryManagePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">
            Set, update, and review basic salaries for all employees. Accountants can manage salary structures, view salary history, and initiate payout requests.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/salary/payouts">Go to Salary Payouts</Link>
        </Button>
      </div>
      <Card className="p-6 dark:bg-gray-800">
        {/* Placeholder for salary table and actions */}
        <div className="text-center text-muted-foreground py-12">
          <span className="text-lg">Salary management table coming soon...</span>
        </div>
      </Card>
    </div>
  );
}
