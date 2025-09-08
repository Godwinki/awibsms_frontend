'use client'

import { useState, useEffect } from 'react';
import { withRoleProtection } from '@/components/auth/withRoleProtection';
import { UserData, CreateUserData, userService } from '@/lib/services/user.service';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';
import { DataTable } from './data-table';
import { createColumns } from './columns';
import { CreateUserDialog } from './create-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { UserRolesDialog } from './user-roles-dialog';
import { useToast } from '@/components/ui/use-toast';

function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const data = await userService.getAllUsers();
      console.log('Users data received:', data);
      // Check if we received any users
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Found ${data.length} users`);
      } else {
        console.warn('No users found or data is not an array');
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const result = await userService.createUser(userData);
      toast({
        title: "Success",
        description: result.message || "User created successfully",
      });
      fetchUsers(); // Refresh the list
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      // Let the CreateUserDialog handle the error display
      throw error;
    }
  };

  const handleEditUser = async (id: string, userData: Partial<UserData>) => {
    await userService.updateUser(id, userData);
    await fetchUsers(); // Refresh the list
  };

  const handleDeleteUser = async (id: string) => {
    await userService.deleteUser(id);
    await fetchUsers(); // Refresh the list
  };

  const tableColumns = createColumns(
    (user: UserData) => {
      setSelectedUser(user)
      setIsEditDialogOpen(true)
    },
    (user: UserData) => {
      setSelectedUser(user)
      setIsDeleteDialogOpen(true)
    },
    (user: UserData) => {
      setSelectedUser(user)
      setIsRolesDialogOpen(true)
    }
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable columns={tableColumns} data={users} />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            user={selectedUser}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleEditUser}
          />
          <DeleteUserDialog
            user={selectedUser}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteUser}
          />
          <UserRolesDialog
            user={selectedUser}
            open={isRolesDialogOpen}
            onOpenChange={setIsRolesDialogOpen}
            onRolesUpdated={fetchUsers}
          />
        </>
      )}
    </div>
  );
}

export default withRoleProtection(UsersPage, ['admin', 'super_admin']); 