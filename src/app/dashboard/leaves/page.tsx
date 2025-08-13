"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, ClockIcon, CheckIcon, XIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { LeaveStatusCard } from "./components/leave-status-card"
import { authService } from "@/lib/services/auth.service"
import { leaveService } from "@/lib/services/leave.service"
import { LeavesTable } from "./components/LeavesTable"

interface Leave {
  id: string
  requestNumber: string
  userId: string
  startDate: Date
  endDate: Date
  type: string
  reason: string
  status: string
  createdAt: Date
  user?: {
    firstName: string
    lastName: string
  }
  requestedBy?: {
    firstName: string
    lastName: string
  }
}

export default function LeavesPage() {
  const { toast } = useToast()
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // For manager/admin
  const [allLeaves, setAllLeaves] = useState<Leave[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([])

  const [counts, setCounts] = useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser()
        setCurrentUser(user)

        // My leaves
        const fetchedLeaves = await leaveService.getLeaveRequests({
          userId: user.id
        })
        setLeaves(fetchedLeaves)

        // All leaves (for manager/admin)
        if (user.role === 'manager' || user.role === 'admin') {
          const all = await leaveService.getLeaveRequests()
          setAllLeaves(all)
          setPendingLeaves(all.filter(l => l.status === 'PENDING'))
        }

        // Calculate counts
        const countMap = fetchedLeaves.reduce((acc: any, leave) => {
          acc[leave.status] = (acc[leave.status] || 0) + 1
          return acc
        }, {})

        setCounts({
          PENDING: countMap.PENDING || 0,
          APPROVED: countMap.APPROVED || 0,
          REJECTED: countMap.REJECTED || 0
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'PENDING': 'default',
      'APPROVED': 'success',
      'REJECTED': 'destructive'
    }
    
    return (
      <Badge variant={variants[status] as any || 'secondary'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">
            Request and manage your leave applications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/leaves/create">
            <PlusIcon className="mr-2 h-4 w-4" /> New Leave Request
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LeaveStatusCard
              title="Pending Requests"
              count={counts.PENDING}
              description="Leave requests awaiting approval"
              icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/leaves/status/pending"
            />
            <LeaveStatusCard
              title="Approved Leaves"
              count={counts.APPROVED}
              description="Approved leave requests"
              icon={<CheckIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/leaves/status/approved"
            />
            <LeaveStatusCard
              title="Rejected Requests"
              count={counts.REJECTED}
              description="Rejected leave requests"
              icon={<XIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/leaves/status/rejected"
            />
          </div>
        </TabsContent>

        <TabsContent value="my-leaves" className="space-y-4">
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">You haven't made any leave requests yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/leaves/create">
                    <PlusIcon className="mr-2 h-4 w-4" /> Request Leave
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.requestNumber}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{formatDate(new Date(leave.startDate))}</TableCell>
                      <TableCell>{formatDate(new Date(leave.endDate))}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        <Link 
                          href={`/dashboard/leaves/${leave.id}`}
                          className="text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
          <>
            <TabsContent value="all" className="space-y-4">
              <h3 className="text-lg font-medium">All Leave Requests</h3>
              <div className="rounded-md border">
                <LeavesTable leaves={allLeaves} isLoading={isLoading} emptyText="No leave requests found." />
              </div>
            </TabsContent>
            <TabsContent value="approvals" className="space-y-4">
              <h3 className="text-lg font-medium">Pending Leave Approvals</h3>
              <div className="rounded-md border">
                <LeavesTable leaves={pendingLeaves} isLoading={isLoading} emptyText="No pending leave requests." />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}