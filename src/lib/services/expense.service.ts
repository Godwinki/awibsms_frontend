import axiosInstance from '@/lib/axios';

export interface ExpenseItem {
  id: string;
  expenseId: string;
  categoryId: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  receiptPath?: string;
}

export interface Expense {
  id: string;
  userId: string;
  departmentId: string;
  description: string;
  totalEstimatedAmount: number;
  totalActualAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'MANAGER_APPROVED' | 'ACCOUNTANT_APPROVED' | 'PROCESSED' | 'COMPLETED' | 'REJECTED';
  managerApprovalDate?: Date;
  managerApprovalUserId?: string;
  managerNotes?: string;
  accountantApprovalDate?: Date;
  accountantApprovalUserId?: string;
  accountantNotes?: string;
  budgetAllocationIds?: string[];
  processedDate?: Date;
  processedByUserId?: string;
  transactionDetails?: string;
  cashierNotes?: string;
  completedDate?: Date;
  rejectedDate?: Date;
  rejectedByUserId?: string;
  rejectionReason?: string;
  receipts?: { file: string; path: string; mimetype: string }[];
  items?: ExpenseItem[];
  requestNumber?: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  purpose?: string;
  totalAmount: number;
  departmentId: string;
  requiresReceipt?: boolean;
  fiscalYear?: number;
  items?: {
    description: string;
    unitPrice: number;
    quantity?: number;
    categoryId: string;
    notes?: string;
  }[];
}

export interface BudgetWarning {
  categoryId: string;
  categoryName: string;
  allocated: number;
  currentlyUsed: number;
  requested: number;
  deficit: number;
}

class ExpenseServiceClass {
  /**
   * Create a new expense request
   */
  async createExpenseRequest(data: CreateExpenseRequest): Promise<Expense> {
    console.log('Expense service sending data:', data);
    const response = await axiosInstance.post('/expenses', data);
    return response.data.data;
  }

  /**
   * Get all expense requests with optional filters
   */
  async getExpenseRequests(filters?: {
    status?: string;
    departmentId?: number | string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Expense[]> {
    const response = await axiosInstance.get('/expenses', { params: filters });
    return response.data.data;
  }

  /**
   * Get an expense request by ID
   */
  async getExpenseRequestById(id: string): Promise<Expense> {
    const response = await axiosInstance.get(`/expenses/${id}`);
    return response.data.data;
  }

  /**
   * Submit an expense request for approval
   */
  async submitExpenseRequest(id: string): Promise<Expense> {
    const response = await axiosInstance.post(`/expenses/${id}/submit`);
    return response.data.data;
  }

  /**
   * Add an expense item to an expense request
   */
  async addExpenseItem(
    expenseId: string,
    data: {
      categoryId: string;
      description: string;
      unitPrice: number;
      quantity?: number;
      notes?: string;
    }
  ): Promise<ExpenseItem> {
    const response = await axiosInstance.post(`/expenses/${expenseId}/items`, data);
    return response.data.data;
  }

  /**
   * Manager approval of an expense request
   */
  async approveByManager(
    id: string,
    data: { notes?: string }
  ): Promise<{ expense: Expense; budgetWarnings?: BudgetWarning[] }> {
    try {
      const response = await axiosInstance.post(`/expenses/${id}/approve/manager`, data);
      return {
        expense: response.data.data,
        budgetWarnings: response.data.budgetWarnings || undefined
      };
    } catch (error) {
      console.error('Error approving expense by manager:', error);
      throw error;
    }
  }

  /**
   * Accountant approval of an expense request
   */
  async approveByAccountant(
    id: string,
    data: { notes?: string; budgetAllocationIds: string[] }
  ): Promise<{ expense: Expense; budgetWarnings?: BudgetWarning[] }> {
    try {
      const response = await axiosInstance.post(`/expenses/${id}/approve/accountant`, data);
      return {
        expense: response.data.data,
        budgetWarnings: response.data.budgetWarnings || undefined
      };
    } catch (error) {
      console.error('Error approving expense by accountant:', error);
      throw error;
    }
  }

  /**
   * Cashier processing of an expense request
   */
  async processByCashier(
    id: string,
    data: { 
      transactionDetails: string; 
      notes?: string;
      overrideBudgetLimit?: boolean;
    }
  ): Promise<Expense> {
    try {
      const response = await axiosInstance.post(`/expenses/${id}/process`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing expense by cashier:', error.response?.data || error);
      
      // Check if this is a budget exceeded error
      if (error.response?.data?.status === 'budget_exceeded') {
        throw {
          type: 'budget_exceeded',
          message: error.response.data.message,
          data: error.response.data.data
        };
      }
      throw error;
    }
  }

  /**
   * Mark an expense as completed
   */
  async markExpenseCompleted(id: string): Promise<Expense> {
    const response = await axiosInstance.post(`/expenses/${id}/complete`);
    return response.data.data;
  }

  /**
   * Reject an expense request
   */
  async rejectExpenseRequest(
    id: string,
    data: { rejectionReason: string }
  ): Promise<Expense> {
    const response = await axiosInstance.post(`/expenses/${id}/reject`, data);
    return response.data.data;
  }

  /**
   * Upload a receipt for an expense
   */
  async uploadReceipt(
    id: string,
    file: File
  ): Promise<{ file: string; path: string; mimetype: string }> {
    const formData = new FormData();
    formData.append("receipt", file);

    const response = await axiosInstance.post(`/expenses/${id}/receipts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * Get the PDF URL for an expense
   * Returns the relative path (baseURL already includes /api)
   */
  getExpensePdfUrl(id: string): string {
    return `/expenses/${id}/pdf`;
  }
}

export const expenseService = new ExpenseServiceClass(); 