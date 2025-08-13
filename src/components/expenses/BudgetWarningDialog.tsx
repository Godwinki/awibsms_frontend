import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatAmount } from '@/lib/utils'

export interface BudgetWarningItem {
  categoryId: string
  categoryName: string
  allocated: number
  currentlyUsed: number
  requested: number
  deficit: number
}

interface BudgetWarningDialogProps {
  open: boolean
  onClose: () => void
  onProceed: () => void
  warnings: BudgetWarningItem[]
  type: 'warning' | 'error'
  title?: string
  description?: string
  okText?: string
  cancelText?: string
}

export function BudgetWarningDialog({
  open,
  onClose,
  onProceed,
  warnings,
  type = 'warning',
  title = type === 'warning' ? 'Budget Warning' : 'Budget Exceeded',
  description = type === 'warning' 
    ? 'The following budget categories will exceed their allocated budget. Do you want to proceed?' 
    : 'The following budget categories will exceed their allocated budget. You cannot proceed without authorization.',
  okText = type === 'warning' ? 'Proceed Anyway' : 'Override Budget Limits',
  cancelText = 'Cancel'
}: BudgetWarningDialogProps) {
  if (!warnings || warnings.length === 0) return null
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {type === 'warning' ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-2">
          {warnings.map((warning) => (
            <Alert key={warning.categoryId} className={type === 'warning' ? 'border-amber-500' : 'border-red-500'}>
              <AlertTitle className="font-semibold">{warning.categoryName}</AlertTitle>
              <AlertDescription className="text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div>Allocated Budget:</div>
                  <div className="font-medium">{formatAmount(warning.allocated)}</div>
                  
                  <div>Currently Used:</div>
                  <div className="font-medium">{formatAmount(warning.currentlyUsed)}</div>
                  
                  <div>Requested Amount:</div>
                  <div className="font-medium">{formatAmount(warning.requested)}</div>
                  
                  <div className={type === 'warning' ? 'text-amber-600' : 'text-red-600'}>Budget Deficit:</div>
                  <div className={`font-medium ${type === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>
                    {formatAmount(warning.deficit)}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
        
        <DialogFooter className="gap-2 flex">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            onClick={onProceed}
            variant={type === 'warning' ? 'default' : 'destructive'}
          >
            {okText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
