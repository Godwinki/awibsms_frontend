"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { authService } from "@/lib/services/auth.service"
import { leaveService } from "@/lib/services/leave.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function LeaveDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [leave, setLeave] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getCurrentUser()
        setCurrentUser(user)
        
        const fetchedLeave = await leaveService.getLeaveRequestById(params.id as string)
        setLeave(fetchedLeave)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leave details",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleApprove = async () => {
    try {
      setIsProcessing(true)
      await leaveService.approveLeaveRequest(leave.id, approvalNotes)
      toast({
        title: "Success",
        description: "Leave request approved successfully"
      })
      const updatedLeave = await leaveService.getLeaveRequestById(leave.id)
      setLeave(updatedLeave)
      setShowApproveDialog(false)
      setApprovalNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      await leaveService.rejectLeaveRequest(leave.id, rejectionReason)
      toast({
        title: "Success",
        description: "Leave request rejected successfully"
      })
      const updatedLeave = await leaveService.getLeaveRequestById(leave.id)
      setLeave(updatedLeave)
      setShowRejectDialog(false)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/dashboard/leaves">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Leave Request Details</h2>
        <Button
          className="ml-auto"
          variant="outline"
          onClick={() => {
            window.open(`/api/leaves/${leave?.id}/pdf`, '_blank')
          }}
        >
          Print PDF
        </Button>
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Requested By</p>
              <p className="font-medium">{leave?.requestedBy ? `${leave.requestedBy.firstName} ${leave.requestedBy.lastName}` : (leave?.user ? `${leave.user.firstName} ${leave.user.lastName}` : '-')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Request Number</p>
              <p className="font-medium">{leave?.requestNumber}</p>
            </div>
            <Badge variant={leave?.status === 'PENDING' ? 'default' : leave?.status === 'APPROVED' ? 'success' : 'destructive'}>
              {leave?.status}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Leave Type</p>
              <p className="font-medium">{leave?.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested By</p>
              <p className="font-medium">{leave?.requestedBy?.firstName} {leave?.requestedBy?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(new Date(leave?.startDate))}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(new Date(leave?.endDate))}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{leave?.department?.name}</p>
            </div>
            {leave?.approver && (
              <div>
                <p className="text-sm text-muted-foreground">Approved By</p>
                <p className="font-medium">{leave?.approver?.firstName} {leave?.approver?.lastName}</p>
              </div>
            )}
            {leave?.rejector && (
              <div>
                <p className="text-sm text-muted-foreground">Rejected By</p>
                <p className="font-medium">{leave?.rejector?.firstName} {leave?.rejector?.lastName}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="mt-1">{leave?.reason}</p>
          </div>
          {leave?.approvalNotes && (
            <div>
              <p className="text-sm text-muted-foreground">Manager Comments</p>
              <p className="mt-1">{leave?.approvalNotes}</p>
            </div>
          )}
          {leave?.rejectionReason && (
            <div>
              <p className="text-sm text-muted-foreground">Rejection Reason</p>
              <p className="mt-1">{leave?.rejectionReason}</p>
            </div>
          )}
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && leave?.status === 'PENDING' && (
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
              >
                <XIcon className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={isProcessing}
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </Card>
      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="approvalNotes" className="block text-sm font-medium">Manager Comments (optional)</label>
            <Textarea
              id="approvalNotes"
              value={approvalNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApprovalNotes(e.target.value)}
              placeholder="Add comments for approval..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleApprove} disabled={isProcessing}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="rejectionReason" className="block text-sm font-medium">Reason for Rejection</label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}