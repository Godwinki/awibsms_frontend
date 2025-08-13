'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Globe, 
  Calendar,
  Tag,
  FileText,
  Loader2
} from 'lucide-react';

interface Blog {
  id?: string;
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
  metaTitle?: string;
  metaDescription?: string;
  isPublic: boolean;
  author?: {
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface BlogFormProps {
  blog?: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (blogData: Partial<Blog>, featuredImage?: File) => Promise<void>;
  mode: 'create' | 'edit';
}

const categories = [
  'News',
  'Reports',
  'Events',
  'Success Stories',
  'Financial Tips',
  'Community',
  'Announcements',
  'Education'
];

export default function BlogForm({ blog, isOpen, onClose, onSubmit, mode }: BlogFormProps) {
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    titleSwahili: '',
    content: '',
    contentSwahili: '',
    excerpt: '',
    excerptSwahili: '',
    slug: '',
    category: 'News',
    tags: [],
    status: 'draft',
    publishDate: '',
    metaTitle: '',
    metaDescription: '',
    isPublic: true
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  useEffect(() => {
    if (blog && mode === 'edit') {
      setFormData({
        ...blog,
        publishDate: blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : ''
      });
      setImagePreview(blog.featuredImage || '');
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        titleSwahili: '',
        content: '',
        contentSwahili: '',
        excerpt: '',
        excerptSwahili: '',
        slug: '',
        category: 'News',
        tags: [],
        status: 'draft',
        publishDate: '',
        metaTitle: '',
        metaDescription: '',
        isPublic: true
      });
      setImagePreview('');
      setFeaturedImage(null);
    }
  }, [blog, mode, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const submitData = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        publishDate: publishNow ? new Date().toISOString() : (formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined)
      };
      
      await onSubmit(submitData, featuredImage || undefined);
      setSubmitSuccess(true);
      
      // Auto-close success message after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </DialogTitle>
        </DialogHeader>

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              Blog post {mode === 'create' ? 'created' : 'updated'} successfully!
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Title Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title (English) *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="titleSwahili">Title (Kiswahili)</Label>
                  <Input
                    id="titleSwahili"
                    value={formData.titleSwahili || ''}
                    onChange={(e) => handleInputChange('titleSwahili', e.target.value)}
                    placeholder="Jina la makala"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-title"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{formData.slug || 'your-blog-post'}
                </p>
              </div>

              {/* Excerpt Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excerpt">Excerpt (English) *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of the blog post"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="excerptSwahili">Excerpt (Kiswahili)</Label>
                  <Textarea
                    id="excerptSwahili"
                    value={formData.excerptSwahili || ''}
                    onChange={(e) => handleInputChange('excerptSwahili', e.target.value)}
                    placeholder="Muhtasari wa makala"
                    rows={3}
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content">Content (English) *</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your blog content here..."
                    rows={12}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contentSwahili">Content (Kiswahili)</Label>
                  <Textarea
                    id="contentSwahili"
                    value={formData.contentSwahili || ''}
                    onChange={(e) => handleInputChange('contentSwahili', e.target.value)}
                    placeholder="Andika maudhui ya makala hapa..."
                    rows={12}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              {/* Featured Image */}
              <div>
                <Label>Featured Image</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="featured-image"
                  />
                  <label
                    htmlFor="featured-image"
                    className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center hover:border-gray-400 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-gray-600">Click to upload featured image</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || 'News'}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => handleInputChange('status', value as 'draft' | 'published' | 'scheduled')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate || ''}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic || false}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label htmlFor="isPublic">Make this post public on website</Label>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              {/* SEO Fields */}
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO title for search engines"
                  maxLength={60}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {(formData.metaTitle || '').length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ''}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Brief description for search engines"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {(formData.metaDescription || '').length}/160 characters
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="publishNow"
                checked={publishNow}
                onCheckedChange={setPublishNow}
              />
              <Label htmlFor="publishNow">Publish immediately</Label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Post' : 'Update Post'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
