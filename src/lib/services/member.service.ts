// member.service.ts
import axiosInstance from '@/lib/axios';

export interface Beneficiary {
  id?: number;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  contactInfo: string;
  isMinor: boolean;
  guardianName?: string;
  guardianContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id?: number;
  fullName: string;
  relationship: string;
  primaryPhone: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id?: number;
  nin: string;
  fullName: string;
  idNo: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  nationality?: string;
  region?: string;
  district?: string;
  ward?: string;
  village?: string;
  residence?: string;
  mobile?: string;
  pobox?: string;
  email?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  employerName?: string;
  incomeBracket?: string;
  tin?: string;
  accountNumber?: string;
  incomeSource?: string;
  businessType?: string;
  partners?: string;
  owners?: string;
  knowHow?: string;
  knowHowDetail?: string;
  otherSaccos?: string;
  declaration?: boolean;
  idCopyPath?: string;
  passportPhotoPath?: string;
  coverLetterPath?: string;
  
  // Business details
  businessName?: string;
  businessLocation?: string;
  businessRegistrationNumber?: string;
  businessStartDate?: string;
  businessDescription?: string;
  estimatedMonthlyIncome?: string;
  
  // Relationships
  beneficiaries?: Beneficiary[];
  emergencyContacts?: EmergencyContact[];
  
  createdAt?: string;
  updatedAt?: string;
}

export const MemberService = {
  // Get the next available account number
  getNextAccountNumber: () => {
    return axiosInstance.get('/members/next-account-number');
  },
  
  // Create a new member
  create: (data: Partial<Member>) => axiosInstance.post('/members', data),

  // Read operations
  getAll: () => axiosInstance.get<Member[]>('/members'),

  getById: (id: number | string) => axiosInstance.get<Member>(`/members/${id}`),

  update: (id: number | string, data: Partial<Member>) => axiosInstance.put(`/members/${id}`, data),

  delete: (id: number | string) => axiosInstance.delete(`/members/${id}`),
  
  // Excel upload functions
  
  // Download Excel template for member registration
  downloadTemplate: () => {
    return axiosInstance.get('/members/uploads/template', { responseType: 'blob' });
  },
  
  // Upload Excel file with member data
  uploadExcel: (file: File, accountTypeId?: number, branchId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (accountTypeId) {
      formData.append('accountTypeId', accountTypeId.toString());
    }
    if (branchId) {
      formData.append('branchId', branchId);
    }
    
    return axiosInstance.post('/members/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
