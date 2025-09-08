"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserData } from "@/lib/services/user.service"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ActionsProps {
  user: UserData
  onEdit: (user: UserData) => void
  onDelete: (user: UserData) => void
  onManageRoles: (user: UserData) => void
}

const Actions = ({ user, onEdit, onDelete, onManageRoles }: ActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(user)}
        className="hover:text-primary"
        title="Edit user"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onManageRoles(user)}
        className="hover:text-blue-600"
        title="Manage roles"
      >
        <Shield className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(user)}
        className="hover:text-destructive"
        title="Delete user"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export const createColumns = (
  onEdit: (user: UserData) => void,
  onDelete: (user: UserData) => void,
  onManageRoles: (user: UserData) => void
): ColumnDef<UserData>[] => [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant="outline" className="capitalize">
          {role.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          className={
            status === "active"
              ? "bg-green-100 text-green-800"
              : status === "inactive"
              ? "bg-gray-100 text-gray-800"
              : "bg-red-100 text-red-800"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return (
        <Actions
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageRoles={onManageRoles}
        />
      )
    },
  },
] 