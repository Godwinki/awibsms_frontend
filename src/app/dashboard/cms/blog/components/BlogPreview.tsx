'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Globe, 
  Calendar, 
  User, 
  Tag, 
  Eye, 
  Clock,
  Image as ImageIcon
} from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  titleSwahili?: string;
  content: string;
  contentSwahili?: string;
  excerpt: string;
  excerptSwahili?: string;
  slug: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  featuredImage?: string;
  isPublic: boolean;
  author?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  viewCount?: number;
}

interface BlogPreviewProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'sw';
  onLanguageChange: (language: 'en' | 'sw') => void;
}

export default function BlogPreview({ 
  blog, 
  isOpen, 
  onClose, 
  language, 
  onLanguageChange 
}: BlogPreviewProps) {
  if (!blog) return null;

  const getLocalizedContent = (blog: Blog) => {
    return {
      title: language === 'sw' && blog.titleSwahili ? blog.titleSwahili : blog.title,
      content: language === 'sw' && blog.contentSwahili ? blog.contentSwahili : blog.content,
      excerpt: language === 'sw' && blog.excerptSwahili ? blog.excerptSwahili : blog.excerpt
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const localizedContent = getLocalizedContent(blog);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Blog Preview
            </DialogTitle>
            
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div className="flex rounded-lg border">
                <Button
                  variant={language === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onLanguageChange('en')}
                  className="rounded-r-none"
                >
                  English
                </Button>
                <Button
                  variant={language === 'sw' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onLanguageChange('sw')}
                  className="rounded-l-none"
                >
                  Kiswahili
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Blog Header */}
          <div className="space-y-4">
            {/* Status and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(blog.status)}>
                  {blog.status}
                </Badge>
                {!blog.isPublic && (
                  <Badge variant="outline">Private</Badge>
                )}
                <Badge variant="secondary">{blog.category}</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                URL: /blog/{blog.slug}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight">
              {localizedContent.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {blog.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {blog.author.firstName} {blog.author.lastName}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {blog.publishDate ? formatDate(blog.publishDate) : formatDate(blog.createdAt)}
              </div>
              
              {blog.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {blog.viewCount} views
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.ceil(localizedContent.content.split(' ').length / 200)} min read
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={localizedContent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Excerpt</h3>
              <p className="text-muted-foreground italic">
                {localizedContent.excerpt}
              </p>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Content</h3>
              <div className="prose prose-gray max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {localizedContent.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Availability */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Language Availability</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${blog.title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">English</span>
                  {blog.title && <Badge variant="outline" className="text-xs">Available</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${blog.titleSwahili ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Kiswahili</span>
                  {blog.titleSwahili && <Badge variant="outline" className="text-xs">Available</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last updated: {blog.createdAt ? formatDate(blog.createdAt) : 'Never'}
            </div>
            
            <div className="flex gap-2">
              {blog.isPublic && blog.status === 'published' && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  View Live
                </Button>
              )}
              <Button onClick={onClose}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
