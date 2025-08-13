import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Settings, Users, DollarSign, Layers, Shield, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings - WealthGuard",
  description: "Manage your account settings",
}

const settingsCategories = [
  {
    title: "Member Management",
    description: "Entrance fees, shares, registration, and member-related settings.",
    icon: <Users className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/member",
  },
  {
    title: "Finance & Accounting",
    description: "General finance, accounting, and fee rates.",
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/finance",
  },
  {
    title: "Loans",
    description: "Loan types, interest rates, and loan policy settings.",
    icon: <Layers className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/loans",
  },
  {
    title: "System Config",
    description: "System-wide configurations and preferences.",
    icon: <Settings className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/system",
  },
  {
    title: "Version Control",
    description: "App versioning and update settings.",
    icon: <RefreshCw className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/version",
  },
  {
    title: "Security",
    description: "Authentication, roles, and security policies.",
    icon: <Shield className="w-8 h-8 text-primary" />,
    href: "/dashboard/settings/security",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage all WealthGuard settings by category. Click a card to configure.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((cat) => (
          <Link href={cat.href} key={cat.title} className="group">
            <Card className={cn("transition-shadow hover:shadow-lg cursor-pointer h-full flex flex-col justify-between border-primary/20 group-hover:border-primary")}>  
              <CardHeader className="flex flex-col items-center text-center">
                {cat.icon}
                <CardTitle className="mt-2">{cat.title}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

