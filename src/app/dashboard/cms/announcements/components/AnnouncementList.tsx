'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Send,
  Calendar,
  Users,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  User
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { type Announcement } from '@/lib/services/announcement.service';

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onPublish: (id: number) => void;
  onPreview: (announcement: Announcement) => void;
  onPageChange: (page: number) => void;
}

export function AnnouncementList({
  announcements,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPublish,
  onPreview,
  onPageChange
}: AnnouncementListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No announcements found</h3>
            <p className="text-muted-foreground">
              Create your first announcement to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  {announcement.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                  {announcement.bannerUrl && (
                    <Badge variant="outline">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Banner
                    </Badge>
                  )}
                </div>
                
                <CardDescription className="line-clamp-2">
                  {announcement.summary || announcement.content}
                </CardDescription>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(announcement.publishDate), 'MMM dd, yyyy')}
                  </div>
                  
                  {announcement.eventDate && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {format(new Date(announcement.eventDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                  
                  {announcement.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {announcement.author.firstName} {announcement.author.lastName}
                    </div>
                  )}
                  
                  {announcement.maxParticipants && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Max: {announcement.maxParticipants}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  <Badge className={getStatusColor(announcement.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(announcement.status)}
                      <span>{announcement.status}</span>
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPreview(announcement)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(announcement)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                
                {announcement.status === 'draft' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => announcement.id && onPublish(announcement.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {announcement.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {announcement.targetAudience}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(announcement)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
