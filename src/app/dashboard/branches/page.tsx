"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { branchService, Branch } from "@/lib/services/branch.service"
import { CreateBranchDialog } from "./create-branch-dialog"
import { EditBranchDialog } from "./edit-branch-dialog"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Plus,
  Edit3,
  MoreVertical,
  Search,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BranchManagementPage() {
  const { toast } = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      setLoading(true)
      const data = await branchService.getAllBranches()
      setBranches(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Failed to load branches:', error)
      setBranches([]) // Ensure branches is always an array
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async (branchData: any) => {
    try {
      await branchService.createBranch(branchData)
      await loadBranches()
      toast({
        title: "Success",
        description: "Branch created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleUpdateBranch = async (id: string, branchData: any) => {
    try {
      await branchService.updateBranch(id, branchData)
      await loadBranches()
      toast({
        title: "Success",
        description: "Branch updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleToggleStatus = async (branch: Branch, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await branchService.toggleBranchStatus(branch.id, newStatus)
      await loadBranches()
      toast({
        title: "Success",
        description: `Branch ${newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'suspended'} successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch status",
        variant: "destructive",
      })
    }
  }

  const filteredBranches = Array.isArray(branches) ? branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.region.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || branch.status === statusFilter
    const matchesType = typeFilter === "all" || branch.branchType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) : []

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'suspended':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getBranchTypeDisplay = (type: string) => {
    switch (type) {
      case 'MAIN':
        return 'Head Office'
      case 'SUB_BRANCH':
        return 'Sub Branch'
      case 'AGENT':
        return 'Agent'
      case 'KIOSK':
        return 'Kiosk'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage your organization's branches and locations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches by name, code, or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MAIN">Head Office</SelectItem>
                <SelectItem value="SUB_BRANCH">Sub Branch</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="KIOSK">Kiosk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{branch.displayName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{branch.branchCode}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedBranch(branch)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {branch.status === 'active' ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(branch, 'inactive')}
                        >
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(branch, 'suspended')}
                        >
                          Suspend
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(branch, 'active')}
                      >
                        Activate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadgeVariant(branch.status)}>
                  {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {getBranchTypeDisplay(branch.branchType)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{branch.region}</span>
                </div>
                
                {branch.primaryPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{branch.primaryPhone}</span>
                  </div>
                )}
                
                {branch.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{branch.email}</span>
                  </div>
                )}
              </div>

              {branch.isHeadOffice && (
                <Badge variant="secondary" className="w-full justify-center">
                  Head Office
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No branches found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by creating your first branch"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateBranchDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateBranch}
      />
      
      {selectedBranch && (
        <EditBranchDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          branch={selectedBranch}
          onSubmit={(data) => handleUpdateBranch(selectedBranch.id, data)}
        />
      )}
    </div>
  )
}
