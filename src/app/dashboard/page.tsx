import type { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Users, PiggyBank, Receipt, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import { Charts } from "./components/Charts"

export const metadata: Metadata = {
  title: "Dashboard - WealthGuard",
  description: "Your financial overview",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <h2 className="text-2xl font-bold">2,345</h2>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-4 w-4" />
                12% increase
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
              <h2 className="text-2xl font-bold">456</h2>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-4 w-4" />
                8% increase
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <h2 className="text-2xl font-bold">$34,567</h2>
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <ArrowDown className="h-4 w-4" />
                3% decrease
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
              <h2 className="text-2xl font-bold">15.3%</h2>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-4 w-4" />
                2.1% increase
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <Charts />

      {/* Recent Activity Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">New Member Registration</p>
                <p className="text-sm text-muted-foreground">John Doe completed registration</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                2 hours ago
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
