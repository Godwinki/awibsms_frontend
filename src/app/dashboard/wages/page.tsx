"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Wages Management (Posho & Extras)</h2>
        <Button asChild>
          <Link href="/dashboard/wages/manage">Manage Wages</Link>
        </Button>
      </div>
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Manage overtime, per diem, meeting allowances, debt collector payments, and more. Accountants can add wage entries for individuals or groups.
        </p>
        {/* Placeholder for wages table */}
        <div className="text-center text-muted-foreground">Wages table coming soon...</div>
      </Card>
    </div>
  );
}
