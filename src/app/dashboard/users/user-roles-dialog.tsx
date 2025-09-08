"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, Users } from "lucide-react"
import { UserData, userService } from "@/lib/services/user.service"
import roleService, { Role } from "@/lib/services/role.service"
import { useToast } from "@/components/ui/use-toast"

interface UserRolesDialogProps {
  user: UserData
  open: boolean
  onOpenChange: (open: boolean) => void
  onRolesUpdated?: () => void
}

export function UserRolesDialog({ user, open, onOpenChange, onRolesUpdated }: UserRolesDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Load roles and user's current roles
  useEffect(() => {
    const loadData = async () => {
      if (!open) return

      try {
        setLoadingData(true)
        
        // Load all available roles
        const rolesData = await roleService.getRoles()
        const roles = Array.isArray(rolesData) ? rolesData : []
        setAvailableRoles(roles)

        // Load user's current roles
        try {
          const userRolesData = await userService.getUserRoles(user.id)
          const currentRoles = Array.isArray(userRolesData) ? userRolesData : []
          setUserRoles(currentRoles)
          setSelectedRoles(currentRoles.map(role => role.id))
        } catch (error) {
          // User might not have any roles yet
          console.log('No existing roles for user:', error)
          setUserRoles([])
          setSelectedRoles([])
        }

      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load roles data",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [open, user.id, toast])

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId])
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)

      const currentRoleIds = userRoles.map(role => role.id)
      const rolesToAdd = selectedRoles.filter(roleId => !currentRoleIds.includes(roleId))
      const rolesToRemove = currentRoleIds.filter(roleId => !selectedRoles.includes(roleId))

      // Add new roles
      for (const roleId of rolesToAdd) {
        await userService.assignRoleToUser(user.id, roleId)
      }

      // Remove unselected roles
      for (const roleId of rolesToRemove) {
        await userService.removeRoleFromUser(user.id, roleId)
      }

      toast({
        title: "Success",
        description: `User roles updated successfully`,
        variant: "default",
      })

      onRolesUpdated?.()
      onOpenChange(false)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user roles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRolesByLevel = () => {
    const grouped = availableRoles.reduce((acc, role) => {
      const level = role.level || 1
      if (!acc[level]) acc[level] = []
      acc[level].push(role)
      return acc
    }, {} as Record<number, Role[]>)

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a)) // Sort by level descending
      .map(([level, roles]) => ({ level: Number(level), roles }))
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 5: return "System Level"
      case 4: return "Executive Level"
      case 3: return "Management Level"
      case 2: return "Operational Level"
      case 1: return "Basic Level"
      default: return `Level ${level}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Roles: {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading roles...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Roles */}
            <div>
              <Label className="text-sm font-medium">Current Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {role.displayName}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                )}
              </div>
            </div>

            {/* Available Roles by Level */}
            <div>
              <Label className="text-sm font-medium">Available Roles</Label>
              <div className="space-y-4 mt-3">
                {getRolesByLevel().map(({ level, roles }) => (
                  <div key={level} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {getLevelLabel(level)}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {roles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={role.id}
                            checked={selectedRoles.includes(role.id)}
                            onCheckedChange={(checked) => 
                              handleRoleToggle(role.id, checked as boolean)
                            }
                            disabled={role.isSystemRole && !selectedRoles.includes(role.id)}
                          />
                          <Label 
                            htmlFor={role.id} 
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <Shield className="h-4 w-4" />
                            <div>
                              <span className="font-medium">{role.displayName}</span>
                              {role.description && (
                                <p className="text-xs text-muted-foreground">
                                  {role.description}
                                </p>
                              )}
                            </div>
                            {role.isSystemRole && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || loadingData}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
