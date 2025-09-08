"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Trash2, Archive } from "lucide-react";

export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  itemType?: string;
  description?: string;
  warning?: string;
  onConfirm: (hardDelete: boolean) => void;
  loading?: boolean;
  showHardDeleteOption?: boolean;
  consequences?: string[];
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  itemName,
  itemType = "item",
  description,
  warning,
  onConfirm,
  loading = false,
  showHardDeleteOption = false,
  consequences = []
}: DeleteConfirmationDialogProps) {
  const [hardDelete, setHardDelete] = React.useState(false);

  const handleConfirm = () => {
    onConfirm(hardDelete);
  };

  const handleCancel = () => {
    setHardDelete(false);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setHardDelete(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hardDelete ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
              {hardDelete ? <Trash2 className="h-5 w-5" /> : <Archive className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {description || `This action will ${hardDelete ? 'permanently delete' : 'deactivate'} the ${itemType}.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)} to {hardDelete ? 'delete' : 'deactivate'}:
              </span>
            </div>
            <div className="font-semibold text-gray-900">"{itemName}"</div>
          </div>

          {warning && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Warning</div>
                <div>{warning}</div>
              </div>
            </div>
          )}

          {showHardDeleteOption && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hardDelete"
                  checked={hardDelete}
                  onChange={(e) => setHardDelete(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="hardDelete" className="text-sm font-medium text-gray-700">
                  Permanently delete instead of deactivating
                </label>
              </div>

              <div className={`p-3 rounded-lg border transition-all ${
                hardDelete 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={hardDelete ? "destructive" : "secondary"} className="text-xs">
                    {hardDelete ? "Permanent Deletion" : "Soft Deletion"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {hardDelete 
                    ? "The item will be completely removed from the database and cannot be recovered."
                    : "The item will be marked as inactive and can be restored later if needed."
                  }
                </div>
              </div>
            </div>
          )}

          {consequences.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">This action will also:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                {consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={hardDelete ? "destructive" : "secondary"}
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {hardDelete ? "Deleting..." : "Deactivating..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hardDelete ? <Trash2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {hardDelete ? "Delete Permanently" : "Deactivate"}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
