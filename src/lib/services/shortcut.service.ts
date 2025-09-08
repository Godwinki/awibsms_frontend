/**
 * Shortcut Service - Quick Actions API
 */

import axiosInstance from '@/lib/axios';

export interface Shortcut {
  id: string;
  code: string;
  originalCode: string;
  name: string;
  description: string;
  module: string;
  actionType: 'navigation' | 'modal' | 'api_call' | 'form';
  actionData: any;
  category: string;
  icon?: string;
  isSystem: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: string;
  isEnabled: boolean;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ShortcutFilters {
  module?: string;
  category?: string;
  search?: string;
}

export interface CreateShortcutData {
  code: string;
  name: string;
  description?: string;
  module?: string;
  actionType: 'navigation' | 'modal' | 'api_call' | 'form';
  actionData: any;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  category?: string;
  icon?: string;
}

export interface UpdateShortcutData extends Partial<CreateShortcutData> {}

export interface ShortcutExecutionResult {
  shortcut: {
    id: string;
    code: string;
    name: string;
    actionType: string;
    actionData: any;
    module: string;
  };
}

class ShortcutService {
  private baseUrl = '/system/shortcuts';

  /**
   * Get all shortcuts available to current user
   */
  async getShortcuts(filters?: ShortcutFilters): Promise<Shortcut[]> {
    const params = new URLSearchParams();
    
    if (filters?.module) params.append('module', filters.module);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const response = await axiosInstance.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data.shortcuts;
  }

  /**
   * Execute a shortcut by code
   */
  async executeShortcut(code: string): Promise<ShortcutExecutionResult> {
    const response = await axiosInstance.post(`${this.baseUrl}/execute/${code}`);
    return response.data.data;
  }

  /**
   * Create a new shortcut (admin only)
   */
  async createShortcut(data: CreateShortcutData): Promise<Shortcut> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data.data.shortcut;
  }

  /**
   * Update an existing shortcut (admin only)
   */
  async updateShortcut(id: string, data: UpdateShortcutData): Promise<Shortcut> {
    const response = await axiosInstance.put(`${this.baseUrl}/${id}`, data);
    return response.data.data.shortcut;
  }

  /**
   * Delete a shortcut (admin only)
   */
  async deleteShortcut(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle favorite status for a shortcut
   */
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const response = await axiosInstance.post(`${this.baseUrl}/${id}/favorite`);
    return response.data.data;
  }

  /**
   * Set custom code for a shortcut
   */
  async setCustomCode(id: string, customCode: string): Promise<{ customCode: string }> {
    const response = await axiosInstance.post(`${this.baseUrl}/${id}/custom-code`, {
      customCode
    });
    return response.data.data;
  }

  /**
   * Get shortcuts grouped by category
   */
  async getShortcutsByCategory(filters?: Omit<ShortcutFilters, 'category'>): Promise<Record<string, Shortcut[]>> {
    const shortcuts = await this.getShortcuts(filters);
    
    return shortcuts.reduce((acc, shortcut) => {
      const category = shortcut.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, Shortcut[]>);
  }

  /**
   * Get favorite shortcuts
   */
  async getFavoriteShortcuts(): Promise<Shortcut[]> {
    const shortcuts = await this.getShortcuts();
    return shortcuts.filter(shortcut => shortcut.isFavorite);
  }

  /**
   * Get recently used shortcuts
   */
  async getRecentShortcuts(limit: number = 10): Promise<Shortcut[]> {
    const shortcuts = await this.getShortcuts();
    return shortcuts
      .filter(shortcut => shortcut.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
      .slice(0, limit);
  }

  /**
   * Search shortcuts by name, description, or code
   */
  async searchShortcuts(query: string): Promise<Shortcut[]> {
    return this.getShortcuts({ search: query });
  }
}

export const shortcutService = new ShortcutService();
