'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Shield, Users, Key, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import roleService, { Role, Permission, PermissionMatrix, CreateRoleRequest } from '@/lib/services/role.service'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('roles')

  // Form states
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    displayName: '',
    description: '',
    level: 1,
    permissionIds: []
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load data sequentially to debug issues
      console.log('Loading roles...')
      const rolesResponse = await roleService.getRoles()
      console.log('Roles response:', rolesResponse)
      
      console.log('Loading permissions...')
      const permissionsResponse = await roleService.getPermissions()
      console.log('Permissions response:', permissionsResponse)
      
      console.log('Loading matrix...')
      const matrixResponse = await roleService.getPermissionMatrix()
      console.log('Matrix response:', matrixResponse)
      
      setRoles(Array.isArray(rolesResponse) ? rolesResponse : [])
      setPermissions(Array.isArray(permissionsResponse) ? permissionsResponse : [])
      setPermissionMatrix(matrixResponse)
      
    } catch (error) {
      toast.error('Failed to load roles and permissions')
      console.error('Error loading data:', error)
      // Set empty arrays as fallback
      setRoles([])
      setPermissions([])
      setPermissionMatrix(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      await roleService.createRole(formData)
      toast.success('Role created successfully')
      setIsCreateDialogOpen(false)
      setFormData({ name: '', displayName: '', description: '', level: 1, permissionIds: [] })
      loadData()
    } catch (error) {
      toast.error('Failed to create role')
      console.error('Error creating role:', error)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    try {
      await roleService.updateRole(selectedRole.id, {
        displayName: formData.displayName,
        description: formData.description,
        level: formData.level
      })
      toast.success('Role updated successfully')
      setIsEditDialogOpen(false)
      setSelectedRole(null)
      loadData()
    } catch (error) {
      toast.error('Failed to update role')
      console.error('Error updating role:', error)
    }
  }

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystemRole) {
      toast.error('Cannot delete system roles')
      return
    }
    
    if (confirm(`Are you sure you want to delete the role "${role.displayName}"?`)) {
      try {
        await roleService.deleteRole(role.id)
        toast.success('Role deleted successfully')
        loadData()
      } catch (error) {
        toast.error('Failed to delete role')
        console.error('Error deleting role:', error)
      }
    }
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: checked 
        ? [...(prev.permissionIds || []), permissionId]
        : (prev.permissionIds || []).filter(id => id !== permissionId)
    }))
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      level: role.level,
      permissionIds: role.permissions?.map(p => p.id) || []
    })
    setIsEditDialogOpen(true)
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module
    if (!acc[module]) {
      acc[module] = []
    }
    acc[module].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles and permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">
            Manage system roles and permissions for granular access control
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {role.displayName}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Level:</span>
                      <Badge variant="secondary">{role.level}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Permissions:</span>
                      <Badge variant="outline">{role.permissions?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Users:</span>
                      <Badge variant="outline">{role.userCount || 0}</Badge>
                    </div>
                    {role.isSystemRole && (
                      <Badge variant="destructive" className="w-full justify-center">
                        System Role
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <Card key={module}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {module.charAt(0).toUpperCase() + module.slice(1)} Module
                  </CardTitle>
                  <CardDescription>
                    {modulePermissions.length} permissions available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {modulePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{permission.displayName}</p>
                          <p className="text-xs text-muted-foreground">{permission.name}</p>
                        </div>
                        {permission.isSystemPermission && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of which roles have which permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module}>
                      <h4 className="font-semibold mb-2">{module.charAt(0).toUpperCase() + module.slice(1)}</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(100px,1fr))] gap-0 text-sm">
                          <div className="bg-muted p-2 font-medium border-r">Permission</div>
                          {roles.map(role => (
                            <div key={role.id} className="bg-muted p-2 text-center font-medium border-r last:border-r-0">
                              {role.displayName}
                            </div>
                          ))}
                          {modulePermissions.map(permission => (
                            <>
                              <div key={permission.id} className="p-2 border-r border-t">
                                <div className="font-medium">{permission.displayName}</div>
                                <div className="text-xs text-muted-foreground">{permission.action}</div>
                              </div>
                              {roles.map(role => (
                                <div key={`${permission.id}-${role.id}`} className="p-2 text-center border-r border-t last:border-r-0">
                                  {role.permissions?.some(p => p.id === permission.id) ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                                  ) : (
                                    <div className="h-4 w-4 mx-auto"></div>
                                  )}
                                </div>
                              ))}
                            </>
                          ))}
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role and assign permissions to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., branch_manager"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., Branch Manager"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's responsibilities..."
              />
            </div>
            <div>
              <Label htmlFor="level">Role Level</Label>
              <Select value={formData.level.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(level => (
                    <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Permissions</Label>
              <ScrollArea className="h-[200px] border rounded p-4">
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module}>
                      <h5 className="font-medium mb-2">{module.charAt(0).toUpperCase() + module.slice(1)}</h5>
                      <div className="space-y-2 ml-4">
                        {modulePermissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissionIds?.includes(permission.id)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.displayName}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              {selectedRole.isSystemRole && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a system role. Some properties cannot be modified.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    disabled={selectedRole.isSystemRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-displayName">Display Name</Label>
                  <Input
                    id="edit-displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Role Level</Label>
                <Select 
                  value={formData.level.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
                  disabled={selectedRole.isSystemRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(level => (
                      <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
