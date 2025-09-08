'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  Code, 
  Zap,
  Filter,
  MoreHorizontal,
  Shield,
  Eye,
  Heart,
  Clock,
  Hash
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { shortcutService, Shortcut } from '@/lib/services/shortcut.service';
import { CreateShortcutDialog } from '@/components/shortcuts/CreateShortcutDialog';
import { EditShortcutDialog } from '@/components/shortcuts/EditShortcutDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { withRoleProtection } from '@/components/auth/withRoleProtection';

const moduleColors: Record<string, string> = {
  global: 'bg-blue-100 text-blue-800',
  members: 'bg-green-100 text-green-800',
  loans: 'bg-yellow-100 text-yellow-800',
  accounting: 'bg-purple-100 text-purple-800',
  system: 'bg-red-100 text-red-800',
  reports: 'bg-indigo-100 text-indigo-800'
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
  navigation: Hash,
  members: Hash,
  loans: Hash,
  accounting: Hash,
  reports: Hash,
  administration: Shield,
  system: Shield,
  tools: Zap,
  search: Search,
  operations: Hash,
  emergency: Shield,
  general: Hash
};

function ShortcutsPage() {
  const { user } = useAuth();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [filteredShortcuts, setFilteredShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'custom'>('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);

  // Load shortcuts
  const loadShortcuts = async () => {
    try {
      setLoading(true);
      const data = await shortcutService.getShortcuts();
      setShortcuts(data);
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
      toast.error('Failed to load shortcuts');
    } finally {
      setLoading(false);
    }
  };

  // Filter shortcuts
  useEffect(() => {
    let filtered = shortcuts;

    // Filter by tab
    if (activeTab === 'system') {
      filtered = filtered.filter(s => s.isSystem);
    } else if (activeTab === 'custom') {
      filtered = filtered.filter(s => !s.isSystem);
    }

    // Filter by module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(s => s.module === selectedModule);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.code.includes(searchQuery) ||
        s.originalCode.includes(searchQuery)
      );
    }

    setFilteredShortcuts(filtered);
  }, [shortcuts, activeTab, selectedModule, selectedCategory, searchQuery]);

  // Load shortcuts on mount
  useEffect(() => {
    loadShortcuts();
  }, []);

  // Handle delete shortcut
  const handleDeleteShortcut = async () => {
    if (!selectedShortcut) return;

    try {
      await shortcutService.deleteShortcut(selectedShortcut.id);
      toast.success('Shortcut deleted successfully');
      loadShortcuts();
      setDeleteDialogOpen(false);
      setSelectedShortcut(null);
    } catch (error: any) {
      console.error('Failed to delete shortcut:', error);
      toast.error(error.response?.data?.message || 'Failed to delete shortcut');
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (shortcut: Shortcut) => {
    try {
      await shortcutService.toggleFavorite(shortcut.id);
      loadShortcuts(); // Reload to update favorite status
      toast.success(shortcut.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Get unique modules and categories for filters
  const modules = Array.from(new Set(shortcuts.map(s => s.module)));
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || Hash;
    return <IconComponent className="h-4 w-4" />;
  };

  const getModuleColor = (module: string) => {
    return moduleColors[module] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shortcuts Management</h1>
          <p className="text-gray-600">Manage quick action shortcuts for the system</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Shortcut
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Hash className="h-4 w-4" />
            All Shortcuts ({shortcuts.length})
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Shield className="h-4 w-4" />
            System ({shortcuts.filter(s => s.isSystem).length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Code className="h-4 w-4" />
            Custom ({shortcuts.filter(s => !s.isSystem).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredShortcuts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Code className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shortcuts found</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchQuery || selectedModule !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first shortcut to get started'
                  }
                </p>
                {!searchQuery && selectedModule === 'all' && selectedCategory === 'all' && (
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Shortcut
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredShortcuts.map((shortcut) => (
                <Card key={shortcut.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(shortcut.category)}
                          <Badge variant="outline" className="font-mono text-xs min-w-[3rem]">
                            {shortcut.code}
                          </Badge>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{shortcut.name}</h3>
                            <div className="flex items-center gap-1">
                              <Badge className={`text-xs ${getModuleColor(shortcut.module)}`}>
                                {shortcut.module}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {shortcut.actionType}
                              </Badge>
                              {shortcut.isSystem && (
                                <Badge variant="secondary" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  System
                                </Badge>
                              )}
                            </div>
                          </div>
                          {shortcut.description && (
                            <p className="text-sm text-gray-600 truncate">{shortcut.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {shortcut.isFavorite && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </div>
                          )}
                          {shortcut.usageCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {shortcut.usageCount}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleFavorite(shortcut)}>
                            <Heart className={`h-4 w-4 mr-2 ${shortcut.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            {shortcut.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedShortcut(shortcut);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!shortcut.isSystem && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedShortcut(shortcut);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Shortcut Dialog */}
      <CreateShortcutDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={loadShortcuts}
      />

      {/* Edit Shortcut Dialog */}
      <EditShortcutDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedShortcut(null);
        }}
        onSuccess={loadShortcuts}
        shortcut={selectedShortcut}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shortcut</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the shortcut "{selectedShortcut?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedShortcut(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShortcut} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withRoleProtection(ShortcutsPage, ['admin', 'super_admin']);
