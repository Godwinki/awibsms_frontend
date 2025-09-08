'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MemberService } from '@/lib/services/member.service';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableIcon, FileSpreadsheet, Upload, Download, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadResultItem {
  id: number;
  fullName: string;
  nin: string;
  accountNumber: string;
}

interface UploadErrorItem {
  row: any;
  error: string;
}

interface UploadResults {
  success: UploadResultItem[];
  errors: UploadErrorItem[];
  total: number;
}

const MemberExcelUpload = () => {
  const { toast } = useToast();
  const { currentBranch, availableBranches } = useAuth();
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Set current branch as default selection
  useEffect(() => {
    if (currentBranch) {
      setSelectedBranchId(currentBranch.id);
    }
  }, [currentBranch]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an Excel file (.xlsx or .xls)',
          variant: 'destructive'
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  const handleDownloadTemplate = async () => {
    try {
      const response = await MemberService.downloadTemplate();
      
      // Create a blob from the response
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'member_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Template downloaded',
        description: 'Member registration template has been downloaded.',
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the template. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an Excel file to upload.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedBranchId) {
      toast({
        title: 'No branch selected',
        description: 'Please select a branch for the members.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);
    
    try {
      const response = await MemberService.uploadExcel(
        selectedFile, 
        selectedBranchId
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data.success) {
        setUploadResults(response.data.results);
        setShowResults(true);
        
        toast({
          title: 'Upload successful',
          description: response.data.message,
        });
      } else {
        setUploadError(response.data.message);
        toast({
          title: 'Upload failed',
          description: response.data.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadError(error.response?.data?.message || 'Failed to upload file. Please try again.');
      
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResults(null);
    setShowResults(false);
    setUploadError(null);
    setSelectedBranchId(currentBranch?.id || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <TableIcon className="h-4 w-4" />
          <span>Bulk Upload</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Bulk Upload</DialogTitle>
          <DialogDescription>
            Upload member data from an Excel file to register multiple members at once.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Members</TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Download Template</CardTitle>
                  <CardDescription>
                    Use our Excel template to ensure your data is formatted correctly.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadTemplate}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Members</CardTitle>
                  <CardDescription>
                    Select an Excel file (.xlsx or .xls) containing member information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center gap-2">
                      Branch <span className="text-xs text-destructive">*</span>
                    </Label>
                    <Select 
                      value={selectedBranchId} 
                      onValueChange={setSelectedBranchId}
                      disabled={isUploading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {availableBranches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.displayName || branch.name} ({branch.branchCode})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Excel File</Label>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <input
                        id="file"
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full gap-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Select File</span>
                        </Button>
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected file: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {uploadError && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
                    Reset
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || !selectedBranchId || isUploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {uploadResults && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Upload Results</h3>
                  <span className="text-sm text-muted-foreground">
                    {uploadResults.success.length} of {uploadResults.total} members uploaded successfully
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium text-green-600">Successfully Uploaded ({uploadResults.success.length})</h4>
                  {uploadResults.success.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-2 px-4 text-left font-medium">Name</th>
                            <th className="py-2 px-4 text-left font-medium">ID</th>
                            <th className="py-2 px-4 text-left font-medium">Account Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.success.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-2 px-4">{item.fullName}</td>
                              <td className="py-2 px-4">{item.nin}</td>
                              <td className="py-2 px-4">{item.accountNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No members were successfully uploaded.</p>
                  )}
                </div>
                
                {uploadResults.errors.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive">Failed Uploads ({uploadResults.errors.length})</h4>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-2 px-4 text-left font-medium">Row Data</th>
                            <th className="py-2 px-4 text-left font-medium">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.errors.map((item, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-2 px-4 max-w-[250px] truncate">
                                {item.row['Full Name *'] || '(unknown)'} - {item.row['National ID Number *'] || '(unknown)'}
                              </td>
                              <td className="py-2 px-4 text-destructive">{item.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              // Close the dialog by setting state
              document.body.click(); // This will close the dialog
              
              // Then refresh the page to show newly added members
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
          >
            Close & Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberExcelUpload;
