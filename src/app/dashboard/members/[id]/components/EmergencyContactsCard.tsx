import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmergencyContact } from '@/lib/services/member.service';
import { Detail } from './Detail';

interface EmergencyContactsCardProps {
  emergencyContacts: EmergencyContact[];
}

export function EmergencyContactsCard({ emergencyContacts }: EmergencyContactsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        {emergencyContacts && emergencyContacts.length > 0 ? (
          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Emergency Contact {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Full Name" value={contact.fullName} />
                  <Detail label="Relationship" value={contact.relationship} />
                  <Detail label="Primary Phone" value={contact.primaryPhone} />
                  <Detail label="Alternative Phone" value={contact.alternativePhone} />
                  <Detail label="Email" value={contact.email} />
                  <Detail label="Address" value={contact.address} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-md">
            <p className="text-muted-foreground">No emergency contacts added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
