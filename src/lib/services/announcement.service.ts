import axiosInstance from '@/lib/axios';

export interface Announcement {
  id?: number;
  title: string;
  titleSwahili?: string;
  content: string;
  contentSwahili?: string;
  summary?: string;
  summarySwahili?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'scheduled' | 'expired';
  category: string;
  targetAudience: string;
  publishDate: string | Date;
  expiryDate?: string | Date;
  eventDate?: string | Date;
  venue?: string;
  venueSwahili?: string;
  maxParticipants?: number;
  registrationRequired: boolean;
  registrationDeadline?: string | Date;
  isFeatured: boolean;
  isPublic: boolean;
  allowComments: boolean;
  sendNotification: boolean;
  bannerUrl?: string;
  tags?: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
  targetAudience?: string;
  isFeatured?: boolean;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AnnouncementService {
  // Get all announcements (CMS)
  async getAllAnnouncements(filters: AnnouncementFilters = {}): Promise<AnnouncementResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get(`/announcements?${params.toString()}`);
    return response.data;
  }

  // Get public announcements (Website)
  async getPublicAnnouncements(filters: { 
    category?: string; 
    language?: string; 
    active?: boolean;
    featured?: boolean;
    limit?: number;
  } = {}): Promise<{ announcements: Announcement[] }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get(`/announcements/public?${params.toString()}`);
    return response.data;
  }

  // Get single announcement
  async getAnnouncement(id: number): Promise<Announcement> {
    const response = await axiosInstance.get(`/announcements/${id}`);
    return response.data.announcement;
  }

  // Create announcement
  async createAnnouncement(data: Partial<Announcement>, banner?: File): Promise<Announcement> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add banner file if provided
    if (banner) {
      formData.append('banner', banner);
    }

    const response = await axiosInstance.post('/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.announcement;
  }

  // Update announcement
  async updateAnnouncement(id: number, data: Partial<Announcement>, banner?: File): Promise<Announcement> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add banner file if provided
    if (banner) {
      formData.append('banner', banner);
    }

    const response = await axiosInstance.put(`/announcements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.announcement;
  }

  // Delete announcement
  async deleteAnnouncement(id: number): Promise<void> {
    await axiosInstance.delete(`/announcements/${id}`);
  }

  // Publish announcement
  async publishAnnouncement(id: number): Promise<Announcement> {
    const response = await axiosInstance.patch(`/announcements/${id}/publish`);
    return response.data.announcement;
  }

  // Get announcement categories
  async getCategories(): Promise<{ value: string; label: string }[]> {
    const response = await axiosInstance.get('/announcements/categories');
    return response.data.categories;
  }

  // Get target audiences
  async getTargetAudiences(): Promise<{ value: string; label: string }[]> {
    const response = await axiosInstance.get('/announcements/audiences');
    return response.data.audiences;
  }

  // Download banner
  async downloadBanner(id: number): Promise<Blob> {
    const response = await axiosInstance.get(`/announcements/${id}/banner`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const announcementService = new AnnouncementService();
