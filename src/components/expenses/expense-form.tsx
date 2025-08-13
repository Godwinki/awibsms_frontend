"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { departmentService } from "@/lib/services/department.service";
import { budgetService, type BudgetCategory as BudgetCategoryType } from "@/lib/services/budget.service";
import { authService } from "@/lib/services/auth.service";
import { expenseService } from "@/lib/services/expense.service";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  role: string;
}

export function ExpenseForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryType[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    departmentId: "",
    departmentName: "",
    description: "",
    totalAmount: "",
    categoryId: "",
    lineNumber: "",
    hasReceipts: true,
    purpose: "",
    title: "",
    fiscalYear: new Date().getFullYear()
  });

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get current user from auth service
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          
          // Pre-fill the form with user data
          setFormData(prev => ({
            ...prev,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            // We'll set departmentId after fetching departments
            departmentName: user.department
          }));

          // Fetch departments after getting the user
          setIsDepartmentsLoading(true);
          try {
            const departmentsData = await departmentService.getDepartments();
            setDepartments(departmentsData);
            
            // Find the matching department by name
            const userDepartment = departmentsData.find(
              (dept: { name: string; id: string }) => dept.name === user.department
            );
            
            if (userDepartment) {
              setFormData(prev => ({
                ...prev,
                departmentId: userDepartment.id,
                departmentName: userDepartment.name
              }));
            } else {
              // If we couldn't find a matching department, show a message
              console.warn(`Could not find a matching department for "${user.department}"`);
              toast({
                title: "Department not found",
                description: "Your department could not be automatically selected. Please choose it manually.",
                variant: "warning"
              });
            }
          } catch (error) {
            console.error("Error fetching departments:", error);
            toast({
              title: "Error loading departments",
              description: "Please try again or contact support if the issue persists.",
              variant: "destructive"
            });
          } finally {
            setIsDepartmentsLoading(false);
          }
        } else {
          toast({
            title: "Authentication error",
            description: "You must be logged in to create an expense",
            variant: "destructive",
          });
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        toast({
          title: "Error",
          description: "Could not load user information",
          variant: "destructive",
        });
      }
    };

    const fetchBudgetCategories = async () => {
      try {
        // Only fetch expense type categories
        const categoriesData = await budgetService.getBudgetCategories('expense');
        setBudgetCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching budget categories:", error);
      }
    };

    fetchCurrentUser();
    fetchBudgetCategories();
  }, [router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoryId') {
      // Find the selected category
      const selectedCategory = budgetCategories.find(category => category.id === value);
      
      // If category found, auto-fill the line number with the category code
      if (selectedCategory) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          lineNumber: selectedCategory.code
        }));
        return;
      }
    } else if (name === 'departmentId') {
      // When department is changed, update the department name too
      const selectedDepartment = departments.find(dept => dept.id === value);
      if (selectedDepartment) {
        setFormData((prev) => ({
          ...prev,
          departmentId: value,
          departmentName: selectedDepartment.name
        }));
        return;
      }
    }
    
    // Default behavior for other fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create expense item
      const expenseItem = {
        description: formData.description,
        unitPrice: parseFloat(formData.totalAmount) || 0,
        quantity: 1,
        categoryId: formData.categoryId,
        notes: `Line Number: ${formData.lineNumber}`
      };
      
      // Prepare the request data according to backend expectations
      const requestData = {
        title: formData.title || `Expense request for ${formData.description}`,
        description: formData.description,
        purpose: formData.description,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        departmentId: formData.departmentId,
        requiresReceipt: formData.hasReceipts,
        fiscalYear: formData.fiscalYear,
        items: [expenseItem]
      };
      
      console.log('Sending expense request data:', requestData);
      
      // Call the expense service to create the request
      const response = await expenseService.createExpenseRequest(requestData);
      
      console.log('Expense created successfully:', response);

      toast({
        title: "Expense request created",
        description: "Your expense request has been submitted successfully",
      });

      router.push("/dashboard/expenses");
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error",
        description: "Failed to create expense request. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDepartments = async () => {
    setIsDepartmentsLoading(true);
    try {
      const departmentsData = await departmentService.refreshDepartments();
      setDepartments(departmentsData);
      toast({
        title: "Departments refreshed",
        description: "Department list has been updated."
      });
    } catch (error) {
      console.error("Error refreshing departments:", error);
      toast({
        title: "Error",
        description: "Failed to refresh departments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDepartmentsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <p className="text-muted-foreground text-center">Expense Voucher</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                disabled
              />
            </div>

            {/* Pay To Name - Current User */}
            <div className="space-y-2">
              <Label htmlFor="userName">Pay To Name</Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                disabled
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="departmentId">Department</Label>
                {departments.length === 0 && !isDepartmentsLoading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={refreshDepartments}
                    className="h-6 px-2 text-xs"
                  >
                    Refresh
                  </Button>
                )}
              </div>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleSelectChange("departmentId", value)}
                required
                disabled={isDepartmentsLoading || departments.length === 0}
              >
                <SelectTrigger id="departmentId">
                  <SelectValue placeholder={
                    isDepartmentsLoading 
                      ? "Loading departments..." 
                      : departments.length === 0 
                        ? "No departments available" 
                        : "Select department"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept.id}
                      value={dept.id}
                    >
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {departments.length === 0 && !isDepartmentsLoading && (
                <p className="text-xs text-muted-foreground">
                  No departments available. Click refresh to try again.
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Short title for this expense request"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Budget Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Budget Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange("categoryId", value)}
                required
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select budget category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                    >
                      {category.name} ({category.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Line Number (Auto-filled from category code) */}
            <div className="space-y-2">
              <Label htmlFor="lineNumber">Line Number</Label>
              <Input
                id="lineNumber"
                name="lineNumber"
                placeholder="Category code"
                value={formData.lineNumber}
                readOnly
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Amount</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description (serves as both description and purpose) */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description of Expense</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purpose and details of this expense"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Receipt Available */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasReceipts" 
                checked={formData.hasReceipts}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("hasReceipts", checked === true)
                }
              />
              <Label htmlFor="hasReceipts" className="font-normal">
                Receipt/Bill Attached
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between space-x-2">
          <div className="text-sm text-muted-foreground">
            {/* Space for signature fields or additional info */}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard/expenses")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Expense Request"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
} 