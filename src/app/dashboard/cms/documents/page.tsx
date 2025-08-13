'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Plus,
  Eye,
  Globe,
  Lock,
  Calendar,
  FileType,
  Tag,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentForm from './components/DocumentForm';
import { documentService, PublicDocument as ServicePublicDocument } from '@/lib/services/document.service';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Use the interface from the service
type PublicDocument = ServicePublicDocument;

interface DocumentFormData {
  title: string;
  description: string;
  detailedDescription?: string;
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
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
    category: 'GENERAL',
    documentType: 'OTHER',
    language: 'en',
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
  const { toast } = useToast();
  
  // Toast utility using proper UI components
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast({
      title: type === 'error' ? 'Error' : 'Success',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getAllDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('Failed to fetch documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !formData.title) {
      showToast('Please select a file and enter a title', 'error');
      return;
    }

    try {
      await documentService.uploadDocument(uploadFile, formData);
      showToast('Document uploaded successfully');
      setIsUploadDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload document';
      showToast(errorMessage, 'error');
    }
  };

  const handleEdit = async () => {
    if (!editingDocument) return;

    try {
      await documentService.updateDocument(editingDocument.id, formData);
      showToast('Document updated successfully');
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error updating document:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update document';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      showToast('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete document';
      showToast(errorMessage, 'error');
    }
  };

  const handleDownload = async (id: number, originalName: string) => {
    try {
      await documentService.triggerDownload(id, originalName);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to download document';
      showToast(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      detailedDescription: '',
      category: 'GENERAL',
      documentType: 'OTHER',
      language: 'en',
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

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const openEditDialog = (document: PublicDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description || '',
      detailedDescription: document.detailedDescription || '',
      category: document.category,
      documentType: document.documentType,
      language: document.language,
      tags: document.tags || '',
      isPublic: document.isPublic,
      isActive: document.isActive,
      sortOrder: 0,
      publishDate: formatDateForInput(document.publishDate) || new Date().toISOString().split('T')[0],
      expiryDate: formatDateForInput(document.expiryDate),
      titleSwahili: document.titleSwahili || '',
      descriptionSwahili: document.descriptionSwahili || '',
      detailedDescriptionSwahili: document.detailedDescriptionSwahili || '',
      note: document.note || '',
      noteSwahili: document.noteSwahili || ''
    });
    setIsEditDialogOpen(true);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || doc.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const formatFileSize = (bytes: number) => {
    return documentService.formatFileSize(bytes);
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  const getDocumentTypeLabel = (value: string) => {
    return DOCUMENT_TYPES.find(type => type.value === value)?.label || value;
  };

  const getLanguageLabel = (value: string) => {
    return documentService.getLanguageLabel(value);
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
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <DocumentForm
              formData={formData}
              setFormData={setFormData}
              uploadFile={uploadFile}
              setUploadFile={setUploadFile}
              onSubmit={handleUpload}
              onCancel={() => {
                setIsUploadDialogOpen(false);
                resetForm();
              }}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
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
          <div key={document.id}>
            <Card className="h-full">
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
          </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <DocumentForm
            formData={formData}
            setFormData={setFormData}
            uploadFile={null}
            setUploadFile={() => {}}
            onSubmit={handleEdit}
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


