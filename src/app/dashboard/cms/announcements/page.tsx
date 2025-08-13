'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { AnnouncementForm } from './components/AnnouncementForm';
import { AnnouncementList } from './components/AnnouncementList';
import { AnnouncementPreview } from './components/AnnouncementPreview';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { announcementService, type Announcement, type AnnouncementFilters } from '@/lib/services/announcement.service';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; announcement: Announcement | null; isDeleting: boolean }>({
    open: false,
    announcement: null,
    isDeleting: false
  });
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'sw'>('en');
  const [filters, setFilters] = useState<AnnouncementFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [audiences, setAudiences] = useState<{ value: string; label: string }[]>([]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAllAnnouncements(filters);
      setAnnouncements(response.announcements);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and audiences
  const fetchMetadata = async () => {
    try {
      const [categoriesData, audiencesData] = await Promise.all([
        announcementService.getCategories(),
        announcementService.getTargetAudiences()
      ]);
      setCategories(categoriesData);
      setAudiences(audiencesData);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (data: Partial<Announcement>, banner?: File) => {
    try {
      if (editingAnnouncement) {
        await announcementService.updateAnnouncement(editingAnnouncement.id!, data, banner);
        toast.success('Announcement updated successfully');
      } else {
        await announcementService.createAnnouncement(data, banner);
        toast.success('Announcement created successfully');
      }
      setShowForm(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast.error('Failed to save announcement');
      throw error; // Re-throw to let the form handle the error state
    }
  };

  // Handle delete
  const handleDelete = (announcement: Announcement) => {
    setDeleteDialog({
      open: true,
      announcement,
      isDeleting: false
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteDialog.announcement) return;
    
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await announcementService.deleteAnnouncement(deleteDialog.announcement.id!);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
      setDeleteDialog({ open: false, announcement: null, isDeleting: false });
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast.error('Failed to delete announcement');
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Handle publish
  const handlePublish = async (id: number) => {
    try {
      await announcementService.publishAnnouncement(id);
      toast.success('Announcement published successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to publish announcement:', error);
      toast.error('Failed to publish announcement');
    }
  };

  // Handle edit
  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  // Handle preview
  const handlePreview = (announcement: Announcement) => {
    setPreviewAnnouncement(announcement);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof AnnouncementFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage news, events, and announcements for your organization
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <AnnouncementList
        announcements={announcements}
        loading={loading}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onPageChange={handlePageChange}
      />

      {/* Form Modal */}
      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          categories={categories}
          audiences={audiences}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewAnnouncement && (
        <AnnouncementPreview
          announcement={previewAnnouncement}
          onClose={() => setPreviewAnnouncement(null)}
          language={previewLanguage}
          onLanguageChange={setPreviewLanguage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        title={deleteDialog.announcement?.title || ''}
        isDeleting={deleteDialog.isDeleting}
      />
    </div>
  );
}
