'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Building2, 
  UserCog, 
  Calendar, 
  DollarSign, 
  PiggyBank, 
  TrendingUp 
} from 'lucide-react'
import { CompanyStats } from '@/lib/services/company/company.service'

interface CompanyStatsCardsProps {
  stats: CompanyStats
}

export function CompanyStatsCards({ stats }: CompanyStatsCardsProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statsCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      description: 'Active SACCO members',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Branches',
      value: stats.totalBranches.toLocaleString(),
      icon: Building2,
      description: 'Office locations',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Staff Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UserCog,
      description: 'System users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Years Established',
      value: stats.establishedYears.toString(),
      icon: Calendar,
      description: 'Years in operation',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  // Add financial stats if available
  if (stats.totalAssets !== undefined) {
    statsCards.push({
      title: 'Total Assets',
      value: formatCurrency(stats.totalAssets),
      icon: TrendingUp,
      description: 'Organization assets',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    })
  }

  if (stats.totalLoans !== undefined) {
    statsCards.push({
      title: 'Active Loans',
      value: formatCurrency(stats.totalLoans),
      icon: DollarSign,
      description: 'Outstanding loans',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    })
  }

  if (stats.totalSavings !== undefined) {
    statsCards.push({
      title: 'Total Savings',
      value: formatCurrency(stats.totalSavings),
      icon: PiggyBank,
      description: 'Member savings',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
