"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Receipt,
  PiggyBank,
  FileText
} from "lucide-react";

interface SalaryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function SalaryCard({ title, description, icon, href, color }: SalaryCardProps) {
  const router = useRouter();
  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${color}`}
      onClick={() => router.push(href)}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-full bg-background">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export default function SalaryAndWagesPage() {
  const salaryCards = [
    {
      title: "Salaries",
      description: "View and manage basic salaries for all employees.",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      href: "/dashboard/salary/manage",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Salary Payouts",
      description: "Initiate and track salary payout requests.",
      icon: <Receipt className="h-6 w-6" />,
      href: "/dashboard/salary/payouts",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Wages (Posho & Extras)",
      description: "Manage overtime, per diem, meeting allowances, and more.",
      icon: <PiggyBank className="h-6 w-6" />,
      href: "/dashboard/wages",
      color: "bg-orange-50 hover:bg-orange-100"
    },
    {
      title: "Wage Payouts",
      description: "Initiate and track wage payout requests.",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/wages/payouts",
      color: "bg-teal-50 hover:bg-teal-100"
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Salary & Wages</h1>
        <p className="text-muted-foreground">
          Manage all salary and wage operations, including payouts and approvals.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salaryCards.map((card, index) => (
          <SalaryCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
