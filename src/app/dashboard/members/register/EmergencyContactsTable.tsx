import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, AlertCircle } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { validatePhone } from "@/lib/validations/memberValidation";
import { useState } from "react";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

interface EmergencyContactsTableProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function EmergencyContactsTable({ form, setForm, errors = {} }: EmergencyContactsTableProps) {
  const emergencyContacts = form.emergencyContacts || [];
  const [phoneError, setPhoneError] = useState<string>("");

  const validateEmergencyPhone = (phone: string): boolean => {
    // Check if phone number is the member's own phone
    if (phone && phone === form.mobile) {
      setPhoneError("Emergency contact cannot have the same phone number as the member");
      return false;
    }
    
    // Clear error if validation passes
    setPhoneError("");
    return true;
  };
  
  const validateEmergencyName = (name: string): boolean => {
    // Check if name is the same as the member's name
    return !(name && name.trim().toLowerCase() === form.fullName.trim().toLowerCase());
  };

  const handleChange = (idx: number, field: string, value: string) => {
    // Create updated contacts array
    const updated = emergencyContacts.map((e: any, i: number) =>
      i === idx ? { ...e, [field]: value } : e
    );
    
    // Additional validation for phone number
    if (field === 'phone') {
      validateEmergencyPhone(value);
    }
    
    // Update the form
    setForm((f: any) => ({ ...f, emergencyContacts: updated }));
  };

  const addRow = () => {
    setForm((f: any) => ({ 
      ...f, 
      emergencyContacts: [...emergencyContacts, { 
        name: '', 
        relationship: '', 
        phone: '', 
        address: '' 
      }] 
    }));
  };

  const removeRow = (idx: number) => {
    setForm((f: any) => ({ ...f, emergencyContacts: emergencyContacts.filter((_: any, i: number) => i !== idx) }));
  };

  return (
    <div>
      {errors.emergencyContacts && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{errors.emergencyContacts}</p>
        </div>
      )}

      {/* Display phone error if the same as member's phone */}
      {phoneError && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{phoneError}</p>
        </div>
      )}

      {emergencyContacts.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
          <p className="mb-2">No emergency contacts added yet</p>
          <p className="text-sm">Add at least one emergency contact who can be reached in case of emergency</p>
        </div>
      )}
      
      <div className="flex flex-col gap-6 mt-4">
        {emergencyContacts.map((e: any, idx: number) => (
          <div key={idx} className="bg-card border rounded-xl p-5 relative shadow-sm">
            <button 
              type="button" 
              onClick={() => removeRow(idx)} 
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove emergency contact"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            
            <h4 className="font-semibold text-primary mb-3">Emergency Contact {idx + 1}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`emergency-${idx}-name`} className="block text-sm font-medium mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`emergency-${idx}-name`}
                  value={e.name}
                  onChange={e => handleChange(idx, 'name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors[`emergencyContacts_${idx}_name`] || (e.name && e.name === form.fullName) ? "border-destructive" : ""}
                />
                {errors[`emergencyContacts_${idx}_name`] && (
                  <FormError message={errors[`emergencyContacts_${idx}_name`]} className="mt-1" />
                )}
                {e.name && e.name === form.fullName && (
                  <FormError message="Emergency contact cannot have the same name as the member" className="mt-1" />
                )}
              </div>
              <div>
                <label htmlFor={`emergency-${idx}-relationship`} className="block text-sm font-medium mb-1">
                  Relationship <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`emergency-${idx}-relationship`}
                  value={e.relationship}
                  onChange={e => handleChange(idx, 'relationship', e.target.value)}
                  placeholder="E.g. Spouse, Child, Parent"
                  className={errors[`emergencyContacts_${idx}_relationship`] ? "border-destructive" : ""}
                />
                {errors[`emergencyContacts_${idx}_relationship`] && (
                  <FormError message={errors[`emergencyContacts_${idx}_relationship`]} className="mt-1" />
                )}
              </div>
              <div>
                <label htmlFor={`emergency-${idx}-phone`} className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`emergency-${idx}-phone`}
                  value={e.phone}
                  onChange={e => handleChange(idx, 'phone', e.target.value)}
                  placeholder="+255XXXXXXXX or 0XXXXXXXX"
                  className={errors[`emergencyContacts_${idx}_phone`] || e.phone === form.mobile ? "border-destructive" : ""}
                />
                {errors[`emergencyContacts_${idx}_phone`] && (
                  <FormError message={errors[`emergencyContacts_${idx}_phone`]} className="mt-1" />
                )}
                {e.phone === form.mobile && (
                  <FormError message="Emergency contact cannot have the same phone number as the member" className="mt-1" />
                )}
              </div>
              <div>
                <label htmlFor={`emergency-${idx}-address`} className="block text-sm font-medium mb-1">
                  Physical Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`emergency-${idx}-address`}
                  value={e.address}
                  onChange={e => handleChange(idx, 'address', e.target.value)}
                  placeholder="Enter physical address"
                  className={errors[`emergencyContacts_${idx}_address`] ? "border-destructive" : ""}
                />
                {errors[`emergencyContacts_${idx}_address`] && (
                  <FormError message={errors[`emergencyContacts_${idx}_address`]} className="mt-1" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button 
          type="button" 
          onClick={addRow} 
          variant="outline" 
          className="gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Emergency Contact
        </Button>
      </div>
    </div>
  );
}
