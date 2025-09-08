'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Star, 
  Clock, 
  Zap, 
  Hash,
  ArrowRight,
  Heart,
  Settings,
  Users,
  DollarSign,
  Calculator,
  FileText,
  Shield,
  Square
} from 'lucide-react';
import { shortcutService, Shortcut } from '@/lib/services/shortcut.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ShortcutCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  navigation: ArrowRight,
  members: Users,
  loans: DollarSign,
  accounting: Calculator,
  reports: FileText,
  administration: Shield,
  system: Settings,
  tools: Zap,
  search: Search,
  operations: Settings,
  emergency: Shield,
  general: Hash
};

const moduleColors: Record<string, string> = {
  global: 'bg-blue-100 text-blue-800',
  members: 'bg-green-100 text-green-800',
  loans: 'bg-yellow-100 text-yellow-800',
  accounting: 'bg-purple-100 text-purple-800',
  system: 'bg-red-100 text-red-800',
  reports: 'bg-indigo-100 text-indigo-800'
};

export function ShortcutCommandPalette({ isOpen, onClose }: ShortcutCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [filteredShortcuts, setFilteredShortcuts] = useState<Shortcut[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset states when dialog closes
  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setActiveTab('all');
    onClose();
  }, [onClose]);

  // Load shortcuts
  const loadShortcuts = useCallback(async () => {
    try {
      setLoading(true);
      let data: Shortcut[];
      
      switch (activeTab) {
        case 'favorites':
          data = await shortcutService.getFavoriteShortcuts();
          break;
        case 'recent':
          data = await shortcutService.getRecentShortcuts();
          break;
        default:
          data = await shortcutService.getShortcuts();
      }
      
      setShortcuts(data);
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
      toast.error('Failed to load shortcuts');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Filter shortcuts based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredShortcuts(shortcuts);
    } else {
      const filtered = shortcuts.filter(shortcut => 
        shortcut.name.toLowerCase().includes(query.toLowerCase()) ||
        shortcut.description.toLowerCase().includes(query.toLowerCase()) ||
        shortcut.code.includes(query) ||
        shortcut.originalCode.includes(query)
      );
      setFilteredShortcuts(filtered);
    }
    setSelectedIndex(0);
  }, [query, shortcuts]);

  // Load shortcuts when dialog opens or tab changes
  useEffect(() => {
    if (isOpen) {
      loadShortcuts();
    }
  }, [isOpen, loadShortcuts]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredShortcuts.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredShortcuts.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredShortcuts[selectedIndex]) {
            executeShortcut(filteredShortcuts[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredShortcuts, selectedIndex, onClose]);

  // Execute shortcut
  const executeShortcut = async (shortcut: Shortcut) => {
    try {
      const result = await shortcutService.executeShortcut(shortcut.code);
      
      // Handle different action types
      switch (result.shortcut.actionType) {
        case 'navigation':
          router.push(result.shortcut.actionData.target);
          break;
        case 'modal':
          // TODO: Implement modal opening logic
          toast.info(`Opening ${result.shortcut.actionData.component}`);
          break;
        case 'api_call':
          // TODO: Implement API call logic
          toast.info(`Executing API call to ${result.shortcut.actionData.endpoint}`);
          break;
        case 'form':
          // TODO: Implement form opening logic
          toast.info(`Opening form ${result.shortcut.actionData.formId}`);
          break;
      }
      
      toast.success(`Executed: ${shortcut.name}`);
      onClose();
      
    } catch (error) {
      console.error('Failed to execute shortcut:', error);
      toast.error('Failed to execute shortcut');
    }
  };

  // Toggle favorite
  const toggleFavorite = async (shortcut: Shortcut, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await shortcutService.toggleFavorite(shortcut.id);
      loadShortcuts(); // Reload to update favorite status
      toast.success(shortcut.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || Hash;
    return <IconComponent className="h-4 w-4" />;
  };

  const getModuleColor = (module: string) => {
    return moduleColors[module] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search shortcuts or enter code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              <Hash className="h-4 w-4 mr-1" />
              All
            </Button>
            <Button
              variant={activeTab === 'favorites' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('favorites')}
            >
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </Button>
            <Button
              variant={activeTab === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recent')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Recent
            </Button>
          </div>
        </div>

        <Separator />

        {/* Shortcuts List */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredShortcuts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {query ? 'No shortcuts found' : 'No shortcuts available'}
              </div>
            ) : (
              filteredShortcuts.map((shortcut, index) => (
                <div
                  key={shortcut.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => executeShortcut(shortcut)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(shortcut.category)}
                      <Badge variant="outline" className="font-mono text-xs">
                        {shortcut.code}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{shortcut.name}</span>
                        <Badge className={`text-xs ${getModuleColor(shortcut.module)}`}>
                          {shortcut.module}
                        </Badge>
                      </div>
                      {shortcut.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {shortcut.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {shortcut.usageCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {shortcut.usageCount}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleFavorite(shortcut, e)}
                      className="p-1 h-auto"
                    >
                      {shortcut.isFavorite ? (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>↑↓ Navigate • Enter Execute • Esc Close</span>
            <span>{filteredShortcuts.length} shortcuts</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
