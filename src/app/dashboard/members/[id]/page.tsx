"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Member, Beneficiary, EmergencyContact } from "@/lib/services/member.service";
import { MemberService } from "@/lib/services/member.service";

// Define missing interfaces locally since they aren't exported from member.service
interface Document {
  id: number;
  memberId: number;
  documentType: string;
  filePath: string;
  status: string;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AccountType {
  id: number;
  name: string;
  description: string;
  minBalance: number;
  interestRate: number;
  createdAt: string;
  updatedAt: string;
}

interface MemberAccount {
  id: number;
  memberId: number;
  accountTypeId: number;
  balance: number | string;
  status: string;
  createdAt: string;
  updatedAt: string;
  accountType?: AccountType;
}
import { authService } from "@/lib/services/auth.service";
import Link from "next/link";
import { 
  ArrowLeft as ArrowLeftIcon, 
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import all the component cards
import {
  MemberHeader,
  PersonalInfoCard,
  LocationInfoCard,
  EmploymentInfoCard,
  OtherInfoCard,
  BeneficiariesCard,
  EmergencyContactsCard,
  BusinessDetailsCard,
  AccountsTable,
  DocumentsTable
} from "./components";

export default function MemberDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [accounts, setAccounts] = useState<MemberAccount[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Check if user can manage members (admin or manager)
  const canManageMembers = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'manager';
  };

  useEffect(() => {
    // Get current user from auth service
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (!memberId) return;
    
    // Fetch member details
    setLoading(true);
    console.log('Fetching member with ID:', memberId);
    
    MemberService.getById(memberId)
      .then((res: any) => { // Use 'any' type here to handle different response structures
        console.log('Raw Member API Response:', res);
        
        // Handle potential different response structures
        let memberData = null;
        
        // First check if the response is directly usable
        if (res && typeof res === 'object') {
          // Check for nested data property (typical Axios response)
          if ('data' in res) {
            console.log('Found data property in response');
            memberData = res.data;
            
            // If data contains a nested member object
            if (memberData && typeof memberData === 'object' && 'member' in memberData) {
              console.log('Found nested member in data');
              memberData = (memberData as { member: any }).member;
            }
          } 
          // Check for a member property
          else if ('member' in res) {
            console.log('Found member property in response');
            memberData = (res as { member: any }).member;
          }
          // Maybe it's directly the member data
          else {
            console.log('Using response directly as member data');
            memberData = res;
          }
        }
        
        if (!memberData) {
          throw new Error('Could not parse member data from response');
        }
        
        console.log('Parsed member data:', memberData);
        setMember(memberData);
      })
      .catch(err => {
        console.error('Error fetching member:', err);
        setError('Failed to load member details. Please try again.');
      })
      .finally(() => setLoading(false));
    
    // Fetch accounts for this member
    setAccountsLoading(true);
    const accountsUrl = `/api/members/${memberId}/accounts`;
    console.log('Fetching accounts from:', accountsUrl);
    
    fetch(accountsUrl, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch accounts');
        return res.json();
      })
      .then(data => {
        console.log('Accounts API Response:', data);
        // Handle different response structures
        let accountsData: MemberAccount[] = [];
        if (Array.isArray(data)) {
          accountsData = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.accounts)) {
            accountsData = data.accounts;
          } else if (Array.isArray(data.data)) {
            accountsData = data.data;
          }
        }
        console.log('Parsed accounts data:', accountsData);
        setAccounts(accountsData);
      })
      .catch(err => {
        console.error('Error fetching accounts:', err);
        // Don't set error state as it might not be critical
      })
      .finally(() => setAccountsLoading(false));
    
    // Fetch documents for this member
    setDocumentsLoading(true);
    const documentsUrl = `/api/members/${memberId}/documents`;
    console.log('Fetching documents from:', documentsUrl);
    
    fetch(documentsUrl, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then(data => {
        console.log('Documents API Response:', data);
        // Handle different response structures
        let documentsData: Document[] = [];
        if (Array.isArray(data)) {
          documentsData = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.documents)) {
            documentsData = data.documents;
          } else if (Array.isArray(data.data)) {
            documentsData = data.data;
          }
        }
        setDocuments(documentsData);
      })
      .catch(err => {
        console.error('Error fetching documents:', err);
        // Don't show error for documents as it might not be critical
      })
      .finally(() => setDocumentsLoading(false));
  }, [memberId]);

  // Calculate account totals for stats
  const getAccountTotal = (accountType: string) => {
    if (!accounts || !Array.isArray(accounts)) return '0.00';
    const account = accounts.find(acc => acc?.accountType?.name?.toLowerCase() === accountType.toLowerCase());
    
    if (!account) return '0.00';
    
    // Make sure balance is a valid number before using toFixed
    const balance = account.balance;
    if (balance === null || balance === undefined) return '0.00';
    
    // Convert to number if it's a string or ensure it's a number
    const numericBalance = typeof balance === 'string' ? parseFloat(balance) : Number(balance);
    
    // Check if it's a valid number
    return !isNaN(numericBalance) ? numericBalance.toFixed(2) : '0.00';
  };

  return (
    <div className="container mx-auto py-8 px-2 md:px-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} title="Back" className="mr-2">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Member Details</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-destructive bg-destructive/15 p-4 rounded-lg">{error}</div>
      ) : member ? (
        <>
          {/* Member header with account summary */}
          <MemberHeader 
            member={member} 
            getAccountTotal={getAccountTotal} 
            canManageMembers={canManageMembers} 
            accountsLoading={accountsLoading} 
          />

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Member Details</TabsTrigger>
              <TabsTrigger value="accounts">Accounts & Transactions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Member Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <PersonalInfoCard member={member} />
              <LocationInfoCard member={member} />
              <EmploymentInfoCard member={member} />
              <OtherInfoCard member={member} />
              
              {/* Beneficiaries Section */}
              <BeneficiariesCard beneficiaries={member.beneficiaries || []} />
              
              {/* Emergency Contacts Section */}
              <EmergencyContactsCard emergencyContacts={member.emergencyContacts || []} />
              
              {/* Business Details Section */}
              <BusinessDetailsCard member={member} />
            </TabsContent>
            
            {/* Accounts & Transactions Tab */}
            <TabsContent value="accounts">
              <AccountsTable 
                memberId={memberId} 
                accounts={accounts} 
                accountsLoading={accountsLoading} 
                canManageMembers={canManageMembers} 
              />
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentsTable 
                documents={documents} 
                documentsLoading={documentsLoading} 
                canManageMembers={canManageMembers} 
              />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>Member not found</p>
        </div>
      )}
    </div>
  );
}