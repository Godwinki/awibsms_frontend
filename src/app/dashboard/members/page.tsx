"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCwIcon, SearchIcon, FilterIcon, Settings, Eye, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberService, Member } from '@/lib/services/member.service';
import { authService } from '@/lib/services/auth.service';
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Check if user can manage members (admin or manager)
  const canManageMembers = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'manager';
  };

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MemberService.getAll();
      // Handle different possible response structures
      let membersData: Member[] = [];
      
      if (Array.isArray(res)) {
        // If response is directly an array
        membersData = res;
      } else if (res && typeof res === 'object') {
        // Check if response has data property that's an array
        if (Array.isArray(res.data)) {
          membersData = res.data;
        } else if (res.data && typeof res.data === 'object') {
          // If res.data is an object with members property
          if (Array.isArray(res.data.members)) {
            membersData = res.data.members;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            // Nested data object
            membersData = res.data.data;
          }
        }
      }
      
      // Set empty array if we couldn't extract any data
      if (!Array.isArray(membersData)) {
        console.warn('Could not extract members data from response, using empty array');
        membersData = [];
      }
      
      // Log what we're working with to debug
      console.log('Extracted members data:', membersData.length, 'members');
      
      setMembers(membersData);
      setTotalPages(Math.max(1, Math.ceil(membersData.length / itemsPerPage)));
      setRefreshing(false);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      // Provide more specific error message based on the error
      let errorMessage = 'Failed to load members. Please try refreshing the page.';
      
      if (error.response) {
        // The request was made and the server responded with a status code outside the 2xx range
        if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'You do not have permission to view members. Please log in again.';
        } else if (error.response.status === 404) {
          errorMessage = 'Could not find members data. The API endpoint may have changed.';
        }
        
        console.error('API Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      // Set empty array if there was an error
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Get current user from auth service
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    fetchMembers();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const filteredMembers = members && Array.isArray(members) 
    ? members.filter(m => {
        if (!search) return true;
        
        const q = search.toLowerCase();
        return (
          (m.fullName?.toLowerCase() || '').includes(q) ||
          (m.mobile?.toLowerCase() || '').includes(q) ||
          (m.nin?.toLowerCase() || '').includes(q) ||
          (m.district?.toLowerCase() || '').includes(q) ||
          (m.email?.toLowerCase() || '').includes(q) ||
          (m.accountNumber?.toLowerCase() || '').includes(q)
        );
      })
    : [];
  
  // Get paginated data
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate pagination items
  const generatePaginationItems = () => {
    let items = [];
    
    // Always show first page, last page, current page, and pages adjacent to current page
    const rangeStart = Math.max(1, currentPage - 1);
    const rangeEnd = Math.min(totalPages, currentPage + 1);
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= rangeStart && i <= rangeEnd)) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === rangeStart - 1 || i === rangeEnd + 1) {
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    return items;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Member Management</h1>
          <p className="text-muted-foreground">Manage SACCO members and their details</p>
        </div>
        <Button asChild className="mt-4 md:mt-0" size="sm">
          <Link href="/dashboard/members/register">
            <UserPlus className="h-4 w-4 mr-2" />
            Register New Member
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-background rounded-lg px-3 py-2 border">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent focus:ring-0 focus:border-0"
            placeholder="Search members by name, phone, NIN, district, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
          <RefreshCwIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>NIN</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCwIcon className="w-10 h-10 animate-spin text-primary mb-2" />
                    <span>Loading members...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search ? 'No members match your search criteria' : 'No members found in the system'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell>{member.mobile || '-'}</TableCell>
                  <TableCell>{member.nin}</TableCell>
                  <TableCell>{member.district || '-'}</TableCell>
                  <TableCell>{member.accountNumber || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="View Details">
                        <Link href={`/dashboard/members/${member.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      
                      {canManageMembers() && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/members/${member.id}/edit`}>
                                Edit Member
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/members/${member.id}/accounts`}>
                                Manage Accounts
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/members/${member.id}/documents`}>
                                Manage Documents
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredMembers.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {generatePaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center text-sm text-muted-foreground mt-2">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
          </div>
        </div>
      )}
    </div>
  );
}
