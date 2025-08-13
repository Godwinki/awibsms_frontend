"use client";

import EmergencyContactsTable from "../EmergencyContactsTable";

interface EmergencyContactsStepProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function EmergencyContactsStep({ form, setForm, errors }: EmergencyContactsStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
      <p className="text-muted-foreground mb-4">
        Add contacts who can be reached in case of emergency. At least one contact is required.
      </p>
      
      <EmergencyContactsTable form={form} setForm={setForm} errors={errors} />
    </div>
  );
}
