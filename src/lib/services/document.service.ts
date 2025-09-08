import axiosInstance from '@/lib/axios';

export interface PublicDocument {
  id: number;
  title: string;
  description?: string;
  detailedDescription?: string;
  category: string;
  documentType: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  downloadCount: number;
  isActive: boolean;
  isPublic: boolean;
  language: string;
  tags?: string;
  publishDate: string;
  expiryDate?: string;
  sortOrder: number;
  // Website-specific fields
  titleSwahili?: string;
  descriptionSwahili?: string;
  detailedDescriptionSwahili?: string;
  note?: string;
  noteSwahili?: string;
  uploader: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  detailedDescription?: string;
  category: string;
  documentType: string;
  language: string;
  tags?: string;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  publishDate?: string;
  expiryDate?: string;
  // Website-specific fields
  titleSwahili?: string;
  descriptionSwahili?: string;
  detailedDescriptionSwahili?: string;
  note?: string;
  noteSwahili?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  detailedDescription?: string;
  category?: string;
  documentType?: string;
  language?: string;
  tags?: string;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  publishDate?: string;
  expiryDate?: string;
  // Website-specific fields
  titleSwahili?: string;
  descriptionSwahili?: string;
  detailedDescriptionSwahili?: string;
  note?: string;
  noteSwahili?: string;
}

export interface DocumentFilters {
  category?: string;
  language?: string;
  search?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}

export interface DocumentCategory {
  value: string;
  label: string;
}

export interface DocumentType {
  value: string;
  label: string;
}

export interface PaginatedDocumentsResponse {
  documents: PublicDocument[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class DocumentServiceClass {
  /**
   * Get all public documents (for website consumption - no auth required)
   */
  async getPublicDocuments(filters?: {
    category?: string;
    language?: string;
    active?: boolean;
  }): Promise<PublicDocument[]> {
    const response = await axiosInstance.get('/content/public-documents/public', { 
      params: filters 
    });
    return response.data.documents;
  }

  /**
   * Get all documents for CMS management (requires auth)
   */
  async getAllDocuments(filters?: DocumentFilters): Promise<PaginatedDocumentsResponse> {
    const response = await axiosInstance.get('/content/public-documents/cms', { 
      params: filters 
    });
    return {
      documents: response.data.documents,
      pagination: response.data.pagination
    };
  }

  /**
   * Upload a new document (requires auth)
   */
  async uploadDocument(
    file: File,
    data: CreateDocumentRequest
  ): Promise<PublicDocument> {
    const formData = new FormData();
    formData.append('document', file);
    
    // Append all document data to form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosInstance.post('/content/public-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.document;
  }

  /**
   * Update an existing document (requires auth)
   */
  async updateDocument(
    id: number,
    data: UpdateDocumentRequest
  ): Promise<PublicDocument> {
    const response = await axiosInstance.put(`/content/public-documents/${id}`, data);
    return response.data.document;
  }

  /**
   * Delete a document (requires auth)
   */
  async deleteDocument(id: number): Promise<void> {
    await axiosInstance.delete(`/content/public-documents/${id}`);
  }

  /**
   * Download a document (public endpoint - no auth required)
   */
  async downloadDocument(id: number): Promise<Blob> {
    const response = await axiosInstance.get(`/content/public-documents/download/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get document download URL (for direct download links)
   */
  getDocumentDownloadUrl(id: number): string {
    return `/content/public-documents/download/${id}`;
  }

  /**
   * Get available document categories
   */
  async getCategories(): Promise<DocumentCategory[]> {
    const response = await axiosInstance.get('/content/public-documents/categories');
    return response.data.categories;
  }

  /**
   * Get available document types
   */
  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await axiosInstance.get('/content/public-documents/document-types');
    return response.data.documentTypes;
  }

  /**
   * Helper method to trigger file download
   */
  async triggerDownload(id: number, originalName: string): Promise<void> {
    try {
      const blob = await this.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get category label by value
   */
  getCategoryLabel(value: string, categories: DocumentCategory[]): string {
    return categories.find(cat => cat.value === value)?.label || value;
  }

  /**
   * Get document type label by value
   */
  getDocumentTypeLabel(value: string, documentTypes: DocumentType[]): string {
    return documentTypes.find(type => type.value === value)?.label || value;
  }

  /**
   * Get language label by value
   */
  getLanguageLabel(value: string): string {
    const languages = {
      'en': 'English',
      'sw': 'Swahili',
      'both': 'Both Languages'
    };
    return languages[value as keyof typeof languages] || value;
  }
}

export const documentService = new DocumentServiceClass();
