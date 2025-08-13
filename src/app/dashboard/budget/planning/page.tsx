"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Calendar, 
  Settings, 
  BadgeDollarSign, 
  PieChart,
  DollarSign,
  BarChartHorizontal
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { budgetService, type BudgetCategory } from "@/lib/services/budget.service"
import BudgetCategoryDetailsDialog from "@/components/budget/BudgetCategoryDetailsDialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import axios from "@/lib/axios"

export default function BudgetPlanningPage() {
  const { toast } = useToast()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("active")
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)

  const [newCategory, setNewCategory] = useState({
    name: '',
    code: '',
    description: '',
    type: 'expense' as 'income' | 'expense' | 'capital'
  })

  const [newAllocation, setNewAllocation] = useState({
    allocatedAmount: 0,
    fiscalYear: new Date().getFullYear()
  })

  useEffect(() => {
    loadCategories()
  }, [fiscalYear, selectedTab])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      // Handle the filters correctly based on tab selection
      let filter = '';
      let filterType = 'type'; // Default to filtering by type
      
      if (selectedTab === 'active') {
        filter = 'active';
        filterType = 'status'; // For 'active' tab, we need to filter by status
      } else if (selectedTab === 'expense' || selectedTab === 'income') {
        filter = selectedTab;
      }
      
      // For 'all' tab, don't apply any filter
      const params: any = {};
      if (filter) {
        params[filterType] = filter;
      }
      if (fiscalYear) {
        params.fiscalYear = fiscalYear;
      }

      const response = await axios.get('/budget-categories', { params });
      const categories = response.data.data || [];
      setCategories(categories);
      
      // Use server-calculated totals for better accuracy and performance
      if (response.data.summary) {
        setTotalBudget(response.data.summary.totalAllocated);
        setTotalUsed(response.data.summary.totalUsed);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load categories",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await budgetService.createBudgetCategory(newCategory)
      toast({
        title: "Success",
        description: "Budget category created successfully"
      })
      setIsCategoryDialogOpen(false)
      loadCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive"
      })
    }
  }

  const handleAllocateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "No category selected",
        variant: "destructive"
      })
      return
    }

    try {
      await budgetService.allocateBudget(selectedCategory.id, {
        categoryId: selectedCategory.id,
        allocatedAmount: newAllocation.allocatedAmount,
        fiscalYear
      })
      
      toast({
        title: "Success",
        description: `Budget allocated to ${selectedCategory.name}`
      })
      
      setIsAllocationDialogOpen(false)
      loadCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to allocate budget",
        variant: "destructive"
      })
    }
  }

  const openAllocationDialog = (category: BudgetCategory) => {
    setSelectedCategory(category)
    setNewAllocation({
      allocatedAmount: category.allocatedAmount || 0,
      fiscalYear
    })
    setIsAllocationDialogOpen(true)
  }

  const resetNewCategory = () => {
    setNewCategory({
      name: '',
      code: '',
      description: '',
      type: 'expense'
    })
  }

  const getUtilizationPercentage = (allocated: number, used: number) => {
    if (!allocated || isNaN(allocated) || allocated <= 0) return 0;
    if (!used || isNaN(used)) used = 0;
    return Math.min(100, Math.round((used / allocated) * 100));
  }

  const formatAmount = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'TZS',
      minimumFractionDigits: 2
    }).format(amount);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planning</h1>
          <p className="text-muted-foreground">
            Manage expense categories and allocate budgets
          </p>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Fiscal Year:</span>
            <Select 
              value={fiscalYear.toString()} 
              onValueChange={(value) => setFiscalYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={fiscalYear.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => {
            resetNewCategory()
            setIsCategoryDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Allocated for FY {fiscalYear}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Used Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalUsed)}</div>
            <Progress value={getUtilizationPercentage(totalBudget, totalUsed)} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getUtilizationPercentage(totalBudget, totalUsed)}% utilized
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalBudget - totalUsed)}</div>
            <p className="text-xs text-muted-foreground">
              Remaining from total budget
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="all">All Categories</TabsTrigger>
          </TabsList>
        </div>

        {['active', 'expense', 'income', 'all'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.length === 0 ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">No categories found for the selected filters.</p>
                </div>
              ) : (
                categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <span className="text-lg">{category.name}</span>
                          <Badge className="ml-2" variant={
                            category.type === 'expense' ? 'destructive' :
                            category.type === 'income' ? 'default' :
                            'secondary'
                          }>
                            {category.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          #{category.code}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{category.description || 'No description provided'}</p>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">Budget:</span> 
                            <span>{formatAmount(Number(category.allocatedAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Used:</span> 
                            <span>{formatAmount(Number(category.usedAmount) || 0)}</span>
                          </div>
                          <Progress 
                            value={getUtilizationPercentage(Number(category.allocatedAmount), Number(category.usedAmount))} 
                            className="h-2"
                          />
                          <div className="flex justify-end text-xs text-muted-foreground mt-1">
                            {getUtilizationPercentage(Number(category.allocatedAmount), Number(category.usedAmount))}% utilized
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedCategory(category); setIsDetailsDialogOpen(true); }}
                        >
                          <BarChartHorizontal className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => openAllocationDialog(category)}
                          disabled={Number(category.allocatedAmount) > 0}
                        >
                          <BadgeDollarSign className="mr-2 h-4 w-4" />
                          Allocate
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Category Creation Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Expense/Income Category</DialogTitle>
            <DialogDescription>
              Create a new category type (e.g., Transport, Utilities, Maintenance) for budget allocation
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="categoryName" className="text-right">
                  Category Name
                </label>
                <Input
                  id="categoryName"
                  className="col-span-3"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="categoryCode" className="text-right">
                  Budget Code
                </label>
                <Input
                  id="categoryCode"
                  className="col-span-3"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    code: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="categoryType" className="text-right">
                  Type
                </label>
                <Select
                  value={newCategory.type}
                  onValueChange={(value: 'income' | 'expense' | 'capital') => setNewCategory({
                    ...newCategory,
                    type: value
                  })}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="capital">Capital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="categoryDescription" className="text-right">
                  Description
                </label>
                <Textarea
                  id="categoryDescription"
                  className="col-span-3"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Details Dialog */}
      <BudgetCategoryDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={open => {
          setIsDetailsDialogOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        category={selectedCategory}
        onUpdated={loadCategories}
        onDeleted={() => {
          setIsDetailsDialogOpen(false);
          setSelectedCategory(null);
          loadCategories();
        }}
      />
      {/* Budget Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Allocate Budget</DialogTitle>
            <DialogDescription>
              {selectedCategory && `Allocate budget for ${selectedCategory.name} (${selectedCategory.code})`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateBudget}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="allocatedAmount" className="text-right">
                  Amount
                </label>
                <div className="relative col-span-3">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">TSh</span>
                  <Input
                    id="allocatedAmount"
                    type="number"
                    className="pl-10"
                    value={newAllocation.allocatedAmount}
                    onChange={(e) => setNewAllocation({
                      ...newAllocation,
                      allocatedAmount: parseFloat(e.target.value)
                    })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Allocate Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
