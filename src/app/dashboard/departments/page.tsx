"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { departmentService } from "@/lib/services/department.service"

interface Department {
  id: string
  name: string
  code: string
  description: string
  status: 'active' | 'inactive'
}

export default function DepartmentsPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: ''
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setIsLoading(true)
      const data = await departmentService.getDepartments()
      setDepartments(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load departments",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, newDepartment)
        toast({
          title: "Success",
          description: "Department updated successfully"
        })
      } else {
        await departmentService.createDepartment(newDepartment)
        toast({
          title: "Success",
          description: "Department created successfully"
        })
      }
      setIsDialogOpen(false)
      loadDepartments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Operation failed",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      await departmentService.deleteDepartment(id)
      toast({
        title: "Success",
        description: "Department deleted successfully"
      })
      loadDepartments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete department",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage organization departments
          </p>
        </div>
        
        <Button onClick={() => {
          setEditingDepartment(null)
          setNewDepartment({ name: '', code: '', description: '' })
          setIsDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.code}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDepartment(dept)
                          setNewDepartment({
                            name: dept.name,
                            code: dept.code,
                            description: dept.description
                          })
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit' : 'Create New'} Department</DialogTitle>
            <DialogDescription>
              {editingDepartment ? 'Update department details' : 'Add a new department to the organization'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="code" className="text-right">
                  Code
                </label>
                <Input
                  id="code"
                  placeholder="e.g., HR, IT, FIN"
                  className="col-span-3"
                  value={newDepartment.code}
                  onChange={(e) => setNewDepartment({
                    ...newDepartment,
                    code: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Department name"
                  className="col-span-3"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({
                    ...newDepartment,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Brief description"
                  className="col-span-3"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({
                    ...newDepartment,
                    description: e.target.value
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingDepartment ? 'Update' : 'Create'} Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 