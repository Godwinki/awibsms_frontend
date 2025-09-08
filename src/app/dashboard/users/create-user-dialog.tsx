"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserData, UserRole } from "@/lib/services/user.service"
import { useToast } from "@/components/ui/use-toast"
import roleService, { Role } from "@/lib/services/role.service"
import branchService, { Branch } from "@/lib/services/branch.service"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserData) => void
}

const departments = [
  "Administration",
  "Finance",
  "Operations",
  "Information Technology",
  "Human Resources",
  "Marketing",
  "Loans",
  "Customer Service",
  "Board",
]

export function CreateUserDialog({ open, onOpenChange, onSubmit }: CreateUserDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    role: "clerk",
    password: "",
    branchId: ""
  })

  // Load roles and branches from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingRoles(true)
        setLoadingBranches(true)
        
        const [rolesData, branchesData] = await Promise.all([
          roleService.getRoles(),
          branchService.getActiveBranches()
        ])
        
        setRoles(Array.isArray(rolesData) ? rolesData : [])
        setBranches(Array.isArray(branchesData) ? branchesData : [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Warning",
          description: "Failed to load roles or branches from database",
          variant: "destructive",
        })
      } finally {
        setLoadingRoles(false)
        setLoadingBranches(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open, toast])

  // Update the phone number validation for Tanzanian format
  const validatePhoneNumber = (value: string) => {
    // Tanzanian phone number format: +255 followed by 9 digits
    // Supports formats like: +255744958059, +255658958059, +255788958059
    const phoneRegex = /^\+255[67845]\d{8}$/
    if (value && !phoneRegex.test(value)) {
      toast({
        title: "Warning",
        description: "Phone number should be in Tanzanian format: +255XXXXXXXXX (e.g., +255744958059)",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePhoneNumber(formData.phoneNumber)) return
    if (!validatePassword(formData.password)) return
    
    setIsLoading(true)

    try {
      await onSubmit(formData)
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default",
      })
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        department: "",
        role: "clerk",
        password: "",
        branchId: ""
      })
      onOpenChange(false)
    } catch (error: any) {
      // Handle specific error cases
      let errorMessage = error.message || "Failed to create user"
      
      // Parse the error message to provide more specific feedback
      if (errorMessage.toLowerCase().includes('exists')) {
        errorMessage = "A user with this email or phone number already exists"
      } else if (errorMessage.toLowerCase().includes('email')) {
        errorMessage = "Invalid email address"
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <p>• The user will be required to change their password on first login</p>
            <p>• Two-factor authentication (2FA) will be enabled automatically</p>
            <p>• They will receive verification codes via email</p>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, phoneNumber: e.target.value })
              }}
              onBlur={(e) => validatePhoneNumber(e.target.value)}
              placeholder="+255744XXXXXX"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch *</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => setFormData({ ...formData, branchId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {loadingBranches ? (
                  <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                ) : branches.length > 0 ? (
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.displayName || branch.name} ({branch.branchCode})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-branches" disabled>No branches available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {loadingRoles ? (
                  <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.displayName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-roles" disabled>No roles available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="User must change this on first login"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 