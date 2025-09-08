'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { shortcutService, Shortcut } from '@/lib/services/shortcut.service';
import { toast } from 'sonner';

interface UseShortcutsOptions {
  autoLoad?: boolean;
}

export function useShortcuts(options: UseShortcutsOptions = {}) {
  const { autoLoad = true } = options;
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load shortcuts
  const loadShortcuts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shortcutService.getShortcuts();
      setShortcuts(data);
    } catch (err) {
      const errorMessage = 'Failed to load shortcuts';
      setError(errorMessage);
      console.error('Error loading shortcuts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute shortcut by code
  const executeShortcut = useCallback(async (code: string) => {
    try {
      const result = await shortcutService.executeShortcut(code);
      const { shortcut } = result;

      // Handle different action types
      switch (shortcut.actionType) {
        case 'navigation':
          if (shortcut.actionData.target) {
            router.push(shortcut.actionData.target);
            toast.success(`Navigating to ${shortcut.name}`);
          }
          break;
          
        case 'modal':
          // For now, just show a toast - can be extended to open actual modals
          toast.info(`Opening ${shortcut.name}`);
          // TODO: Implement modal opening logic based on shortcut.actionData.component
          break;
          
        case 'api_call':
          toast.info(`Executing ${shortcut.name}`);
          // TODO: Implement API call logic based on shortcut.actionData
          break;
          
        case 'form':
          toast.info(`Opening form: ${shortcut.name}`);
          // TODO: Implement form opening logic based on shortcut.actionData
          break;
          
        default:
          toast.info(`Executed: ${shortcut.name}`);
      }

      // Reload shortcuts to update usage count
      loadShortcuts();
      
      return result;
    } catch (err) {
      const errorMessage = 'Failed to execute shortcut';
      toast.error(errorMessage);
      console.error('Error executing shortcut:', err);
      throw err;
    }
  }, [router, loadShortcuts]);

  // Find shortcut by code
  const findShortcut = useCallback((code: string): Shortcut | undefined => {
    return shortcuts.find(s => s.code === code || s.originalCode === code);
  }, [shortcuts]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (shortcutId: string) => {
    try {
      const result = await shortcutService.toggleFavorite(shortcutId);
      
      // Update local state
      setShortcuts(prev => prev.map(s => 
        s.id === shortcutId 
          ? { ...s, isFavorite: result.isFavorite }
          : s
      ));
      
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      return result;
    } catch (err) {
      toast.error('Failed to update favorite');
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  // Set custom code
  const setCustomCode = useCallback(async (shortcutId: string, customCode: string) => {
    try {
      const result = await shortcutService.setCustomCode(shortcutId, customCode);
      
      // Update local state
      setShortcuts(prev => prev.map(s => 
        s.id === shortcutId 
          ? { ...s, code: result.customCode }
          : s
      ));
      
      toast.success('Custom code updated');
      return result;
    } catch (err) {
      toast.error('Failed to set custom code');
      console.error('Error setting custom code:', err);
      throw err;
    }
  }, []);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback(() => {
    return shortcuts.reduce((acc, shortcut) => {
      const category = shortcut.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, Shortcut[]>);
  }, [shortcuts]);

  // Get favorite shortcuts
  const getFavoriteShortcuts = useCallback(() => {
    return shortcuts.filter(s => s.isFavorite);
  }, [shortcuts]);

  // Get recent shortcuts
  const getRecentShortcuts = useCallback((limit: number = 10) => {
    return shortcuts
      .filter(s => s.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
      .slice(0, limit);
  }, [shortcuts]);

  // Search shortcuts
  const searchShortcuts = useCallback((query: string) => {
    if (!query.trim()) return shortcuts;
    
    const lowerQuery = query.toLowerCase();
    return shortcuts.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.code.includes(query) ||
      s.originalCode.includes(query)
    );
  }, [shortcuts]);

  // Auto-load shortcuts on mount
  useEffect(() => {
    if (autoLoad) {
      loadShortcuts();
    }
  }, [autoLoad, loadShortcuts]);

  return {
    shortcuts,
    loading,
    error,
    loadShortcuts,
    executeShortcut,
    findShortcut,
    toggleFavorite,
    setCustomCode,
    getShortcutsByCategory,
    getFavoriteShortcuts,
    getRecentShortcuts,
    searchShortcuts
  };
}
