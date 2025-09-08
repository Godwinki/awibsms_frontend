import axios from '@/lib/axios';

export interface BudgetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: 'income' | 'expense' | 'capital';
  allocatedAmount: number;
  usedAmount: number;
  status?: 'active' | 'frozen' | 'depleted';
  fiscalYear?: number;
  parentId?: string;
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  status: 'active' | 'inactive'
}

export interface Budget {
  id: string
  fiscalYear: number
  departmentId: string
  department: Department
  startDate: Date
  endDate: Date
  totalAmount: number
  status: 'draft' | 'active' | 'closed'
  description: string
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
}

export interface BudgetAllocation {
  categoryId: string;
  allocatedAmount: number;
  fiscalYear?: number;
}

class BudgetService {
  // Budget Categories
  async getBudgetCategories(type?: string, fiscalYear?: number) {
    const params: any = {};
    if (type) params.type = type;
    if (fiscalYear) params.fiscalYear = fiscalYear;
    
    const response = await axios.get('/budget/categories', { params });
    return response.data.data;
  }

  async createBudgetCategory(data: Partial<BudgetCategory>) {
    const response = await axios.post('/budget/categories', data);
    return response.data.data;
  }

  async updateBudgetCategory(id: string, data: Partial<BudgetCategory>) {
    const response = await axios.patch(`/budget/categories/${id}`, data);
    return response.data.data;
  }

  async deleteBudgetCategory(id: string) {
    const response = await axios.delete(`/budget/categories/${id}`);
    return response.data;
  }

  async allocateBudget(categoryId: string, data: BudgetAllocation) {
    const response = await axios.post(`/budget/categories/${categoryId}/allocate`, data);
    return response.data.data;
  }

  // Departments
  async getDepartments() {
    const response = await axios.get('/organization');
    return response.data.data;
  }

  // Budgets
  async getBudgets() {
    const response = await axios.get('/budget');
    return response.data.data;
  }

  async createBudget(data: Partial<Budget>) {
    const response = await axios.post('/budget', data);
    return response.data.data;
  }

  async getBudget(id: string) {
    const response = await axios.get(`/budget/${id}`);
    return response.data.data;
  }

  async updateBudget(id: string, data: Partial<Budget>) {
    const response = await axios.patch(`/budget/${id}`, data);
    return response.data.data;
  }

  async deleteBudget(id: string) {
    const response = await axios.delete(`/budget/${id}`);
    return response.data;
  }

  // Budget Allocations
  async createBudgetAllocation(data: Partial<BudgetAllocation>) {
    const response = await axios.post('/budget/allocations', data);
    return response.data.data;
  }

  async getBudgetAllocations(budgetId: string) {
    const response = await axios.get(`/budget/allocations`, { params: { budgetId } });
    return response.data.data;
  }
}

export const budgetService = new BudgetService(); 