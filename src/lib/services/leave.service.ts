import axiosInstance from '@/lib/axios';

export interface Leave {
  id: string
  requestNumber: string
  userId: string
  type: string
  startDate: Date
  endDate: Date
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  notes?: string
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  approvedBy?: string
  rejectedAt?: Date
  rejectedBy?: string
  user?: {
    firstName: string
    lastName: string
    department: string
  }
}

export interface CreateLeaveRequest {
  type: string
  startDate: string
  endDate: string
  reason: string
}

class LeaveService {
  async getLeaveRequests(filters?: {
    status?: string
    userId?: string
  }): Promise<Leave[]> {
    const response = await axiosInstance.get('/leaves', { params: filters })
    return response.data.data
  }

  async getLeaveRequestById(id: string): Promise<Leave> {
    const response = await axiosInstance.get(`/leaves/${id}`)
    return response.data.data
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<Leave> {
    const response = await axiosInstance.post('/leaves', data)
    return response.data.data
  }

  async approveLeaveRequest(id: string, notes?: string): Promise<Leave> {
    const response = await axiosInstance.post(`/leaves/${id}/approve`, { notes })
    return response.data.data
  }

  async rejectLeaveRequest(id: string, reason?: string): Promise<Leave> {
    const response = await axiosInstance.post(`/leaves/${id}/reject`, { reason })
    return response.data.data
  }
}

export const leaveService = new LeaveService()