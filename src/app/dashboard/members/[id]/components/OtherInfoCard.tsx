import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Member } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface OtherInfoCardProps {
  member: Member;
}

export function OtherInfoCard({ member }: OtherInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Detail label="Know How" value={member.knowHow} />
          <Detail label="Know How Detail" value={member.knowHowDetail} />
          <Detail label="Declaration" value={member.declaration ? 'Yes' : 'No'} />
          <Detail label="Created At" value={member.createdAt ? new Date(member.createdAt).toLocaleString() : ''} />
          <Detail label="Updated At" value={member.updatedAt ? new Date(member.updatedAt).toLocaleString() : ''} />
        </div>
      </CardContent>
    </Card>
  );
}
