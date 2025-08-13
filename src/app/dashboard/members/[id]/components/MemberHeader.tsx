import React from 'react';
import { Member } from '@/lib/services/member.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StatCard } from './StatCard';
import Link from "next/link";

interface MemberHeaderProps {
  member: Member;
  getAccountTotal: (accountType: string) => string;
  canManageMembers: () => boolean;
  accountsLoading: boolean;
}

export function MemberHeader({ member, getAccountTotal, canManageMembers, accountsLoading }: MemberHeaderProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{member.fullName}</CardTitle>
            <CardDescription className="text-primary-foreground/80 font-mono">
              NIN: {member.nin || <span className='opacity-60'>-</span>}
            </CardDescription>
          </div>
          <div className="mt-3 md:mt-0">
            <div className="text-lg font-semibold">
              <span className="opacity-70">Phone:</span> {member.mobile || <span className='opacity-60'>-</span>}
            </div>
            <div className="text-sm opacity-80">
              Account: {member.accountNumber || <span className='opacity-60'>-</span>}
            </div>
          </div>
        </div>
      </CardHeader>
      
      {/* Account balances summary */}
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard 
            label="Savings" 
            value={`${getAccountTotal('savings')} TZS`} 
            icon="💰" 
            loading={accountsLoading}
          />
          <StatCard 
            label="Shares" 
            value={`${getAccountTotal('shares')} TZS`} 
            icon="📈" 
            loading={accountsLoading}
          />
          <StatCard 
            label="Voluntary Shares" 
            value={`${getAccountTotal('voluntary shares')} TZS`} 
            icon="🤝" 
            loading={accountsLoading}
          />
          <StatCard 
            label="Deposits" 
            value={`${getAccountTotal('deposits')} TZS`} 
            icon="🏦" 
            loading={accountsLoading}
          />
          <StatCard 
            label="Loan Balance" 
            value={`${getAccountTotal('loan')} TZS`} 
            icon="💳" 
            loading={accountsLoading}
          />
        </div>
      </CardContent>
      
      {canManageMembers() && (
        <CardFooter className="bg-muted/40 border-t flex justify-end gap-2 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/members/${member.id}/edit`}>
              Edit Member
            </Link>
          </Button>
          <Button size="sm" variant="default" asChild>
            <Link href={`/dashboard/members/${member.id}/accounts/new`}>
              <PlusCircle className="h-4 w-4 mr-1" />
              New Account
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
