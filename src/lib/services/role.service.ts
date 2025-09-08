import axiosInstance from '@/lib/axios';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  userCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  resource: string;
  action: string;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  grantedAt: string;
  grantedBy: string;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
  role?: Role;
}

export interface PermissionMatrix {
  modules: {
    [module: string]: {
      resources: {
        [resource: string]: {
          actions: string[];
        };
      };
    };
  };
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  level: number;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
  level?: number;
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

const roleService = {
  // Role management
  async getRoles(): Promise<Role[]> {
    const response = await axiosInstance.get('/system/roles?includePermissions=true&includeUsers=true');
    return response.data.data || response.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await axiosInstance.get(`/system/roles/${id}`);
    return response.data;
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await axiosInstance.post('/system/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await axiosInstance.patch(`/system/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(`/system/roles/${id}`);
  },

  // Permission management
  async getPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get('/system/permissions');
    return response.data.data || response.data;
  },

  async getPermission(id: string): Promise<Permission> {
    const response = await axiosInstance.get(`/system/permissions/${id}`);
    return response.data;
  },

  async createPermission(data: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const response = await axiosInstance.post('/system/permissions', data);
    return response.data;
  },

  async updatePermission(id: string, data: Partial<Permission>): Promise<Permission> {
    const response = await axiosInstance.patch(`/system/permissions/${id}`, data);
    return response.data;
  },

  async deletePermission(id: string): Promise<void> {
    await axiosInstance.delete(`/system/permissions/${id}`);
  },

  // Role-Permission relationships
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    const response = await axiosInstance.get(`/system/roles/${roleId}/permissions`);
    return response.data;
  },

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await axiosInstance.post(`/system/roles/${roleId}/permissions`, { permissionId });
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await axiosInstance.delete(`/system/roles/${roleId}/permissions/${permissionId}`);
  },

  // User-Role relationships
  async assignRole(data: AssignRoleRequest): Promise<void> {
    await axiosInstance.post('/system/roles/assign', data);
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await axiosInstance.delete(`/system/roles/assign`, { data: { userId, roleId } });
  },

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const response = await axiosInstance.get(`/auth/users/${userId}/roles`);
    return response.data;
  },

  // Permission matrix and structure
  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const response = await axiosInstance.get('/system/permissions/matrix/view');
    return response.data.data || response.data;
  },

  async getModuleStructure(): Promise<any> {
    const response = await axiosInstance.get('/system/permissions/modules');
    return response.data;
  },

  // User permissions
  async getUserPermissions(userId: string): Promise<{ permissions: Permission[]; roles: Role[] }> {
    const response = await axiosInstance.get(`/auth/users/${userId}/permissions`);
    return response.data;
  },

  async getMyPermissions(): Promise<{ permissions: Permission[]; roles: Role[] }> {
    const response = await axiosInstance.get('/auth/users/me/permissions');
    return response.data;
  },

  async checkUserPermission(userId: string, permission: string): Promise<{ hasPermission: boolean }> {
    const response = await axiosInstance.get(`/auth/users/${userId}/check-permission?permission=${permission}`);
    return response.data;
  }
};

export default roleService;
