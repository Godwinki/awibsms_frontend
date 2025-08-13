// account-type.service.ts
import axiosInstance from '@/lib/axios';

export interface AccountType {
  id: number;
  name: string;
  description?: string;
  code?: string;
  prefix?: string;
  interestRate?: number;
  minBalance?: number;
  maxBalance?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AccountTypeService = {
  // Get all account types
  getAll: () => axiosInstance.get<AccountType[]>('account-types'),

  // Get an account type by ID
  getById: (id: number | string) => axiosInstance.get<AccountType>(`account-types/${id}`),

  // Create a new account type
  create: (data: Partial<AccountType>) => axiosInstance.post('account-types', data),

  // Update an account type
  update: (id: number | string, data: Partial<AccountType>) => axiosInstance.put(`account-types/${id}`, data),

  // Delete an account type
  delete: (id: number | string) => axiosInstance.delete(`account-types/${id}`)
};
