import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Member } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface PersonalInfoCardProps {
  member: Member;
}

export function PersonalInfoCard({ member }: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Detail label="ID Number" value={member.idNo} />
          <Detail label="Email" value={member.email} />
          <Detail label="Date of Birth" value={member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : ''} />
          <Detail label="Place of Birth" value={member.placeOfBirth} />
          <Detail label="Nationality" value={member.nationality} />
          <Detail label="Marital Status" value={member.maritalStatus} />
          <Detail label="Phone" value={member.mobile} />
          <Detail label="PO Box" value={member.pobox} />
          <Detail label="TIN" value={member.tin} />
        </div>
      </CardContent>
    </Card>
  );
}
