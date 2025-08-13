'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  isPublic: boolean;
}

interface DeleteConfirmDialogProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blog: Blog) => Promise<void>;
}

export default function DeleteConfirmDialog({ 
  blog, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!blog) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(blog);
      onClose();
    } catch (error) {
      console.error('Failed to delete blog:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isPublished = blog.status === 'published' && blog.isPublic;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Blog Post
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Are you sure you want to delete <strong>"{blog.title}"</strong>?
            </p>
            
            {isPublished && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Warning: This blog post is currently published and visible to the public.
                </p>
                <p className="text-red-700 text-sm mt-1">
                  Deleting it will remove it from your website immediately.
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All content, images, and associated data will be permanently removed.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Blog Post'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
