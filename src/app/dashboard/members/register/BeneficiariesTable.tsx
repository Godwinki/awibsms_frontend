import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, AlertCircle } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { useState, useEffect } from "react";
import { validatePercentages } from "@/lib/validations/memberValidation";

interface Beneficiary {
  name: string;
  relationship: string;
  phone: string;
  percentage: string;
}

interface BeneficiariesTableProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function BeneficiariesTable({ form, setForm, errors = {} }: BeneficiariesTableProps) {
  const beneficiaries = form.beneficiaries || [];
  const [totalPercent, setTotalPercent] = useState(0);

  // Calculate total percentage whenever beneficiaries change
  useEffect(() => {
    const total = beneficiaries.reduce((sum: number, b: Beneficiary) => {
      const percentage = parseFloat(b.percentage || "0");
      return isNaN(percentage) ? sum : sum + percentage;
    }, 0);
    
    setTotalPercent(total);
    
    // Check if we need to update the parent form with the new total
    if (form.totalBeneficiaryPercentage !== total) {
      setForm((f: any) => ({ ...f, totalBeneficiaryPercentage: total }));
    }
  }, [beneficiaries, form.totalBeneficiaryPercentage, setForm]);

  const handleChange = (idx: number, field: string, value: string) => {
    // Create updated beneficiaries array
    const updated = beneficiaries.map((b: any, i: number) =>
      i === idx ? { ...b, [field]: value } : b
    );
    
    // Update the form
    setForm((f: any) => ({ ...f, beneficiaries: updated }));
    
    // If this is a percentage change, recalculate the total immediately for better user feedback
    if (field === 'percentage') {
      const newTotal = updated.reduce((sum: number, b: Beneficiary) => {
        const percent = parseFloat(b.percentage || "0");
        return isNaN(percent) ? sum : sum + percent;
      }, 0);
      setTotalPercent(newTotal);
    }
  };

  const addRow = () => {
    setForm((f: any) => ({ ...f, beneficiaries: [...beneficiaries, { name: '', relationship: '', phone: '', percentage: '' }] }));
  };

  const removeRow = (idx: number) => {
    setForm((f: any) => ({ ...f, beneficiaries: beneficiaries.filter((_: any, i: number) => i !== idx) }));
  };

  // Check if total percentage is valid
  const percentValidation = validatePercentages(beneficiaries);

  return (
    <div>
      {/* Total percentage display */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Total allocation: {totalPercent}%</h3>
        <div className={`text-sm font-medium ${totalPercent === 100 ? 'text-green-600' : 'text-amber-600'}`}>
          {totalPercent === 100 ? 
            '✓ Correctly allocated' : 
            `${totalPercent < 100 ? `${100 - totalPercent}% remaining` : `${totalPercent - 100}% over-allocated`}`
          }
        </div>
      </div>
      
      {errors.beneficiaries && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{errors.beneficiaries}</p>
        </div>
      )}

      {beneficiaries.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
          <p className="mb-2">No beneficiaries added yet</p>
          <p className="text-sm">Add beneficiaries who will receive funds in case of death</p>
        </div>
      )}
      
      <div className="flex flex-col gap-6 mt-4">
        {beneficiaries.map((b: any, idx: number) => (
          <div key={idx} className="bg-card border rounded-xl p-5 relative shadow-sm">
            <button 
              type="button" 
              onClick={() => removeRow(idx)} 
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove beneficiary"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            
            <h4 className="font-semibold text-primary mb-3">Beneficiary {idx + 1}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`beneficiary-${idx}-name`} className="block text-sm font-medium mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`beneficiary-${idx}-name`}
                  value={b.name}
                  onChange={e => handleChange(idx, 'name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors[`beneficiary_${idx}_name`] ? "border-destructive" : ""}
                />
                {errors[`beneficiary_${idx}_name`] && (
                  <FormError message={errors[`beneficiary_${idx}_name`]} className="mt-1" />
                )}
              </div>
              <div>
                <label htmlFor={`beneficiary-${idx}-relationship`} className="block text-sm font-medium mb-1">
                  Relationship <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`beneficiary-${idx}-relationship`}
                  value={b.relationship}
                  onChange={e => handleChange(idx, 'relationship', e.target.value)}
                  placeholder="E.g. Spouse, Child, Parent"
                  className={errors[`beneficiary_${idx}_relationship`] ? "border-destructive" : ""}
                />
                {errors[`beneficiary_${idx}_relationship`] && (
                  <FormError message={errors[`beneficiary_${idx}_relationship`]} className="mt-1" />
                )}
              </div>
              <div>
                <label htmlFor={`beneficiary-${idx}-percentage`} className="block text-sm font-medium mb-1">
                  Percentage (%) <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`beneficiary-${idx}-percentage`}
                  type="number"
                  min="1"
                  max="100"
                  value={b.percentage}
                  onChange={e => handleChange(idx, 'percentage', e.target.value)}
                  placeholder="Enter allocation percentage"
                  className={errors[`beneficiaries_${idx}_percentage`] ? "border-destructive" : ""}
                />
                {errors[`beneficiaries_${idx}_percentage`] && (
                  <FormError message={errors[`beneficiaries_${idx}_percentage`]} className="mt-1" />
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Enter a percentage between 1-100%. Total for all beneficiaries must equal 100%.
                </div>
              </div>
              <div>
                <label htmlFor={`beneficiary-${idx}-phone`} className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`beneficiary-${idx}-phone`}
                  value={b.phone}
                  onChange={e => handleChange(idx, 'phone', e.target.value)}
                  placeholder="+255XXXXXXXX or 0XXXXXXXX"
                  className={errors[`beneficiaries_${idx}_phone`] ? "border-destructive" : ""}
                />
                {errors[`beneficiaries_${idx}_phone`] && (
                  <FormError message={errors[`beneficiaries_${idx}_phone`]} className="mt-1" />
                )}
              </div>
              {/* No additional fields needed */}
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="mt-5 flex items-center gap-2 w-full md:w-auto" onClick={addRow}>
        <PlusIcon className="w-4 h-4" /> Add Beneficiary
      </Button>
    </div>
  );
}
