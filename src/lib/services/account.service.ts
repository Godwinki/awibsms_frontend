import axiosInstance from '@/lib/axios';

export interface AccountType {
  id?: number;
  name: string;
  description?: string;
  interestRate?: number;
  minimumBalance?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberAccount {
  id?: number;
  memberId: number;
  accountTypeId: number;
  accountNumber: string;
  balance: number;
  lastTransactionDate?: string;
  status?: 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'DORMANT';
  activationDate?: string;
  closureDate?: string;
  createdAt?: string;
  updatedAt?: string;
  accountType?: AccountType;
}

export interface Transaction {
  id?: number;
  memberAccountId: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  reference: string;
  performedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InitialPayment {
  memberId: number;
  joiningFee: number;
  shares: number;
  idFee: number;
  tshirtFee: number;
  joiningFormFee: number;
  passbookFee: number;
  totalAmount: number;
}

// Default values for initial payments
export const DEFAULT_INITIAL_PAYMENTS = {
  joiningFee: 150000,
  shareValue: 100000,
  idFee: 10000,
  tshirtFee: 15000,
  joiningFormFee: 5000,
  passbookFee: 5000,
  minShares: 1,
  maxShares: 10
};

export const AccountService = {
  // Account Types
  getAccountTypes: () => 
    axiosInstance.get<AccountType[]>('/accounts/account-types'),
  
  getAccountTypeById: (id: number) => 
    axiosInstance.get<AccountType>(`/accounts/account-types/${id}`),
  
  createAccountType: (data: Partial<AccountType>) => 
    axiosInstance.post('/accounts/account-types', data),
  
  updateAccountType: (id: number, data: Partial<AccountType>) => 
    axiosInstance.put(`/accounts/account-types/${id}`, data),
  
  deleteAccountType: (id: number) => 
    axiosInstance.delete(`/accounts/account-types/${id}`),
  
  // Member Accounts
  getMemberAccounts: (memberId: number) => 
    axiosInstance.get<MemberAccount[]>(`/members/${memberId}/accounts`),
  
  getMemberAccountById: (memberId: number, accountId: number) => 
    axiosInstance.get<MemberAccount>(`/members/${memberId}/accounts/${accountId}`),
  
  createMemberAccount: (memberId: number, data: Partial<MemberAccount>) => 
    axiosInstance.post(`/members/${memberId}/accounts`, data),
  
  updateMemberAccount: (memberId: number, accountId: number, data: Partial<MemberAccount>) => 
    axiosInstance.put(`/members/${memberId}/accounts/${accountId}`, data),
  
  closeMemberAccount: (memberId: number, accountId: number) => 
    axiosInstance.put(`/members/${memberId}/accounts/${accountId}/close`, { 
      status: 'CLOSED', 
      closureDate: new Date().toISOString() 
    }),
  
  // Transactions
  getAccountTransactions: (memberId: number, accountId: number) => 
    axiosInstance.get<Transaction[]>(`/members/${memberId}/accounts/${accountId}/transactions`),
  
  createTransaction: (memberId: number, accountId: number, data: Partial<Transaction>) => 
    axiosInstance.post(`/members/${memberId}/accounts/${accountId}/transactions`, data),
  
  // Initial Payments
  processInitialPayment: (memberId: number, data: Partial<InitialPayment>) => 
    axiosInstance.post(`/members/${memberId}/initial-payment`, data),
  
  // Calculate initial payment based on number of shares
  calculateInitialPayment: (numShares: number = 1): InitialPayment => {
    const shareAmount = Math.min(
      Math.max(numShares, DEFAULT_INITIAL_PAYMENTS.minShares), 
      DEFAULT_INITIAL_PAYMENTS.maxShares
    ) * DEFAULT_INITIAL_PAYMENTS.shareValue;
    
    const totalAmount = 
      DEFAULT_INITIAL_PAYMENTS.joiningFee + 
      shareAmount + 
      DEFAULT_INITIAL_PAYMENTS.idFee + 
      DEFAULT_INITIAL_PAYMENTS.tshirtFee + 
      DEFAULT_INITIAL_PAYMENTS.joiningFormFee + 
      DEFAULT_INITIAL_PAYMENTS.passbookFee;
    
    return {
      memberId: 0, // This will be set when actually processing
      joiningFee: DEFAULT_INITIAL_PAYMENTS.joiningFee,
      shares: shareAmount,
      idFee: DEFAULT_INITIAL_PAYMENTS.idFee,
      tshirtFee: DEFAULT_INITIAL_PAYMENTS.tshirtFee,
      joiningFormFee: DEFAULT_INITIAL_PAYMENTS.joiningFormFee,
      passbookFee: DEFAULT_INITIAL_PAYMENTS.passbookFee,
      totalAmount
    };
  }
};
