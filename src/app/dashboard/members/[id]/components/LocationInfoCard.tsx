import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Member } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface LocationInfoCardProps {
  member: Member;
}

export function LocationInfoCard({ member }: LocationInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Detail label="Region" value={member.region} />
          <Detail label="District" value={member.district} />
          <Detail label="Ward" value={member.ward} />
          <Detail label="Village" value={member.village} />
          <Detail label="Residence" value={member.residence} />
        </div>
      </CardContent>
    </Card>
  );
}
