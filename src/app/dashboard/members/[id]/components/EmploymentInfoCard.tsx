import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Member } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface EmploymentInfoCardProps {
  member: Member;
}

export function EmploymentInfoCard({ member }: EmploymentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment & Income Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Detail label="Employment Status" value={member.employmentStatus} />
          <Detail label="Employer Name" value={member.employerName} />
          <Detail label="Income Bracket" value={member.incomeBracket} />
          <Detail label="Income Source" value={member.incomeSource} />
          <Detail label="Business Type" value={member.businessType} />
          <Detail label="Partners" value={member.partners} />
          <Detail label="Owners" value={member.owners} />
          <Detail label="Other Saccos" value={member.otherSaccos} />
        </div>
      </CardContent>
    </Card>
  );
}
