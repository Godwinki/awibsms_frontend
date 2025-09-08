"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LockedAccount } from "@/lib/services/user.service"
import { Button } from "@/components/ui/button"
import { UnlockKeyhole, Clock, AlertTriangle, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const columns = (
  onUnlock: (id: string) => Promise<void>
): ColumnDef<LockedAccount>[] => [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{row.getValue("email")}</span>
        {row.original.unlockRequested && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Unlock Requested
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>User has requested account unlock</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    ),
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
        <div className="text-sm text-muted-foreground">{row.original.department}</div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    accessorKey: "failedLoginAttempts",
    header: "Failed Attempts",
    cell: ({ row }) => {
      const attempts = row.getValue("failedLoginAttempts") as number;
      const variant = attempts >= 3 ? "destructive" : "secondary";
      return (
        <Badge variant={variant} className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {attempts}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lockReason",
    header: "Lock Reason",
    cell: ({ row }) => {
      const reason = row.getValue("lockReason") as string;
      const lockedBy = row.original.lockedBy;
      return (
        <div className="max-w-[200px]">
          <div className="text-sm">{reason || "Multiple failed login attempts"}</div>
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            <Shield className="h-3 w-3 mr-1" />
            Locked by: {lockedBy || "system"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "lockoutUntil",
    header: "Lock Status",
    cell: ({ row }) => {
      const lockoutUntil = row.getValue("lockoutUntil") as string;
      const attempts = row.original.failedLoginAttempts;
      
      if (attempts >= 3) {
        return (
          <Badge variant="destructive">
            Permanently Locked
          </Badge>
        );
      } else if (lockoutUntil) {
        const date = new Date(lockoutUntil);
        const isExpired = date < new Date();
        return (
          <div>
            <Badge variant={isExpired ? "secondary" : "destructive"}>
              {isExpired ? "Lock Expired" : "Temporarily Locked"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              Until: {date.toLocaleString()}
            </div>
          </div>
        );
      } else {
        return (
          <Badge variant="outline">
            Unlocked
          </Badge>
        );
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const account = row.original;
      const isPermanentlyLocked = account.failedLoginAttempts >= 3;
      
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnlock(account.id)}
          className="hover:text-green-600"
          disabled={!isPermanentlyLocked && !account.lockoutUntil}
        >
          <UnlockKeyhole className="h-4 w-4 mr-2" />
          {account.unlockRequested ? "Process Unlock" : "Initiate Unlock"}
        </Button>
      );
    },
  },
] 