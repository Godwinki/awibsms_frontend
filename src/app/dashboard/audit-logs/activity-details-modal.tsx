import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ActivityLog } from "@/lib/services/activity.service"
import { format } from "date-fns"

interface ActivityDetailsModalProps {
  activity: ActivityLog | null
  isOpen: boolean
  onClose: () => void
}

export function ActivityDetailsModal({ activity, isOpen, onClose }: ActivityDetailsModalProps) {
  console.log("Modal props:", { activity, isOpen })

  if (!activity) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle>Activity Details</DialogTitle>
          <DialogDescription>
            Detailed information about this activity
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">Timestamp:</span>
            <span className="col-span-3">
              {format(new Date(activity.createdAt), "PPpp")}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">User:</span>
            <span className="col-span-3">
              {activity.user.firstName} {activity.user.lastName} ({activity.user.email})
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">Action:</span>
            <span className="col-span-3">{activity.action}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">Status:</span>
            <span className="col-span-3">
              <span className={`px-2 py-1 rounded-full text-sm ${
                activity.status === 'success' ? 'bg-green-100 text-green-800' :
                activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {activity.status}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">IP Address:</span>
            <span className="col-span-3">{activity.ipAddress}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold">User Agent:</span>
            <span className="col-span-3">{activity.userAgent}</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <span className="font-semibold">Details:</span>
            <div className="col-span-3">
              {activity.action === 'USER_CREATED' ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-md">
                    <strong className="block mb-2">Actor Information:</strong>
                    <div className="ml-4">
                      <div>Name: {activity.details.actor.fullName}</div>
                      <div>Role: {activity.details.actor.role}</div>
                      <div>Email: {activity.details.actor.email}</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <strong className="block mb-2">Created User:</strong>
                    <div className="ml-4">
                      <div>Name: {activity.details.createdUser.fullName}</div>
                      <div>Role: {activity.details.createdUser.role}</div>
                      <div>Email: {activity.details.createdUser.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <pre className="bg-slate-100 p-2 rounded-md overflow-auto">
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 