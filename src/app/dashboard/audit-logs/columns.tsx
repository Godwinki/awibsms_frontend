"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ActivityLog } from "@/lib/services/activity.service"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export const createColumns = (
  onView: (activity: ActivityLog) => void
): ColumnDef<ActivityLog>[] => [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPpp")
    },
    size: 200,
  },
  {
    accessorKey: "user",
    header: "Performed By",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return 'System';
      return `${user.firstName} ${user.lastName} (${user.role})`;
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return action.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const details = row.getValue("details") as Record<string, any>;
      let displayText = '';

      if (details.createdUser) {
        displayText = `Created: ${details.createdUser.fullName}`;
      } else if (details.userInfo) {
        displayText = `User: ${details.userInfo.fullName}`;
      } else if (details.actor) {
        displayText = `By: ${details.actor.fullName}`;
      } else {
        displayText = JSON.stringify(details);
      }

      return (
        <div className="max-w-[300px] truncate">
          {displayText}
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "success" ? "success" :
          status === "failed" ? "destructive" :
          status === "warning" ? "warning" : "default"
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const activity = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onView(activity)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
] 