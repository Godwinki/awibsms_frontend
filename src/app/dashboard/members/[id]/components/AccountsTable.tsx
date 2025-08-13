import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MemberAccount } from '@/lib/services/member.service';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AccountsTableProps {
  memberId: string;
  accounts: MemberAccount[];
  accountsLoading: boolean;
  canManageMembers: () => boolean;
}

export function AccountsTable({ memberId, accounts, accountsLoading, canManageMembers }: AccountsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {accountsLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-4">No accounts found for this member</p>
            {canManageMembers() && (
              <Button asChild>
                <Link href={`/dashboard/members/${memberId}/accounts/new`}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Account
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.accountType?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {typeof account.balance === 'number' 
                        ? account.balance.toFixed(2) 
                        : (parseFloat(account.balance + '') || 0).toFixed(2)} TZS
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : account.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : account.status === 'suspended'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status || 'unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/members/${memberId}/accounts/${account.id}`}>
                          View Account
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {canManageMembers() && (
              <div className="mt-6 flex justify-end">
                <Button size="sm" asChild>
                  <Link href={`/dashboard/members/${memberId}/accounts/new`}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
