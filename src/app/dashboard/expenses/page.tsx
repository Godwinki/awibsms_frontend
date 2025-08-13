"use client"

import { useState, useEffect } from "react"
import { ExpenseStatusCard } from "@/components/expenses/expense-status-card"
import { PlusIcon, CheckIcon, ClockIcon, BanknoteIcon, SendIcon, SearchIcon, CalendarIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { expenseService, type Expense } from "@/lib/services/expense.service"
import { authService } from "@/lib/services/auth.service"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

// Extend the Expense type with properties we're using
interface ExtendedExpense extends Omit<Expense, 'createdAt' | 'accountantApprovalDate'> {
  title?: string;
  createdAt?: string | Date;
  user?: {
    firstName: string;
    lastName: string;
  };
  accountantApprovalDate?: string | Date;
}

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<ExtendedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [filteredExpenses, setFilteredExpenses] = useState<ExtendedExpense[]>([])
  
  // Counters for status cards
  const [counts, setCounts] = useState<Record<string, number>>({
    DRAFT: 0,
    SUBMITTED: 0,
    MANAGER_APPROVED: 0,
    ACCOUNTANT_APPROVED: 0,
    PROCESSED: 0,
    COMPLETED: 0,
    REJECTED: 0
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    
    const fetchExpenses = async () => {
      try {
        setIsLoading(true)
        const data = await expenseService.getExpenseRequests()
        setExpenses(data as ExtendedExpense[])
        setFilteredExpenses(data as ExtendedExpense[])
        
        // Update counts
        const newCounts = { ...counts }
        data.forEach(expense => {
          if (expense.status in newCounts) {
            newCounts[expense.status as keyof typeof newCounts]++
          }
        })
        setCounts(newCounts)
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExpenses()
  }, [])

  // Effect to apply filters to All Requests tab
  useEffect(() => {
    if (!expenses.length) return

    // Generate ISO string format for API calls if needed
    const startDateStr = startDate ? startDate.toISOString() : undefined
    const endDateStr = endDate ? endDate.toISOString() : undefined
    
    // Local filtering for search
    let filtered = [...expenses]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(expense => 
        expense.requestNumber?.toLowerCase().includes(query) ||
        expense.title?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.user?.firstName?.toLowerCase().includes(query) ||
        expense.user?.lastName?.toLowerCase().includes(query)
      )
    }
    
    // Date filtering
    if (startDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.createdAt || '') >= startDate
      )
    }
    
    if (endDate) {
      // Add one day to include the full end date
      const nextDay = new Date(endDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      filtered = filtered.filter(expense => 
        new Date(expense.createdAt || '') < nextDay
      )
    }
    
    setFilteredExpenses(filtered)
  }, [expenses, searchQuery, startDate, endDate])
  
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
  
  // Filter expenses for the current user
  const userExpenses = expenses.filter(expense => 
    expense.userId === currentUser?.id
  )

  // Filter expenses that require approval by the user's role
  const pendingApprovals = expenses.filter(expense => {
    const userRole = currentUser?.role;
    
    // Accountant approvals - SUBMITTED status
    if (userRole === 'accountant' || userRole === 'admin') {
      return expense.status === 'SUBMITTED';
    }
    
    // Manager approvals - ACCOUNTANT_APPROVED status
    if (userRole === 'manager' || userRole === 'admin') {
      return expense.status === 'ACCOUNTANT_APPROVED';
    }
    
    // Cashier processing - MANAGER_APPROVED status
    if (userRole === 'cashier' || userRole === 'admin') {
      return expense.status === 'MANAGER_APPROVED';
    }
    
    return false;
  })

  // For display in cards/dashboard
  const accountantApprovals = expenses.filter(expense => 
    expense.status === 'SUBMITTED'
  )

  const managerApprovals = expenses.filter(expense => 
    expense.status === 'ACCOUNTANT_APPROVED'
  )

  const cashierProcessing = expenses.filter(expense => 
    expense.status === 'MANAGER_APPROVED'
  )

  // Determine which tab should be the default based on user role
  const getDefaultTab = (role?: string) => {
    if (role === 'accountant') return 'approvals';
    if (role === 'manager') return 'approvals';
    if (role === 'cashier') return 'processing';
    if (role === 'admin') return 'all-requests';
    return 'my-expenses'; // Default for regular users
  }

  // Add a function to handle submitting a draft expense
  const handleSubmitDraft = async (id: string) => {
    try {
      await expenseService.submitExpenseRequest(id)
      
      toast({
        title: "Success",
        description: "Expense request submitted successfully"
      })
      
      // Refresh expenses
      const data = await expenseService.getExpenseRequests()
      setExpenses(data as ExtendedExpense[])
      
      // Update counts
      const newCounts = { ...counts }
      data.forEach(expense => {
        if (expense.status in newCounts) {
          newCounts[expense.status as keyof typeof newCounts]++
        }
      })
      setCounts(newCounts)
    } catch (error) {
      console.error("Failed to submit expense:", error)
      toast({
        title: "Error",
        description: "Failed to submit expense request. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle date reset
  const handleResetFilters = () => {
    setSearchQuery("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // Check if user has permission to view all expenses
  const canViewAllExpenses = 
    currentUser?.role === 'admin' || 
    currentUser?.role === 'manager' || 
    currentUser?.role === 'accountant' || 
    currentUser?.role === 'cashier'

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Manage and review all your financial expenses in one place.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/create">
            <PlusIcon className="mr-2 h-4 w-4" /> New Expense
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue={getDefaultTab(currentUser?.role)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-expenses">My Expenses</TabsTrigger>
          {canViewAllExpenses && <TabsTrigger value="all-requests">All Requests</TabsTrigger>}
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ExpenseStatusCard
              title="Draft Expenses"
              count={counts.DRAFT}
              description="Expenses in draft status"
              icon={<PlusIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/expenses/status/DRAFT"
            />
            <ExpenseStatusCard
              title="Submitted Expenses"
              count={counts.SUBMITTED}
              description="Expenses awaiting review"
              icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/expenses/status/SUBMITTED"
            />
            <ExpenseStatusCard
              title="Approved Expenses"
              count={counts.MANAGER_APPROVED + counts.ACCOUNTANT_APPROVED}
              description="Expenses approved for payment"
              icon={<CheckIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/expenses/status/APPROVED"
            />
            <ExpenseStatusCard
              title="Processed Expenses"
              count={counts.PROCESSED + counts.COMPLETED}
              description="Expenses processed by cashier"
              icon={<BanknoteIcon className="h-4 w-4 text-muted-foreground" />}
              href="/dashboard/expenses/status/PROCESSED"
            />
          </div>
          
          <ExpenseRoleBasedCards 
            managerCount={managerApprovals.length}
            accountantCount={accountantApprovals.length}
            cashierCount={cashierProcessing.length}
            userRole={currentUser?.role || 'user'}
          />
        </TabsContent>

        <TabsContent value="my-expenses" className="space-y-4">
          <h3 className="text-lg font-medium">My Expense Requests</h3>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : userExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">You don't have any expense requests yet.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/expenses/create">
                  <PlusIcon className="mr-2 h-4 w-4" /> Create Expense Request
                </Link>
              </Button>
            </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.requestNumber}</TableCell>
                      <TableCell>{expense.title || expense.description}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'TZS' 
                        }).format(expense.totalEstimatedAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell>{formatDate(new Date(expense.createdAt || ''))}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/dashboard/expenses/${expense.id}`}
                            className="text-primary hover:underline"
                          >
                            View
                          </Link>
                          
                          {expense.status === 'DRAFT' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSubmitDraft(expense.id)}
                            >
                              <SendIcon className="mr-1 h-3 w-3" /> Submit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        {canViewAllExpenses && (
          <TabsContent value="all-requests" className="space-y-4">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-medium">All Expense Requests</h3>
              <div className="flex space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <DatePicker 
                    date={startDate} 
                    setDate={setStartDate} 
                    className="w-[150px]"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <DatePicker 
                    date={endDate} 
                    setDate={setEndDate} 
                    className="w-[150px]"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Search</span>
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="mt-auto"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No expense requests match your filters.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request #</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.requestNumber}</TableCell>
                        <TableCell>{expense.user?.firstName} {expense.user?.lastName}</TableCell>
                        <TableCell>{expense.title || expense.description}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'TZS' 
                          }).format(expense.totalEstimatedAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell>{formatDate(new Date(expense.createdAt || ''))}</TableCell>
                        <TableCell>
                          <Button 
                            asChild
                            size="sm"
                            variant="default"
                          >
                            <Link 
                              href={`/dashboard/expenses/${expense.id}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="approvals" className="space-y-4">
          <h3 className="text-lg font-medium">Pending Approvals for {currentUser?.role === 'manager' ? 'Manager' : currentUser?.role === 'accountant' ? 'Accountant' : currentUser?.role === 'cashier' ? 'Cashier' : 'Review'}</h3>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : pendingApprovals.length === 0 ? (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">No expense requests waiting for your approval.</p>
            </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.requestNumber}</TableCell>
                      <TableCell>{expense.user?.firstName} {expense.user?.lastName}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'TZS' 
                        }).format(expense.totalEstimatedAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell>{formatDate(new Date(expense.createdAt || ''))}</TableCell>
                      <TableCell>
                        <Button 
                          asChild
                          size="sm"
                          variant="default"
                        >
                          <Link 
                            href={`/dashboard/expenses/${expense.id}`}
                          >
                            Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <h3 className="text-lg font-medium">Pending Processing</h3>
          <div className="rounded-md border">
            {cashierProcessing.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No expense requests waiting for processing.</p>
            </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashierProcessing.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.requestNumber}</TableCell>
                      <TableCell>{expense.user?.firstName} {expense.user?.lastName}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'TZS' 
                        }).format(expense.totalEstimatedAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell>{formatDate(new Date(expense.accountantApprovalDate || ''))}</TableCell>
                      <TableCell>
                        <Link 
                          href={`/dashboard/expenses/${expense.id}`}
                          className="text-primary hover:underline"
                        >
                          Process
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ExpenseRoleBasedCards({ managerCount, accountantCount, cashierCount, userRole }: {
  managerCount: number,
  accountantCount: number,
  cashierCount: number,
  userRole: string
}) {
  // In a real app, create actual role checking logic using your auth system
  const isManager = userRole === "manager" || userRole === "admin"
  const isAccountant = userRole === "accountant" || userRole === "admin"
  const isCashier = userRole === "cashier" || userRole === "admin"
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Role-based Actions</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Everyone can see this */}
        <ExpenseStatusCard
          title="Create Request"
          count={null}
          description="Create a new expense request"
          icon={<PlusIcon className="h-4 w-4 text-muted-foreground" />}
          href="/dashboard/expenses/create"
          className="border-primary/20 hover:border-primary"
        />
        
        {/* Accountant-specific cards - first approvers */}
        {isAccountant && (
          <ExpenseStatusCard
            title="Accountant Approvals"
            count={accountantCount}
            description="Review and allocate budget for expenses"
            icon={<CheckIcon className="h-4 w-4 text-muted-foreground" />}
            href="/dashboard/expenses/accountant-approvals"
            className="border-blue-500/20 hover:border-blue-500"
          />
        )}
        
        {/* Manager-specific cards - second approvers */}
        {isManager && (
          <ExpenseStatusCard
            title="Manager Approvals"
            count={managerCount}
            description="Approve budget-allocated expenses"
            icon={<CheckIcon className="h-4 w-4 text-muted-foreground" />}
            href="/dashboard/expenses/manager-approvals"
            className="border-green-500/20 hover:border-green-500"
          />
        )}
        
        {/* Cashier-specific cards */}
        {isCashier && (
          <ExpenseStatusCard
            title="Process Payments"
            count={cashierCount}
            description="Process approved expense payments"
            icon={<BanknoteIcon className="h-4 w-4 text-muted-foreground" />}
            href="/dashboard/expenses/process-payments"
            className="border-yellow-500/20 hover:border-yellow-500"
          />
        )}
      </div>
    </div>
  )
}
