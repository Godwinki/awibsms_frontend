import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";

export const metadata: Metadata = {
  title: "Create Expense - WealthGuard",
  description: "Create a new expense request",
};

export default function CreateExpensePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/dashboard/expenses">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create Expense Request</h2>
      </div>

      <ExpenseForm />

      <div className="text-center text-sm text-muted-foreground">
        <p>Need approval urgently? Contact your department manager after submission.</p>
      </div>
    </div>
  );
} 