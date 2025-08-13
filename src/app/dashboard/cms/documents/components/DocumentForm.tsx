'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentFormData {
  title: string;
  description: string;
  detailedDescription?: string; // For rich explanations like website forms
  category: string;
  documentType: string;
  language: string;
  tags: string;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  publishDate: string;
  expiryDate: string;
  // Website-specific fields
  titleSwahili?: string;
  descriptionSwahili?: string;
  detailedDescriptionSwahili?: string;
  note?: string;
  noteSwahili?: string;
}

const CATEGORIES = [
  { value: 'MEMBERSHIP', label: 'Membership Forms' },
  { value: 'LOANS', label: 'Loan Applications' },
  { value: 'SAVINGS', label: 'Savings & Deposits' },
  { value: 'INSURANCE', label: 'Insurance Forms' },
  { value: 'GENERAL', label: 'General Documents' },
  { value: 'FORMS', label: 'Application Forms' },
  { value: 'POLICIES', label: 'Policies & Guidelines' }
];

const DOCUMENT_TYPES = [
  { value: 'APPLICATION_FORM', label: 'Application Form' },
  { value: 'POLICY_DOCUMENT', label: 'Policy Document' },
  { value: 'GUIDE', label: 'Guide/Manual' },
  { value: 'BROCHURE', label: 'Brochure' },
  { value: 'TERMS_CONDITIONS', label: 'Terms & Conditions' },
  { value: 'OTHER', label: 'Other' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
  { value: 'both', label: 'Both Languages' }
];

interface DocumentFormProps {
  formData: DocumentFormData;
  setFormData: (data: DocumentFormData) => void;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function DocumentForm({
  formData,
  setFormData,
  uploadFile,
  setUploadFile,
  onSubmit,
  onCancel,
  isEditing
}: DocumentFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof DocumentFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          {!isEditing && (
            <div>
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {uploadFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title (English)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter document title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="titleSwahili">Title (Swahili)</Label>
              <Input
                id="titleSwahili"
                value={formData.titleSwahili || ''}
                onChange={(e) => handleInputChange('titleSwahili', e.target.value)}
                placeholder="Jina la hati"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleInputChange('documentType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Short Description (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description for listings"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="descriptionSwahili">Short Description (Swahili)</Label>
              <Textarea
                id="descriptionSwahili"
                value={formData.descriptionSwahili || ''}
                onChange={(e) => handleInputChange('descriptionSwahili', e.target.value)}
                placeholder="Maelezo mafupi kwa orodha"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="detailedDescription">Detailed Explanation (English)</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription || ''}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="Detailed explanation about this document/form (like website forms)"
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be shown on the website forms page to explain what this document is about
              </p>
            </div>
            
            <div>
              <Label htmlFor="detailedDescriptionSwahili">Detailed Explanation (Swahili)</Label>
              <Textarea
                id="detailedDescriptionSwahili"
                value={formData.detailedDescriptionSwahili || ''}
                onChange={(e) => handleInputChange('detailedDescriptionSwahili', e.target.value)}
                placeholder="Maelezo ya kina kuhusu hati/fomu hii"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="note">Additional Note (English)</Label>
              <Input
                id="note"
                value={formData.note || ''}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="e.g., 'Download, print, fill, and submit to our office.'"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="noteSwahili">Additional Note (Swahili)</Label>
              <Input
                id="noteSwahili"
                value={formData.noteSwahili || ''}
                onChange={(e) => handleInputChange('noteSwahili', e.target.value)}
                placeholder="mf. 'Pakua, chapisha, jaza, na wasilisha ofisini kwetu.'"
                className="mt-1"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div>
            <Label htmlFor="language">Primary Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(language => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select 'Both Languages' if you've filled in both English and Swahili content
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
              <Label htmlFor="isPublic">Public (accessible without login)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="metadata" className="space-y-4">
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="membership, application, form, loan, business"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tags help with search and categorization
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="sortOrder">Display Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first (0 = highest priority)
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!isEditing && !uploadFile}>
          {isEditing ? 'Update Document' : 'Upload Document'}
        </Button>
      </div>
    </div>
  );
}
