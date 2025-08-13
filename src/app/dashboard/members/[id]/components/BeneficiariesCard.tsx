import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Beneficiary } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface BeneficiariesCardProps {
  beneficiaries: Beneficiary[];
}

export function BeneficiariesCard({ beneficiaries }: BeneficiariesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Beneficiaries</CardTitle>
      </CardHeader>
      <CardContent>
        {beneficiaries && beneficiaries.length > 0 ? (
          <div className="space-y-4">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium">Beneficiary {index + 1}</h3>
                  <div className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    {beneficiary.sharePercentage}% Share
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Full Name" value={beneficiary.fullName} />
                  <Detail label="Relationship" value={beneficiary.relationship} />
                  <Detail label="Date of Birth" value={beneficiary.dateOfBirth ? new Date(beneficiary.dateOfBirth).toLocaleDateString() : ''} />
                  <Detail label="Contact Info" value={beneficiary.contactInfo} />
                  <Detail label="Is Minor" value={beneficiary.isMinor ? 'Yes' : 'No'} />
                  {beneficiary.isMinor && (
                    <>
                      <Detail label="Guardian Name" value={beneficiary.guardianName} />
                      <Detail label="Guardian Contact" value={beneficiary.guardianContact} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-md">
            <p className="text-muted-foreground">No beneficiaries added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
