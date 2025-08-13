"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, RefreshCw, CreditCard, Wallet, BookOpen } from "lucide-react";
import { MemberService, Member } from "@/lib/services/member.service";
import { AccountService, AccountType, DEFAULT_INITIAL_PAYMENTS } from "@/lib/services/account.service";
import { toast } from "@/components/ui/use-toast";

export default function NewMemberAccountPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;
  
  const [member, setMember] = useState<Member | null>(null);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedTab, setSelectedTab] = useState("initial-payment");
  
  // Initial payment form state
  const [initialPayment, setInitialPayment] = useState({
    joiningFee: DEFAULT_INITIAL_PAYMENTS.joiningFee,
    numShares: DEFAULT_INITIAL_PAYMENTS.minShares,
    shareAmount: DEFAULT_INITIAL_PAYMENTS.shareValue * DEFAULT_INITIAL_PAYMENTS.minShares,
    idFee: DEFAULT_INITIAL_PAYMENTS.idFee,
    tshirtFee: DEFAULT_INITIAL_PAYMENTS.tshirtFee,
    joiningFormFee: DEFAULT_INITIAL_PAYMENTS.joiningFormFee,
    passbookFee: DEFAULT_INITIAL_PAYMENTS.passbookFee,
    totalAmount: 0
  });
  
  // Regular account form state
  const [newAccount, setNewAccount] = useState({
    accountTypeId: "",
    initialDeposit: 0
  });

  // Load member data and account types
  useEffect(() => {
    if (!memberId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch member details
        const memberResponse = await MemberService.getById(memberId);
        
        // Handle different response formats
        let memberData = null;
        if (memberResponse && typeof memberResponse === 'object') {
          if ('data' in memberResponse) {
            memberData = memberResponse.data;
          } else if ('id' in memberResponse) {
            memberData = memberResponse;
          }
        }
        
        setMember(memberData);
        
        // Fetch account types
        const accountTypesResponse = await AccountService.getAccountTypes();
        const accountTypesData = accountTypesResponse.data || [];
        setAccountTypes(accountTypesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load member data or account types",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [memberId]);
  
  // Calculate total amount whenever initial payment values change
  useEffect(() => {
    const total = 
      initialPayment.joiningFee + 
      initialPayment.shareAmount + 
      initialPayment.idFee + 
      initialPayment.tshirtFee + 
      initialPayment.joiningFormFee + 
      initialPayment.passbookFee;
    
    setInitialPayment(prev => ({ ...prev, totalAmount: total }));
  }, [
    initialPayment.joiningFee, 
    initialPayment.shareAmount, 
    initialPayment.idFee,
    initialPayment.tshirtFee,
    initialPayment.joiningFormFee,
    initialPayment.passbookFee
  ]);
  
  // Handle share quantity change
  const handleSharesChange = (value: string) => {
    const numShares = parseInt(value) || DEFAULT_INITIAL_PAYMENTS.minShares;
    const limitedShares = Math.min(
      Math.max(numShares, DEFAULT_INITIAL_PAYMENTS.minShares),
      DEFAULT_INITIAL_PAYMENTS.maxShares
    );
    
    const shareAmount = limitedShares * DEFAULT_INITIAL_PAYMENTS.shareValue;
    
    setInitialPayment(prev => ({
      ...prev,
      numShares: limitedShares,
      shareAmount
    }));
  };
  
  // Process initial payment
  const handleInitialPayment = async () => {
    if (!member || !memberId) return;
    
    setProcessingPayment(true);
    
    try {
      const payload = {
        memberId: parseInt(memberId),
        joiningFee: initialPayment.joiningFee,
        shares: initialPayment.shareAmount,
        idFee: initialPayment.idFee,
        tshirtFee: initialPayment.tshirtFee,
        joiningFormFee: initialPayment.joiningFormFee,
        passbookFee: initialPayment.passbookFee,
        totalAmount: initialPayment.totalAmount
      };
      
      // Process the payment through API
      await AccountService.processInitialPayment(parseInt(memberId), payload);
      
      toast({
        title: "Payment Processed",
        description: "Initial payment has been successfully processed",
        variant: "default",
      });
      
      // Redirect back to member details
      router.push(`/dashboard/members/${memberId}`);
      
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing the initial payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Create regular account
  const handleCreateAccount = async () => {
    if (!member || !memberId || !newAccount.accountTypeId) {
      toast({
        title: "Error",
        description: "Please select an account type",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const payload = {
        memberId: parseInt(memberId),
        accountTypeId: parseInt(newAccount.accountTypeId),
        initialDeposit: newAccount.initialDeposit
      };
      
      // Create the account through API
      await AccountService.createMemberAccount(parseInt(memberId), payload);
      
      toast({
        title: "Account Created",
        description: "The account has been successfully created",
        variant: "default",
      });
      
      // Redirect back to member details
      router.push(`/dashboard/members/${memberId}`);
      
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        title: "Account Creation Failed",
        description: "There was an error creating the account",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-4">
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          Member not found or failed to load member data.
        </div>
        <Button className="mt-4" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">New Account for {member.fullName}</h1>
      </div>
      
      <Tabs 
        defaultValue="initial-payment" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="initial-payment">Initial Payment</TabsTrigger>
          <TabsTrigger value="regular-account">Regular Account</TabsTrigger>
        </TabsList>
        
        {/* Initial Payment Tab */}
        <TabsContent value="initial-payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> 
                Initial Membership Payment
              </CardTitle>
              <CardDescription>
                Process the initial membership fees and shares for new member {member.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="bg-muted p-4 rounded-lg mb-5">
                  <p className="text-sm">
                    The minimum requirement for a new member is 1 share (worth {DEFAULT_INITIAL_PAYMENTS.shareValue.toLocaleString()} TSh) 
                    plus the standard joining fees. You can purchase up to {DEFAULT_INITIAL_PAYMENTS.maxShares} shares initially.
                  </p>
                </div>
                
                {/* Joining Fee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="joiningFee">Joining Fee (TSh)</Label>
                    <Input 
                      id="joiningFee" 
                      type="number" 
                      value={initialPayment.joiningFee}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  {/* Number of Shares */}
                  <div className="space-y-2">
                    <Label htmlFor="numShares">Number of Shares</Label>
                    <div className="flex gap-3">
                      <Input 
                        id="numShares" 
                        type="number" 
                        min={DEFAULT_INITIAL_PAYMENTS.minShares}
                        max={DEFAULT_INITIAL_PAYMENTS.maxShares}
                        value={initialPayment.numShares}
                        onChange={(e) => handleSharesChange(e.target.value)}
                      />
                      <Input 
                        id="shareAmount" 
                        type="number" 
                        value={initialPayment.shareAmount}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Each share is worth {DEFAULT_INITIAL_PAYMENTS.shareValue.toLocaleString()} TSh
                    </p>
                  </div>
                </div>
                
                {/* Other Fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idFee">ID Fee (TSh)</Label>
                    <Input 
                      id="idFee" 
                      type="number" 
                      value={initialPayment.idFee}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tshirtFee">T-Shirt Fee (TSh)</Label>
                    <Input 
                      id="tshirtFee" 
                      type="number" 
                      value={initialPayment.tshirtFee}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="joiningFormFee">Joining Form Fee (TSh)</Label>
                    <Input 
                      id="joiningFormFee" 
                      type="number" 
                      value={initialPayment.joiningFormFee}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passbookFee">Passbook Fee (TSh)</Label>
                    <Input 
                      id="passbookFee" 
                      type="number" 
                      value={initialPayment.passbookFee}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
              
              {/* Total */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total Amount:</span>
                  <span className="font-bold text-xl">
                    {initialPayment.totalAmount.toLocaleString()} TSh
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                disabled={processingPayment}
                onClick={handleInitialPayment}
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Regular Account Tab */}
        <TabsContent value="regular-account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Create New Account
              </CardTitle>
              <CardDescription>
                Create a new account for {member.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={newAccount.accountTypeId}
                  onValueChange={(value) => 
                    setNewAccount(prev => ({ ...prev, accountTypeId: value }))
                  }
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((accountType) => (
                      <SelectItem key={accountType.id} value={accountType.id?.toString() || ""}>
                        {accountType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialDeposit">Initial Deposit (TSh)</Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  min="0"
                  value={newAccount.initialDeposit}
                  onChange={(e) => 
                    setNewAccount(prev => ({ 
                      ...prev, 
                      initialDeposit: parseFloat(e.target.value) || 0 
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional - first deposit amount for this account
                </p>
              </div>
              
              {/* Account Type Details if selected */}
              {newAccount.accountTypeId && accountTypes.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  {(() => {
                    const selectedType = accountTypes.find(
                      type => type.id?.toString() === newAccount.accountTypeId
                    );
                    
                    if (!selectedType) return null;
                    
                    return (
                      <div className="space-y-2">
                        <p className="font-medium">{selectedType.name}</p>
                        <p className="text-sm">{selectedType.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Interest Rate:</span>{" "}
                            {selectedType.interestRate}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Minimum Balance:</span>{" "}
                            {selectedType.minimumBalance?.toLocaleString()} TSh
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                disabled={processingPayment || !newAccount.accountTypeId}
                onClick={handleCreateAccount}
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
