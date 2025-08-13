"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { activityService, ActivityLog } from "@/lib/services/activity.service"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { ActivityDetailsModal } from "./activity-details-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AuditLogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  })
  const [activityType, setActivityType] = useState<string>("all")

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await activityService.getActivityLogs({
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        type: activityType === "all" ? undefined : activityType,
      })
      setLogs(response)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [dateRange, activityType])

  const handleViewActivity = (activity: ActivityLog) => {
    console.log("Viewing activity:", activity)
    setSelectedActivity(activity)
  }

  const columns = createColumns(handleViewActivity)

  return (
    <div className="container mx-auto py-6 min-h-screen relative">
      <Card className="overflow-hidden">
        <CardHeader className="sticky top-0 bg-background z-20">
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            View and monitor all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 sticky top-[72px] bg-background z-30">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(newDate: DateRange | undefined) => setDateRange(newDate)}
            />
            <Select
              value={activityType}
              onValueChange={setActivityType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="login">Login Activities</SelectItem>
                <SelectItem value="user">User Management</SelectItem>
                <SelectItem value="member">Member Management</SelectItem>
                <SelectItem value="loan">Loan Management</SelectItem>
                <SelectItem value="transaction">Financial Transactions</SelectItem>
                <SelectItem value="system">System Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <DataTable 
              columns={columns} 
              data={logs} 
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <ActivityDetailsModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
} 