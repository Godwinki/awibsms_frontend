"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, FileTextIcon, CheckIcon, XIcon, CircleDollarSignIcon, SendIcon, PrinterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { expenseService, type Expense, type BudgetWarning } from "@/lib/services/expense.service"
import { authService } from "@/lib/services/auth.service"
import { budgetService } from "@/lib/services/budget.service" 
import { toast, useToast } from "@/components/ui/use-toast"
import { formatDate, formatAmount } from "@/lib/utils"
import axios from "@/lib/axios"
import { BudgetWarningDialog, type BudgetWarningItem } from "@/components/expenses/BudgetWarningDialog"

export default function ExpenseDetailClient() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isAccountantApproveDialogOpen, setIsAccountantApproveDialogOpen] = useState(false)
  const [isManagerApproveDialogOpen, setIsManagerApproveDialogOpen] = useState(false)
  const [processingDetails, setProcessingDetails] = useState({
    transactionDetails: "",
    notes: ""
  })
  const [selectedBudgetAllocations, setSelectedBudgetAllocations] = useState<string[]>([])
  const [budgetCategories, setBudgetCategories] = useState<any[]>([])
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [showBudgetWarning, setShowBudgetWarning] = useState(false)
  const [budgetWarnings, setBudgetWarnings] = useState<BudgetWarningItem[]>([])
  
  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    
    const fetchExpense = async () => {
      try {
        setIsLoading(true)
        const data = await expenseService.getExpenseRequestById(id as string)
        setExpense(data)
        
        // If user is accountant, also fetch budget categories 
        if (user?.role === 'accountant' || user?.role === 'admin') {
          const categories = await budgetService.getBudgetCategories('expense')
          setBudgetCategories(categories)
        }
      } catch (error) {
        console.error("Failed to fetch expense:", error)
        toast({
          title: "Error",
          description: "Failed to load expense data. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExpense()
  }, [id])
  
  // Add a function to handle submitting a draft expense
  const handleSubmitDraft = async () => {
    try {
      await expenseService.submitExpenseRequest(id as string)
      
      toast({
        title: "Success",
        description: "Expense request submitted successfully"
      })
      
      // Refresh expense data
      const updatedExpense = await expenseService.getExpenseRequestById(id as string)
      setExpense(updatedExpense)
    } catch (error) {
      console.error("Failed to submit expense:", error)
      toast({
        title: "Error",
        description: "Failed to submit expense request. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'TZS' 
    }).format(amount)
  }
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'DRAFT': 'secondary',
      'SUBMITTED': 'default',
      'ACCOUNTANT_APPROVED': 'blue',
      'MANAGER_APPROVED': 'success',
      'PROCESSED': 'outline',
      'COMPLETED': 'success',
      'REJECTED': 'destructive'
    }
    
    const statusLabels: Record<string, string> = {
      'DRAFT': 'Draft',
      'SUBMITTED': 'Submitted',
      'ACCOUNTANT_APPROVED': 'Accountant Approved',
      'MANAGER_APPROVED': 'Manager Approved',
      'PROCESSED': 'Processed',
      'COMPLETED': 'Completed',
      'REJECTED': 'Rejected'
    }
    
    return (
      <Badge variant={variants[status] as any || 'secondary'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }
  
  // Handle accountant approval
  const handleAccountantApprove = async () => {
    if (!selectedBudgetAllocations.length) {
      toast({
        title: "Error",
        description: "Please select at least one budget allocation",
        variant: "destructive"
      })
      return
    }
    
    try {
      const result = await expenseService.approveByAccountant(id as string, {
        notes: approvalNotes,
        budgetAllocationIds: selectedBudgetAllocations
      })
      
      // Check if there are budget warnings
      if (result.budgetWarnings && result.budgetWarnings.length > 0) {
        // Convert to BudgetWarningItem format
        setBudgetWarnings(result.budgetWarnings.map(warning => ({
          categoryId: warning.categoryId,
          categoryName: warning.categoryName,
          allocated: warning.allocated,
          currentlyUsed: warning.currentlyUsed,
          requested: warning.requested,
          deficit: warning.deficit
        })))
        
        setShowBudgetWarning(true)
        toast({
          title: "Warning",
          description: "Expense approved, but budget limits will be exceeded",
          variant: "warning"
        })
      } else {
        toast({
          title: "Success",
          description: "Expense approved successfully"
        })
      }
      
      setIsAccountantApproveDialogOpen(false)
      
      // Refresh expense data
      const updatedExpense = await expenseService.getExpenseRequestById(id as string)
      setExpense(updatedExpense)
    } catch (error) {
      console.error("Failed to approve expense:", error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle manager approval
  const handleManagerApprove = async () => {
    try {
      const result = await expenseService.approveByManager(id as string, {
        notes: approvalNotes
      })
      
      // Check if there are budget warnings
      if (result.budgetWarnings && result.budgetWarnings.length > 0) {
        // Convert to BudgetWarningItem format
        setBudgetWarnings(result.budgetWarnings.map(warning => ({
          categoryId: warning.categoryId,
          categoryName: warning.categoryName,
          allocated: warning.allocated,
          currentlyUsed: warning.currentlyUsed,
          requested: warning.requested,
          deficit: warning.deficit
        })))
        
        setShowBudgetWarning(true)
        toast({
          title: "Warning",
          description: "Expense approved, but budget limits will be exceeded",
          variant: "warning"
        })
      } else {
        toast({
          title: "Success",
          description: "Expense approved successfully"
        })
      }
      
      setIsManagerApproveDialogOpen(false)
      
      // Refresh expense data
      const updatedExpense = await expenseService.getExpenseRequestById(id as string)
      setExpense(updatedExpense)
    } catch (error) {
      console.error("Failed to approve expense:", error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle rejection
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required",
        variant: "destructive"
      })
      return
    }
    
    try {
      await expenseService.rejectExpenseRequest(id as string, {
        rejectionReason
      })
      
      toast({
        title: "Success",
        description: "Expense rejected successfully"
      })
      
      setIsRejectDialogOpen(false)
      
      // Refresh expense data
      const updatedExpense = await expenseService.getExpenseRequestById(id as string)
      setExpense(updatedExpense)
    } catch (error) {
      console.error("Failed to reject expense:", error)
      toast({
        title: "Error",
        description: "Failed to reject expense. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle cashier processing
  const handleProcess = async (overrideBudget = false) => {
    if (!processingDetails.transactionDetails.trim()) {
      toast({
        title: "Error",
        description: "Transaction details are required",
        variant: "destructive"
      })
      return
    }
    
    try {
      await expenseService.processByCashier(id as string, {
        ...processingDetails,
        overrideBudgetLimit: overrideBudget
      })
      
      toast({
        title: "Success",
        description: "Expense processed successfully"
      })
      
      setIsProcessDialogOpen(false)
      
      // Refresh expense data
      const updatedExpense = await expenseService.getExpenseRequestById(id as string)
      setExpense(updatedExpense)
    } catch (error: any) {
      console.error("Failed to process expense:", error)
      
      // Check if this is a budget exceeded error
      if (error.type === 'budget_exceeded') {
        setBudgetWarnings(error.data.exceededItems || [])
        setShowBudgetWarning(true)
        setIsProcessDialogOpen(false) // Close the process dialog
      } else {
        toast({
          title: "Error",
          description: "Failed to process expense. Please try again.",
          variant: "destructive"
        })
      }
    }
  }
  
  // Handle budget override
  const handleBudgetOverride = () => {
    setShowBudgetWarning(false)
    // Process again with override flag
    handleProcess(true)
  }
  
  // Handle budget allocation selection
  const handleBudgetAllocationToggle = (categoryId: string) => {
    if (selectedBudgetAllocations.includes(categoryId)) {
      setSelectedBudgetAllocations(
        selectedBudgetAllocations.filter(id => id !== categoryId)
      )
    } else {
      setSelectedBudgetAllocations([...selectedBudgetAllocations, categoryId])
    }
  }
  
  // Show actions based on user role and expense status
  const renderActions = () => {
    if (!expense || !currentUser) return null
    
    const userRole = currentUser.role
    const status = expense.status
    
    // Allow submitting draft expenses (for owners or admins)
    if (status === 'DRAFT' && (expense.userId === currentUser.id || userRole === 'admin')) {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={handleSubmitDraft}
          >
            <SendIcon className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
      )
    }
    
    // Accountant actions (approves SUBMITTED expenses)
    if ((userRole === 'accountant' || userRole === 'admin') && status === 'SUBMITTED') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={() => setIsAccountantApproveDialogOpen(true)}
          >
            <CheckIcon className="mr-2 h-4 w-4" />
            Approve as Accountant
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setIsRejectDialogOpen(true)}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      )
    }
    
    // Manager actions (approves ACCOUNTANT_APPROVED expenses)
    if ((userRole === 'manager' || userRole === 'admin') && status === 'ACCOUNTANT_APPROVED') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={() => setIsManagerApproveDialogOpen(true)}
          >
            <CheckIcon className="mr-2 h-4 w-4" />
            Approve as Manager
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setIsRejectDialogOpen(true)}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      )
    }
    
    // Cashier actions (processes MANAGER_APPROVED expenses)
    if ((userRole === 'cashier' || userRole === 'admin') && status === 'MANAGER_APPROVED') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={() => setIsProcessDialogOpen(true)}
          >
            <CircleDollarSignIcon className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setIsRejectDialogOpen(true)}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      )
    }
    
    return null
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>
  }
  
  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h3 className="text-xl font-medium mb-2">Expense Not Found</h3>
        <p className="text-muted-foreground mb-4">The requested expense does not exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/dashboard/expenses">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Expenses
          </Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard/expenses">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Expense Details</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                // Show loading indicator
                toast({
                  title: "Downloading PDF",
                  description: "Please wait while we generate your PDF...",
                });
                
                // Get the PDF URL - using the base API URL from axios
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const pdfEndpoint = expenseService.getExpensePdfUrl(id as string);
                const pdfUrl = `${apiBaseUrl}${pdfEndpoint}`;
                
                // Fetch the PDF file with authorization header
                const token = localStorage.getItem('token');
                const response = await fetch(pdfUrl, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                
                if (!response.ok) {
                  throw new Error('Failed to download PDF');
                }
                
                // Get the PDF as a blob
                const blob = await response.blob();
                
                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);
                
                // Create a temporary link element
                const link = document.createElement('a');
                link.href = url;
                link.download = `expense-${expense.requestNumber || id}.pdf`;
                
                // Append link to the body, click it, and remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up the URL object
                window.URL.revokeObjectURL(url);
                
                toast({
                  title: "Success",
                  description: "PDF downloaded successfully",
                });
              } catch (error) {
                console.error('Error downloading PDF:', error);
                toast({
                  title: "Error",
                  description: "Failed to download PDF. Please try again.",
                  variant: "destructive"
                });
              }
            }}
          >
            <FileTextIcon className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                // Show loading indicator
                toast({
                  title: "Preparing print view",
                  description: "Please wait...",
                });
                
                // Get the PDF URL - using the base API URL from axios
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const pdfEndpoint = expenseService.getExpensePdfUrl(id as string);
                const pdfUrl = `${apiBaseUrl}${pdfEndpoint}`;
                
                // Fetch the PDF file with authorization header
                const token = localStorage.getItem('token');
                const response = await fetch(pdfUrl, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                
                if (!response.ok) {
                  throw new Error('Failed to load PDF for printing');
                }
                
                // Get the PDF as a blob
                const blob = await response.blob();
                
                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);
                
                // Open the PDF in a new window for printing
                const printWindow = window.open(url, '_blank');
                
                // Wait for the window to load, then print
                if (printWindow) {
                  printWindow.addEventListener('load', function() {
                    printWindow.print();
                  });
                }
                
                toast({
                  title: "Success",
                  description: "Print dialog opened",
                });
              } catch (error) {
                console.error('Error printing PDF:', error);
                toast({
                  title: "Error",
                  description: "Failed to print PDF. Please try again.",
                  variant: "destructive"
                });
              }
            }}
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          {renderActions()}
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {expense.title || expense.description}
                </CardTitle>
                <CardDescription>
                  Request #{expense.requestNumber}
                </CardDescription>
              </div>
              <div>
                {getStatusBadge(expense.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Requester</h4>
                <p className="text-sm text-muted-foreground">
                  {expense.user?.firstName} {expense.user?.lastName}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Department</h4>
                <p className="text-sm text-muted-foreground">
                  {expense.department?.name}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Amount</h4>
                <p className="text-sm font-semibold">
                  {formatAmount(expense.totalEstimatedAmount)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(expense.createdAt || ''))}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Purpose</h4>
              <p className="text-sm text-muted-foreground">
                {expense.purpose || 'No purpose specified'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {expense.description || 'No description provided'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm">Description</th>
                  <th className="text-left p-2 text-sm">Category</th>
                  <th className="text-right p-2 text-sm">Quantity</th>
                  <th className="text-right p-2 text-sm">Unit Price</th>
                  <th className="text-right p-2 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {expense.items && expense.items.length > 0 ? (
                  expense.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="p-2 text-sm">{item.description}</td>
                      <td className="p-2 text-sm">{item.category?.name || '-'}</td>
                      <td className="p-2 text-sm text-right">{item.quantity || 1}</td>
                      <td className="p-2 text-sm text-right">{formatAmount(item.unitPrice || 0)}</td>
                      <td className="p-2 text-sm text-right">{formatAmount(item.estimatedAmount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-2 text-center text-sm text-muted-foreground">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="p-2 text-right font-medium">Total:</td>
                  <td className="p-2 text-right font-bold">{formatAmount(expense.totalEstimatedAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Submitted</h4>
                  <p className="text-sm text-muted-foreground">
                    {expense.createdAt ? formatDate(new Date(expense.createdAt)) : 'Not submitted'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Accountant Approval</h4>
                  <p className="text-sm text-muted-foreground">
                    {expense.accountantApprovalDate 
                      ? `${formatDate(new Date(expense.accountantApprovalDate))} by ${expense.accountantApprover?.firstName || ''} ${expense.accountantApprover?.lastName || ''}`
                      : 'Pending'}
                  </p>
                  {expense.accountantNotes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: {expense.accountantNotes}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Manager Approval</h4>
                  <p className="text-sm text-muted-foreground">
                    {expense.managerApprovalDate 
                      ? `${formatDate(new Date(expense.managerApprovalDate))} by ${expense.managerApprover?.firstName || ''} ${expense.managerApprover?.lastName || ''}`
                      : 'Pending'}
                  </p>
                  {expense.managerNotes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: {expense.managerNotes}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    {expense.processedDate 
                      ? `${formatDate(new Date(expense.processedDate))} by ${expense.cashierProcessor?.firstName || ''} ${expense.cashierProcessor?.lastName || ''}`
                      : 'Pending'}
                  </p>
                  {expense.transactionDetails && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {expense.transactionDetails}
                    </p>
                  )}
                </div>
              </div>
              
              {expense.status === 'REJECTED' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Rejected</h4>
                  <p className="text-sm text-red-700">
                    {expense.rejectionReason || 'No reason provided'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Accountant Approval Dialog */}
      <Dialog open={isAccountantApproveDialogOpen} onOpenChange={setIsAccountantApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve as Accountant</DialogTitle>
            <DialogDescription>
              Review budget allocations and approve this expense.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Budget Allocations</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                {budgetCategories.length > 0 ? (
                  budgetCategories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedBudgetAllocations.includes(category.id)}
                        onChange={() => handleBudgetAllocationToggle(category.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.name} ({category.code}) - Available: {formatAmount(category.allocatedAmount - category.usedAmount)}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No budget categories available</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="accountantNotes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id="accountantNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes related to this approval"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccountantApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccountantApprove}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manager Approval Dialog */}
      <Dialog open={isManagerApproveDialogOpen} onOpenChange={setIsManagerApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve as Manager</DialogTitle>
            <DialogDescription>
              Review and approve this expense request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="managerNotes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="managerNotes"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes related to this approval"
              className="mt-1"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagerApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManagerApprove}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="rejectionReason" className="text-sm font-medium">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this expense is being rejected"
              className="mt-1"
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Processing Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Expense Payment</DialogTitle>
            <DialogDescription>
              Enter transaction details for this expense payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="transactionDetails" className="text-sm font-medium">
                Transaction Details <span className="text-red-500">*</span>
              </label>
              <Input
                id="transactionDetails"
                value={processingDetails.transactionDetails}
                onChange={(e) => setProcessingDetails({
                  ...processingDetails,
                  transactionDetails: e.target.value
                })}
                placeholder="Bank transfer reference, check number, etc."
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="processingNotes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id="processingNotes"
                value={processingDetails.notes}
                onChange={(e) => setProcessingDetails({
                  ...processingDetails,
                  notes: e.target.value
                })}
                placeholder="Add any notes related to this payment"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleProcess()}>
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Budget Warning Dialog */}
      <BudgetWarningDialog 
        open={showBudgetWarning} 
        warnings={budgetWarnings} 
        onClose={() => setShowBudgetWarning(false)} 
        onProceed={handleBudgetOverride}
        type="error"
        title="Budget Limit Exceeded"
        description="This expense would exceed the budget for one or more categories. Do you have authorization to override the budget limits?"
        okText="Process Anyway (Override)"
      />
    </div>
  )
} 