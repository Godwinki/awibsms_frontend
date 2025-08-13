"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  PieChart,
  FileSpreadsheet,
  History,
  TrendingUp,
  Settings,
  FilePlus,
  FileCheck,
  AlertCircle
} from "lucide-react"

interface BudgetCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

function BudgetCard({ title, description, icon, href, color }: BudgetCardProps) {
  const router = useRouter()

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg dark:bg-gray-800 ${color}`}
      onClick={() => router.push(href)}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-full bg-background dark:bg-gray-700">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-300">{description}</p>
        </div>
      </div>
    </Card>
  )
}

export default function BudgetPage() {
  const budgetCards = [
    {
      title: "Budget Planning",
      description: "Create and manage annual budgets and allocations",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      href: "/dashboard/budget/planning",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Budget Reports",
      description: "View budget performance and analysis",
      icon: <PieChart className="h-6 w-6" />,
      href: "/dashboard/budget/reports",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Budget History",
      description: "Track historical budget data and trends",
      icon: <History className="h-6 w-6" />,
      href: "/dashboard/budget/history",
      color: "bg-orange-50 hover:bg-orange-100"
    },
    {
      title: "Budget Forecasting",
      description: "Predict future budget needs and trends",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/dashboard/budget/forecasting",
      color: "bg-yellow-50 hover:bg-yellow-100"
    },
    {
      title: "Budget Requests",
      description: "Submit and manage budget adjustment requests",
      icon: <FilePlus className="h-6 w-6" />,
      href: "/dashboard/budget/requests",
      color: "bg-pink-50 hover:bg-pink-100"
    },
    {
      title: "Budget Approvals",
      description: "Review and approve budget requests",
      icon: <FileCheck className="h-6 w-6" />,
      href: "/dashboard/budget/approvals",
      color: "bg-teal-50 hover:bg-teal-100"
    },
    {
      title: "Budget Alerts",
      description: "Monitor budget thresholds and warnings",
      icon: <AlertCircle className="h-6 w-6" />,
      href: "/dashboard/budget/alerts",
      color: "bg-red-50 hover:bg-red-100"
    },
    {
      title: "Budget Settings",
      description: "Configure budget rules and preferences",
      icon: <Settings className="h-6 w-6" />,
      href: "/dashboard/budget/settings",
      color: "bg-gray-50 hover:bg-gray-100"
    }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
        <p className="text-muted-foreground">
          Comprehensive tools for planning, tracking, and managing institutional budgets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetCards.map((card, index) => (
          <BudgetCard key={index} {...card} />
        ))}
      </div>
    </div>
  )
}
