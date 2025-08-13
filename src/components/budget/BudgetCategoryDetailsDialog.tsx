"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { budgetService, BudgetCategory } from "@/lib/services/budget.service";
import { useToast } from "@/components/ui/use-toast";

interface BudgetCategoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function BudgetCategoryDetailsDialog({
  open,
  onOpenChange,
  category,
  onUpdated,
  onDeleted,
}: BudgetCategoryDetailsDialogProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || "",
    code: category?.code || "",
    description: category?.description || "",
    type: category?.type || "expense",
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Sync form with category changes
  React.useEffect(() => {
    setForm({
      name: category?.name || "",
      code: category?.code || "",
      description: category?.description || "",
      type: category?.type || "expense",
    });
    setEditMode(false);
  }, [category]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setLoading(true);
    try {
      await budgetService.updateBudgetCategory(category.id, form);
      toast({ title: "Success", description: "Category updated." });
      setEditMode(false);
      onUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (deleteInput !== "Delete") {
      toast({
        title: "Type 'Delete' to confirm.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await budgetService.deleteBudgetCategory(category.id);
      toast({ title: "Deleted", description: "Category deleted." });
      onDeleted?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteInput("");
    }
  };

  if (!category) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl rounded-xl p-8 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <span>Category Details</span>
              <Badge variant={category.type === 'expense' ? 'destructive' : category.type === 'income' ? 'default' : 'secondary'} className="uppercase">{category.type}</Badge>
            </DialogTitle>
            <DialogDescription className="mb-4 text-base">
              View and manage this budget category. <br />
              <span className="text-xs text-muted-foreground">ID: {category.id}</span>
            </DialogDescription>
          </DialogHeader>
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Category Name"
                required
              />
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="Code"
                required
              />
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description"
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={loading}>Cancel</Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold text-muted-foreground">Name</div>
                  <div className="text-lg font-bold">{category.name}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">Code</div>
                  <div className="text-lg font-mono">{category.code}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">Type</div>
                  <Badge variant={category.type === 'expense' ? 'destructive' : category.type === 'income' ? 'default' : 'secondary'} className="uppercase">{category.type}</Badge>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">Description</div>
                  <div>{category.description || <span className="italic text-muted-foreground">No description</span>}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">Allocated Budget</div>
                  <div className="text-green-700 font-bold text-lg">TZS {Number(category.allocatedAmount).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">Used Budget</div>
                  <div className="text-orange-700 font-bold text-lg">TZS {Number(category.usedAmount).toLocaleString()}</div>
                </div>
              </div>
              <DialogFooter className="flex flex-col md:flex-row gap-2 md:gap-4 justify-end mt-6">
                <Button variant="default" onClick={() => setEditMode(true)} disabled={loading}>Edit</Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>Delete</Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-red-700">Confirm Delete</DialogTitle>
            <DialogDescription>
              To confirm deletion, please type <span className="font-bold">Delete</span> below. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            placeholder="Type Delete to confirm"
            className="border-red-400 focus:border-red-600"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading || deleteInput !== "Delete"}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
