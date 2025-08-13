"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserData } from "@/lib/services/user.service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface DeleteUserDialogProps {
  user: UserData
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteUserDialog({ user, open, onOpenChange, onConfirm }: DeleteUserDialogProps) {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent deleting own account
    if (user.id === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    // Confirm text must match "delete {user's email}"
    if (confirmText.toLowerCase() !== `delete ${user.email}`.toLowerCase()) {
      toast({
        title: "Error",
        description: "Please type the confirmation text correctly",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(user.id)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      onOpenChange(false)
      setConfirmText("") // Reset the confirmation text
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) setConfirmText("") // Reset text when dialog closes
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Are you sure you want to delete this user?</p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. This will permanently delete the user
                account and remove all associated data.
              </p>
            </div>
            
            <div className="rounded-md bg-destructive/10 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">
                To confirm, type:
              </p>
              <p className="font-mono text-sm">
                delete {user.email}
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`delete ${user.email}`}
                className="mt-2"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || user.id === currentUser?.id}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 