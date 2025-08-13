import type { User } from "./user.types";
import type { Department } from "./department.types";
import type { BudgetCategory } from "./budget.types";

export type ExpenseStatus = 
  | 'DRAFT'
  | 'SUBMITTED' 
  | 'MANAGER_APPROVED' 
  | 'ACCOUNTANT_APPROVED' 
  | 'PROCESSED' 
  | 'COMPLETED' 
  | 'REJECTED';

export type ExpenseItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ExpenseItem {
  id: number;
  expenseId: number;
  categoryId: number;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  status: ExpenseItemStatus;
  notes?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
  BudgetCategory?: BudgetCategory;
}

export interface Expense {
  id: number;
  userId: number;
  departmentId: number;
  description: string;
  totalEstimatedAmount: number;
  totalActualAmount: number;
  status: ExpenseStatus;
  managerApprovalDate?: string;
  managerApprovalUserId?: number;
  managerNotes?: string;
  accountantApprovalDate?: string;
  accountantApprovalUserId?: number;
  accountantNotes?: string;
  budgetAllocationIds?: number[];
  processedDate?: string;
  processedByUserId?: number;
  transactionDetails?: string;
  cashierNotes?: string;
  completedDate?: string;
  rejectedDate?: string;
  rejectedByUserId?: number;
  rejectionReason?: string;
  receipts?: string[];
  createdAt: string;
  updatedAt: string;
  User?: User;
  Department?: Department;
  ExpenseItems?: ExpenseItem[];
  ManagerApprover?: User;
  AccountantApprover?: User;
  CashierProcessor?: User;
  Rejector?: User;
} 