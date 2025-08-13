"use client";

import BeneficiariesTable from "../BeneficiariesTable";

interface BeneficiariesStepProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function BeneficiariesStep({ form, setForm, errors }: BeneficiariesStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Beneficiaries</h2>
      <p className="text-muted-foreground mb-4">
        Add beneficiaries who will receive funds in case of death. Total percentage must equal 100%.
      </p>
      
      <BeneficiariesTable form={form} setForm={setForm} errors={errors} />
    </div>
  );
}
