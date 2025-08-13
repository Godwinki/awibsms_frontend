import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Member } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface BusinessDetailsCardProps {
  member: Member;
}

export function BusinessDetailsCard({ member }: BusinessDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Detail label="Business Name" value={member.businessName} />
          <Detail label="Business Type" value={member.businessType} />
          <Detail label="Business Location" value={member.businessLocation} />
          <Detail label="Registration Number" value={member.businessRegistrationNumber} />
          <Detail label="Start Date" value={member.businessStartDate ? new Date(member.businessStartDate).toLocaleDateString() : ''} />
          <Detail label="Monthly Income" value={member.estimatedMonthlyIncome} />
        </div>
        {member.businessDescription && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Business Description</h4>
            <p className="text-sm">{member.businessDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
