"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LockedAccount } from "@/lib/services/user.service"
import { Button } from "@/components/ui/button"
import { UnlockKeyhole } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const columns = (
  onUnlock: (id: string) => Promise<void>
): ColumnDef<LockedAccount>[] => [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "lockoutUntil",
    header: "Locked Until",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lockoutUntil"))
      return date.toLocaleString()
    },
  },
  {
    accessorKey: "failedLoginAttempts",
    header: "Failed Attempts",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("failedLoginAttempts")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnlock(account.id)}
          className="hover:text-green-600"
        >
          <UnlockKeyhole className="h-4 w-4 mr-2" />
          Unlock
        </Button>
      )
    },
  },
] 