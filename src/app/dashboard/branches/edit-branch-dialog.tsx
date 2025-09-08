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
import { Branch, UpdateBranchData } from "@/lib/services/branch.service"
import { useToast } from "@/components/ui/use-toast"

interface EditBranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: Branch
  onSubmit: (data: UpdateBranchData) => void
}

const tanzanianRegions = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
  "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara",
  "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North",
  "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu",
  "Singida", "Songwe", "Tabora", "Tanga", "Unguja North", "Unguja South"
]

const servicesOptions = [
  "Savings Accounts",
  "Loan Services", 
  "Money Transfer",
  "Mobile Banking",
  "Insurance Services",
  "Investment Advisory",
  "Business Banking",
  "Microfinance",
  "Foreign Exchange",
  "ATM Services"
]

export function EditBranchDialog({ open, onOpenChange, branch, onSubmit }: EditBranchDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateBranchData>({})

  // Initialize form with branch data when dialog opens
  useEffect(() => {
    if (open && branch) {
      setFormData({
        name: branch.name,
        displayName: branch.displayName,
        region: branch.region,
        district: branch.district,
        ward: branch.ward,
        street: branch.street,
        branchType: branch.branchType,
        status: branch.status,
        primaryPhone: branch.primaryPhone,
        email: branch.email,
        servicesOffered: branch.servicesOffered || [],
        accountNumberPrefix: branch.accountNumberPrefix
      })
    }
  }, [open, branch])

  const validateForm = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Branch name is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.region) {
      toast({
        title: "Validation Error",
        description: "Region is required", 
        variant: "destructive",
      })
      return false
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    // Validate phone format if provided (Tanzanian format)
    if (formData.primaryPhone && !/^\+255[67845]\d{8}$/.test(formData.primaryPhone)) {
      toast({
        title: "Validation Error",
        description: "Phone number should be in Tanzanian format: +255XXXXXXXXX",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error: any) {
      // Error is handled in parent component
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceToggle = (service: string) => {
    const services = formData.servicesOffered || []
    if (services.includes(service)) {
      setFormData({
        ...formData,
        servicesOffered: services.filter(s => s !== service)
      })
    } else {
      setFormData({
        ...formData,
        servicesOffered: [...services, service]
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Branch - {branch.branchCode}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label>Branch Code</Label>
            <Input
              value={branch.branchCode}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Branch code cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Arusha Main Branch"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName || ""}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Arusha Branch"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchType">Branch Type</Label>
              <Select
                value={formData.branchType}
                onValueChange={(value: "MAIN" | "SUB_BRANCH" | "AGENT" | "KIOSK") => 
                  setFormData({ ...formData, branchType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAIN">Head Office</SelectItem>
                  <SelectItem value="SUB_BRANCH">Sub Branch</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="KIOSK">Kiosk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "suspended") => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Select
              value={formData.region}
              onValueChange={(value) => setFormData({ ...formData, region: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {tanzanianRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district || ""}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g., Arusha Urban"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">Ward</Label>
              <Input
                id="ward"
                value={formData.ward || ""}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                placeholder="e.g., Kaloleni"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.street || ""}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g., Sokoine Road"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Phone Number</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone || ""}
                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                placeholder="+255744XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="branch@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Number Prefix</Label>
            <Input
              value={formData.accountNumberPrefix || ""}
              onChange={(e) => setFormData({ ...formData, accountNumberPrefix: e.target.value.toUpperCase() })}
              placeholder="e.g., ARU"
            />
          </div>

          {/* Services Offered */}
          <div className="space-y-2">
            <Label>Services Offered</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {servicesOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={service}
                    checked={(formData.servicesOffered || []).includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="rounded"
                  />
                  <label htmlFor={service} className="text-sm cursor-pointer">
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
