"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { MemberService } from "@/lib/services/member.service";
import { toast } from "@/components/ui/use-toast";

// Define the FormState interface to match the form state in page.tsx
interface FormState {
  fullName: string;
  idType: string;
  idNo: string;
  nin: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  maritalStatus: string;
  spouseName: string;
  mobile: string;
  email: string;
  altPhone: string;
  residence: string;
  district: string;
  country: string;
  postalAddress: string;
  dependents: string;
  validationErrors?: Record<string, string>; // Custom validation errors
  [key: string]: any; // This allows for other properties we may not explicitly define
}

interface PersonalInfoStepProps {
  form: FormState;
  setForm: (value: React.SetStateAction<FormState>) => void;
  errors: Record<string, string>;
}

export default function PersonalInfoStep({ form, setForm, errors = {} }: PersonalInfoStepProps) {
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);

  // Fetch next account number when component mounts if no accountNumber exists
  useEffect(() => {
    if (!form.accountNumber) {
      fetchNextAccountNumber();
    }
  }, []);

  // Function to fetch the next available account number
  const fetchNextAccountNumber = async () => {
    setIsLoadingNumber(true);
    try {
      const response = await MemberService.getNextAccountNumber();
      if (response.data && response.data.accountNumber) {
        setForm(prev => ({ ...prev, accountNumber: response.data.accountNumber }));
      }
    } catch (error) {
      console.error('Error fetching next account number:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch next account number. You can enter it manually."
      });
    } finally {
      setIsLoadingNumber(false);
    }
  };

  // Handle ID Type change
  const handleIdTypeChange = (value: string) => {
    setForm((f: FormState) => {
      // If changing to NIN, use existing NIN value if available
      if (value === 'nin') {
        return { ...f, idType: value, idNo: f.nin || '' };
      }
      // Otherwise clear the ID number when changing types
      return { ...f, idType: value, idNo: '' };
    });
  };

  // Validate NIN against birth date
  const validateNin = (nin: string, dateOfBirth: string): { isValid: boolean; errorMessage: string } => {
    // Check if NIN is exactly 20 digits
    if (nin.length !== 20) {
      return { isValid: false, errorMessage: "NIN must be exactly 20 digits" };
    }
    
    // Check if NIN consists of only digits
    if (!/^\d+$/.test(nin)) {
      return { isValid: false, errorMessage: "NIN must contain only digits" };
    }
    
    // If we don't have a date of birth yet, we can't validate the first part
    if (!dateOfBirth) {
      return { isValid: true, errorMessage: "" };
    }
    
    // Extract date parts from the birth date
    const birthDate = new Date(dateOfBirth);
    const year = birthDate.getFullYear().toString();
    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const day = birthDate.getDate().toString().padStart(2, '0');
    
    // Expected format in NIN: YYYYMMDD
    const expectedDatePart = `${year}${month}${day}`;
    const ninDatePart = nin.substring(0, 8);
    
    if (ninDatePart !== expectedDatePart) {
      return { 
        isValid: false, 
        errorMessage: `First 8 digits of NIN should match your birth date (${expectedDatePart})` 
      };
    }
    
    return { isValid: true, errorMessage: "" };
  };

  // Handle standard input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f: FormState) => ({ ...f, [name]: value }));

    // Special case for NIN - update both fields to keep them in sync and validate
    if (name === 'idNo' && (form.idType === 'nin' || !form.idType)) {
      setForm((prev: FormState) => ({ ...prev, nin: value }));
      
      // Validate NIN if it has content
      if (value) {
        const validation = validateNin(value, form.dateOfBirth);
        if (!validation.isValid) {
          setForm((prev: FormState) => ({ 
            ...prev, 
            validationErrors: { ...prev.validationErrors, idNo: validation.errorMessage } 
          }));
        } else {
          // Clear the error if valid
          setForm((prev: FormState) => {
            const newErrors = { ...prev.validationErrors };
            delete newErrors.idNo;
            return { ...prev, validationErrors: newErrors };
          });
        }
      }
    }
    
    // If date of birth changes, revalidate NIN
    if (name === 'dateOfBirth' && form.idNo && (form.idType === 'nin' || !form.idType)) {
      const validation = validateNin(form.idNo, value);
      if (!validation.isValid) {
        setForm((prev: FormState) => ({ 
          ...prev, 
          validationErrors: { ...prev.validationErrors, idNo: validation.errorMessage } 
        }));
      } else {
        // Clear the error if valid
        setForm((prev: FormState) => {
          const newErrors = { ...prev.validationErrors };
          delete newErrors.idNo;
          return { ...prev, validationErrors: newErrors };
        });
      }
    }
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setForm((f: FormState) => ({ ...f, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="col-span-1 md:col-span-2 text-xl font-semibold mb-2">Personal Information</h2>
      <p className="col-span-1 md:col-span-2 text-muted-foreground mb-4">
        Enter your personal details as they appear on your official identification documents.
      </p>
      
      {/* Account Number */}
      <div className="col-span-1 md:col-span-2">
        <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
          Member Account Number <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="accountNumber"
            name="accountNumber"
            value={form.accountNumber || ''}
            onChange={handleChange}
            placeholder="Member account number"
            className={errors.accountNumber ? "border-destructive flex-1" : "flex-1"}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={fetchNextAccountNumber} 
            disabled={isLoadingNumber}
            title="Generate next available number"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoadingNumber ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {errors.accountNumber && <FormError message={errors.accountNumber} />}
        <p className="text-xs text-muted-foreground mt-1">
          This is the member's unique identifier. The system has automatically suggested the next available number.
        </p>
      </div>
      
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Full Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name as it appears on ID"
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <FormError message={errors.fullName} />}
      </div>
      
      {/* ID Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          ID Type <span className="text-destructive">*</span>
        </label>
        
        <div className="flex gap-4 mt-1">
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="idType" 
              checked={form.idType === 'nin' || !form.idType} 
              onChange={() => handleIdTypeChange('nin')}
            />
            NIN
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="idType" 
              checked={form.idType === 'passport'} 
              onChange={() => handleIdTypeChange('passport')}
            />
            Passport
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="idType" 
              checked={form.idType === 'voter'} 
              onChange={() => handleIdTypeChange('voter')}
            />
            Voter's ID
          </label>
        </div>
        {errors.idType && <FormError message={errors.idType} />}
      </div>
      
      {/* ID Number */}
      <div>
        <label htmlFor="idNo" className="block text-sm font-medium mb-1">
          {form.idType === 'passport' ? 'Passport Number' : 
           form.idType === 'voter' ? 'Voter ID Number' : 
           'National ID Number (NIN)'} <span className="text-destructive">*</span>
        </label>
        <Input 
          id="idNo"
          name="idNo"
          value={form.idNo} 
          onChange={handleChange}
          placeholder={
            form.idType === 'passport' ? 'Enter passport number' :
            form.idType === 'voter' ? 'Enter voter ID number' :
            'Enter your 20-digit NIN (starts with your birth date YYYYMMDD)'
          }
          className={errors.idNo || form.validationErrors?.idNo ? "border-destructive" : ""}
        />
        {errors.idNo && <FormError message={errors.idNo} />}
        {!errors.idNo && form.validationErrors?.idNo && <FormError message={form.validationErrors.idNo} />}
        {(form.idType === 'nin' || !form.idType) && 
          <p className="text-xs text-muted-foreground mt-1">
            NIN must be 20 digits and start with your birthdate in YYYYMMDD format (e.g., 20010613... for June 13, 2001)
          </p>
        }
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Gender <span className="text-destructive">*</span>
        </label>
        
        <div className="flex gap-4 mt-1">
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="gender" 
              checked={form.gender === 'male'} 
              onChange={() => handleSelectChange('gender', 'male')}
            />
            Male
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="gender" 
              checked={form.gender === 'female'} 
              onChange={() => handleSelectChange('gender', 'female')}
            />
            Female
          </label>
        </div>
        {errors.gender && <FormError message={errors.gender} />}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
          Date of Birth <span className="text-destructive">*</span>
        </label>
        <Input 
          id="dateOfBirth"
          name="dateOfBirth"
          type="date" 
          value={form.dateOfBirth} 
          onChange={handleChange}
          className={errors.dateOfBirth ? "border-destructive" : ""}
        />
        {errors.dateOfBirth && <FormError message={errors.dateOfBirth} />}
      </div>

      {/* Place of Birth */}
      <div>
        <label htmlFor="placeOfBirth" className="block text-sm font-medium mb-1">
          Place of Birth
        </label>
        <Input 
          id="placeOfBirth"
          name="placeOfBirth"
          value={form.placeOfBirth} 
          onChange={handleChange}
          placeholder="City, Country"
        />
      </div>

      {/* Nationality */}
      <div>
        <label htmlFor="nationality" className="block text-sm font-medium mb-1">
          Nationality <span className="text-destructive">*</span>
        </label>
        <Input 
          id="nationality"
          name="nationality"
          value={form.nationality} 
          onChange={handleChange}
          placeholder="Your nationality"
          className={errors.nationality ? "border-destructive" : ""}
        />
        {errors.nationality && <FormError message={errors.nationality} />}
      </div>

      {/* Marital Status */}
      <div>
        <label htmlFor="maritalStatus" className="block text-sm font-medium mb-1">
          Marital Status <span className="text-destructive">*</span>
        </label>
        <Select
          value={form.maritalStatus}
          onValueChange={(value) => handleSelectChange('maritalStatus', value)}
        >
          <SelectTrigger id="maritalStatus" className={errors.maritalStatus ? "border-destructive" : ""}>
            <SelectValue placeholder="Select marital status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
        {errors.maritalStatus && <FormError message={errors.maritalStatus} />}
      </div>

      {/* Spouse Name - Only show if married */}
      {form.maritalStatus === 'married' && (
        <div>
          <label htmlFor="spouseName" className="block text-sm font-medium mb-1">
            Spouse Name
          </label>
          <Input 
            id="spouseName"
            name="spouseName"
            value={form.spouseName} 
            onChange={handleChange}
            placeholder="Enter your spouse's full name"
          />
        </div>
      )}

      {/* Mobile Number */}
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium mb-1">
          Mobile Number <span className="text-destructive">*</span>
        </label>
        <Input 
          id="mobile"
          name="mobile"
          value={form.mobile} 
          onChange={handleChange}
          placeholder="e.g. +255XXXXXXXX or 0XXXXXXXX"
          className={errors.mobile ? "border-destructive" : ""}
        />
        {errors.mobile && <FormError message={errors.mobile} />}
      </div>

      {/* Alternative Phone */}
      <div>
        <label htmlFor="altPhone" className="block text-sm font-medium mb-1">
          Alternative Phone
        </label>
        <Input 
          id="altPhone"
          name="altPhone"
          value={form.altPhone} 
          onChange={handleChange}
          placeholder="e.g. +255XXXXXXXX or 0XXXXXXXX"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-destructive">*</span>
        </label>
        <Input 
          id="email"
          name="email"
          type="email"
          value={form.email} 
          onChange={handleChange}
          placeholder="Enter your email address"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <FormError message={errors.email} />}
      </div>

      {/* Residence */}
      <div>
        <label htmlFor="residence" className="block text-sm font-medium mb-1">
          Residence <span className="text-destructive">*</span>
        </label>
        <Input 
          id="residence"
          name="residence"
          value={form.residence} 
          onChange={handleChange}
          placeholder="Your current residence area"
          className={errors.residence ? "border-destructive" : ""}
        />
        {errors.residence && <FormError message={errors.residence} />}
      </div>

      {/* District */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium mb-1">
          District <span className="text-destructive">*</span>
        </label>
        <Input 
          id="district"
          name="district"
          value={form.district} 
          onChange={handleChange}
          placeholder="Your district"
          className={errors.district ? "border-destructive" : ""}
        />
        {errors.district && <FormError message={errors.district} />}
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium mb-1">
          Country
        </label>
        <Input 
          id="country"
          name="country"
          value={form.country} 
          onChange={handleChange}
          placeholder="Your country"
        />
      </div>

      {/* Postal Address */}
      <div>
        <label htmlFor="postalAddress" className="block text-sm font-medium mb-1">
          Postal Address
        </label>
        <Input 
          id="postalAddress"
          name="postalAddress"
          value={form.postalAddress} 
          onChange={handleChange}
          placeholder="P.O. Box..."
        />
      </div>

      {/* Number of Dependents */}
      <div>
        <label htmlFor="dependents" className="block text-sm font-medium mb-1">
          Number of Dependents
        </label>
        <Input 
          id="dependents"
          name="dependents"
          type="number"
          min="0"
          value={form.dependents} 
          onChange={handleChange}
          placeholder="How many dependents do you have?"
        />
      </div>
    </div>
  );
}
