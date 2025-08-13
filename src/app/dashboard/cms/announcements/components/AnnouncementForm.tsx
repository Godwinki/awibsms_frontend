'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Image as ImageIcon, FileText, Save, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { type Announcement } from '@/lib/services/announcement.service';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  categories: { value: string; label: string }[];
  audiences: { value: string; label: string }[];
  onSubmit: (data: Partial<Announcement>, banner?: File) => Promise<void>;
  onCancel: () => void;
}

export function AnnouncementForm({ 
  announcement, 
  categories,
  audiences,
  onSubmit, 
  onCancel 
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    titleSwahili: announcement?.titleSwahili || '',
    content: announcement?.content || '',
    contentSwahili: announcement?.contentSwahili || '',
    summary: announcement?.summary || '',
    summarySwahili: announcement?.summarySwahili || '',
    priority: announcement?.priority || 'medium',
    status: announcement?.status || 'draft',
    targetAudience: announcement?.targetAudience || 'all',
    category: announcement?.category || 'general',
    publishDate: announcement?.publishDate ? new Date(announcement.publishDate) : new Date(),
    expiryDate: announcement?.expiryDate ? new Date(announcement.expiryDate) : null,
    isPublic: announcement?.isPublic ?? true,
    isFeatured: announcement?.isFeatured ?? false,
    allowComments: announcement?.allowComments ?? false,
    sendNotification: announcement?.sendNotification ?? true,
    tags: announcement?.tags || '',
    venue: announcement?.venue || '',
    venueSwahili: announcement?.venueSwahili || '',
    eventDate: announcement?.eventDate ? new Date(announcement.eventDate) : null,
    registrationRequired: announcement?.registrationRequired ?? false,
    maxParticipants: announcement?.maxParticipants || 0,
    registrationDeadline: announcement?.registrationDeadline ? new Date(announcement.registrationDeadline) : null,
  });

  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(announcement?.bannerUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBanner(null);
    setBannerPreview('');
  };

  const handleSubmit = async (publishNow = false) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const submitData = {
        ...formData,
        status: publishNow ? 'active' : formData.status,
        publishDate: publishNow ? new Date() : formData.publishDate,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : undefined,
        eventDate: formData.eventDate ? formData.eventDate.toISOString() : undefined,
        registrationDeadline: formData.registrationDeadline ? formData.registrationDeadline.toISOString() : undefined,
        maxParticipants: formData.maxParticipants && formData.maxParticipants > 0 ? formData.maxParticipants : undefined,
      };
      
      await onSubmit(submitData, banner || undefined);
      setSubmitSuccess(true);
      
      // Auto-close success message after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
          <DialogDescription>
            {announcement ? 'Update announcement details' : 'Create a new announcement or event'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(false)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="event">Event Details</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Content</CardTitle>
              <CardDescription>
                Enter the announcement content in both English and Swahili
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* English Content */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter announcement title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="summary">Summary (English)</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Brief summary of the announcement"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content (English)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Full announcement content"
                    rows={6}
                  />
                </div>
              </div>

              {/* Swahili Content */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Swahili Translation</h4>
                
                <div>
                  <Label htmlFor="titleSwahili">Title (Swahili)</Label>
                  <Input
                    id="titleSwahili"
                    value={formData.titleSwahili}
                    onChange={(e) => handleInputChange('titleSwahili', e.target.value)}
                    placeholder="Kichwa cha tangazo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="summarySwahili">Summary (Swahili)</Label>
                  <Textarea
                    id="summarySwahili"
                    value={formData.summarySwahili}
                    onChange={(e) => handleInputChange('summarySwahili', e.target.value)}
                    placeholder="Muhtasari wa tangazo"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="contentSwahili">Content (Swahili)</Label>
                  <Textarea
                    id="contentSwahili"
                    value={formData.contentSwahili}
                    onChange={(e) => handleInputChange('contentSwahili', e.target.value)}
                    placeholder="Maudhui kamili ya tangazo"
                    rows={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="policy">Policy Update</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="board">Board Members</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="training, workshop, members"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.publishDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.publishDate ? format(formData.publishDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.publishDate}
                        onSelect={(date) => handleInputChange('publishDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Expiry Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiryDate ? format(formData.expiryDate, "PPP") : "No expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate || undefined}
                        onSelect={(date) => handleInputChange('expiryDate', date || undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Featured Announcement</Label>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Event Details Tab */}
        <TabsContent value="event" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>
                Fill this section if the announcement is about an event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venue">Venue (English)</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Event venue"
                  />
                </div>

                <div>
                  <Label htmlFor="venueSwahili">Venue (Swahili)</Label>
                  <Input
                    id="venueSwahili"
                    value={formData.venueSwahili}
                    onChange={(e) => handleInputChange('venueSwahili', e.target.value)}
                    placeholder="Mahali pa tukio"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value ? new Date(e.target.value) : null;
                    handleInputChange('eventDate', dateValue);
                  }}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="registrationRequired">Registration Required</Label>
                <Switch
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onCheckedChange={(checked) => handleInputChange('registrationRequired', checked)}
                />
              </div>

              {formData.registrationRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <Label>Registration Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.registrationDeadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.registrationDeadline ? format(formData.registrationDeadline, "PPP") : "Select deadline"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.registrationDeadline || undefined}
                          onSelect={(date) => handleInputChange('registrationDeadline', date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banner/Flyer Upload</CardTitle>
              <CardDescription>
                Upload a banner or flyer image for this announcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bannerPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeBanner}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => document.getElementById('banner-upload')?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Change Banner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button onClick={() => document.getElementById('banner-upload')?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Banner
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {announcement ? 'Announcement updated successfully!' : 'Announcement created successfully!'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Actions */}
      <div className="flex justify-between gap-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>
          
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publish Now
              </>
            )}
          </Button>
        </div>
      </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
