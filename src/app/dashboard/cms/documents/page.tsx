'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import DocumentForm from './components/DocumentForm';
import {
  Plus,
  Download,
  Edit,
  Trash2,
  Search,
  FileText,
  Globe,
  Lock,
  Calendar,
  FileType,
  Tag
} from 'lucide-react';

interface PublicDocument {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  language: string;
  documentType: string;
  tags: string;
  isPublic: boolean;
  isActive: boolean;
  downloadCount: number;
  sortOrder: number;
  publishDate: string;
  expiryDate: string;
  titleSwahili?: string;
  descriptionSwahili?: string;
  detailedDescriptionSwahili?: string;
  note?: string;
  noteSwahili?: string;
  createdAt: string;
  updatedAt: string;
  uploader: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentFormData {
  title: string;
  description: string;
  detailedDescription?: string;
  category: string;
  language: string;
  documentType: string;
  tags: string;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  publishDate: string;
  expiryDate: string;
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

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
  { value: 'both', label: 'Both Languages' }
];

const DOCUMENT_TYPES = [
  { value: 'APPLICATION_FORM', label: 'Application Form' },
  { value: 'POLICY_DOCUMENT', label: 'Policy Document' },
  { value: 'GUIDE', label: 'Guide/Manual' },
  { value: 'BROCHURE', label: 'Brochure' },
  { value: 'TERMS_CONDITIONS', label: 'Terms & Conditions' },
  { value: 'OTHER', label: 'Other' }
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<PublicDocument | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    detailedDescription: '',
    category: 'MEMBERSHIP',
    language: 'en',
    documentType: 'APPLICATION_FORM',
    tags: '',
    isPublic: true,
    isActive: true,
    sortOrder: 0,
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    titleSwahili: '',
    descriptionSwahili: '',
    detailedDescriptionSwahili: '',
    note: '',
    noteSwahili: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, selectedLanguage]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/public-documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(doc => doc.language === selectedLanguage);
    }

    setFilteredDocuments(filtered);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', uploadFile);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('language', formData.language);
    formDataToSend.append('documentType', formData.documentType);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('isPublic', formData.isPublic.toString());
    formDataToSend.append('isActive', formData.isActive.toString());

    try {
      const response = await fetch('/api/public-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document uploaded successfully"
        });
        setIsUploadDialogOpen(false);
        resetForm();
        fetchDocuments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to upload document",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDocument) return;

    try {
      const response = await fetch(`/api/public-documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document updated successfully"
        });
        setIsEditDialogOpen(false);
        setEditingDocument(null);
        resetForm();
        fetchDocuments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update document",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/public-documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast({
          title: "Error",
          description: "Failed to download document",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/public-documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully"
        });
        fetchDocuments();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (document: PublicDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description,
      detailedDescription: document.detailedDescription || '',
      category: document.category,
      language: document.language,
      documentType: document.documentType,
      tags: document.tags,
      isPublic: document.isPublic,
      isActive: document.isActive,
      sortOrder: document.sortOrder || 0,
      publishDate: document.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: document.expiryDate || '',
      titleSwahili: document.titleSwahili || '',
      descriptionSwahili: document.descriptionSwahili || '',
      detailedDescriptionSwahili: document.detailedDescriptionSwahili || '',
      note: document.note || '',
      noteSwahili: document.noteSwahili || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      detailedDescription: '',
      category: 'MEMBERSHIP',
      language: 'en',
      documentType: 'APPLICATION_FORM',
      tags: '',
      isPublic: true,
      isActive: true,
      sortOrder: 0,
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      titleSwahili: '',
      descriptionSwahili: '',
      detailedDescriptionSwahili: '',
      note: '',
      noteSwahili: ''
    });
    setUploadFile(null);
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category)?.label || category;
  };

  const getLanguageLabel = (language: string) => {
    return LANGUAGES.find(lang => lang.value === language)?.label || language;
  };

  const getDocumentTypeLabel = (documentType: string) => {
    return DOCUMENT_TYPES.find(type => type.value === documentType)?.label || documentType;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents & Forms</h1>
          <p className="text-muted-foreground">
            Manage public documents and forms for the website
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/cms/documents/download-logs')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Logs
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <DocumentForm
                formData={formData}
                setFormData={setFormData}
                uploadFile={uploadFile}
                setUploadFile={setUploadFile}
                onSubmit={() => handleUpload(new Event('submit') as any)}
                onCancel={() => {
                  setIsUploadDialogOpen(false);
                  resetForm();
                }}
                isEditing={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {LANGUAGES.map(language => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-2">
                    {document.isPublic ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-orange-500" />
                    )}
                    {!document.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document.id, document.originalName)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(document)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {document.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {getCategoryLabel(document.category)}
                </Badge>
                <Badge variant="outline">
                  {getLanguageLabel(document.language)}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <FileType className="w-3 h-3" />
                  <span>{getDocumentTypeLabel(document.documentType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-3 h-3" />
                  <span>{document.downloadCount} downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Size: {formatFileSize(document.fileSize)}</span>
                </div>
                {document.tags && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    <span className="line-clamp-1">{document.tags}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Uploaded by {document.uploader.firstName} {document.uploader.lastName}
                <br />
                {new Date(document.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <DocumentForm
            formData={formData}
            setFormData={setFormData}
            uploadFile={null}
            setUploadFile={() => {}}
            onSubmit={() => handleEdit(new Event('submit') as any)}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingDocument(null);
              resetForm();
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
