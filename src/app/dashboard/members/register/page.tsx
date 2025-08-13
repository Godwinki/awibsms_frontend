"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator, Step } from "@/components/ui/step-indicator";
import { FormError } from "@/components/ui/form-error";
import { 
  validatePersonalInfoStep, 
  validateIncomeStep, 
  validateBeneficiariesStep, 
  validateEmergencyContactsStep,
  validateAdditionalInfoStep,
  validateFinalSubmission
} from "@/lib/validations/memberValidation";
import { MemberService } from "@/lib/services/member.service";
import { toast } from "@/components/ui/use-toast";

import { ArrowLeft, Loader2, Users } from "lucide-react";
import MemberExcelUpload from "@/components/members/MemberExcelUpload";

// Import Step Components
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import IncomeSourceStep from "./Steps/IncomeSourceStep";
import BeneficiariesStep from "./Steps/BeneficiariesStep";
import EmergencyContactsStep from "./Steps/EmergencyContactsStep";
import UploadsStep from "./Steps/UploadsStep";
import AdditionalInfoStep from "./Steps/AdditionalInfoStep";
import SummaryStep from "./Steps/SummaryStep";

// Steps definition
const steps: Step[] = [
  { id: 1, name: "Applicant Details", description: "Personal information" },
  { id: 2, name: "Source of Income", description: "Employment & business" },
  { id: 3, name: "Beneficiaries", description: "Fund beneficiaries" },
  { id: 4, name: "Emergency Contacts", description: "Contact persons" },
  { id: 5, name: "Uploads", description: "Required documents" },
  { id: 6, name: "Additional Info", description: "Other information" },
  { id: 7, name: "Review & Submit", description: "Final verification" },
];

export default function RegisterMemberPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'individual' | 'bulk'>('individual');
  
  // Form state for member registration
  interface Beneficiary {
    name: string;
    relationship: string;
    phone: string;
    percentage: string;
  }
  
  interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  }
  
  interface FormState {
    // Personal information
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
    
    // Income source
    incomeSource: string;
    occupation: string;
    employer: string;
    employerAddress: string;
    businessType: string;
    businessName: string;
    businessAddress: string;
    businessStartDate: string;
    partners: string;
    owners: string;
    otherIncome: string;
    
    // Beneficiaries
    beneficiaries: Beneficiary[];
    
    // Emergency contacts
    emergencyContacts: EmergencyContact[];
    
    // Document uploads
    nin_doc: File | null;
    photo: File | null;
    signature: File | null;
    id_doc: File | null;
    other_docs: File[];
    
    // Additional info
    knowHow: string;
    knowHowDetail: string;
    otherSaccos: string;
    otherSaccosDetail: string;
    declaration: boolean;
  }

  const [form, setForm] = useState<FormState>({
    // Personal information
    fullName: "",
    idType: "",
    idNo: "",
    nin: "",
    gender: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "Tanzanian",
    maritalStatus: "",
    spouseName: "",
    mobile: "",
    email: "",
    altPhone: "",
    residence: "",
    district: "",
    country: "Tanzania",
    postalAddress: "",
    dependents: "",
    
    // Income source
    incomeSource: "",
    occupation: "",
    employer: "",
    employerAddress: "",
    businessType: "",
    businessName: "",
    businessAddress: "",
    businessStartDate: "",
    partners: "",
    owners: "",
    otherIncome: "",
    
    // Beneficiaries
    beneficiaries: [],
    
    // Emergency contacts
    emergencyContacts: [],
    
    // Document uploads
    nin_doc: null,
    photo: null,
    signature: null,
    id_doc: null,
    other_docs: [],
    
    // Additional info
    knowHow: "",
    knowHowDetail: "",
    otherSaccos: "",
    otherSaccosDetail: "",
    declaration: false
  });

  // Navigation and validation functions
  const validateStep = () => {
    setShowErrors(true);
    
    // Validate current step
    let stepValidation = { valid: true, errors: {} };
    
    switch (step) {
      case 0: // Applicant Details
        stepValidation = validatePersonalInfoStep(form);
        break;
      case 1: // Source of Income
        stepValidation = validateIncomeStep(form);
        break;
      case 2: // Beneficiaries
        stepValidation = validateBeneficiariesStep(form);
        break;
      case 3: // Emergency Contacts
        stepValidation = validateEmergencyContactsStep(form);
        break;
      case 5: // Additional Info
        stepValidation = validateAdditionalInfoStep(form);
        break;
      case 6: // Review and Submit
        stepValidation = validateFinalSubmission(form);
        break;
      default:
        // No validation for Uploads step currently
        break;
    }
    
    setErrors(stepValidation.errors);
    return stepValidation.valid;
  };
  
  const nextStep = () => {
    if (validateStep()) {
      setShowErrors(false);
      setStep(s => Math.min(s + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    setShowErrors(false);
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  };
  
  const submitForm = async () => {
    console.log('Submit button clicked');
    
    // Show toast at the beginning to confirm button is working
    toast({
      title: "Processing Submission",
      description: "Validating form data...",
      variant: "default",
    });
    
    // Final validation before submission
    console.log('Running final validation');
    const finalValidation = validateFinalSubmission(form);
    
    if (!finalValidation.valid) {
      console.log('Validation failed:', finalValidation.errors);
      setErrors(finalValidation.errors);
      
      toast({
        title: "Validation Error",
        description: "Please check form for errors and try again",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Validation passed, proceeding with submission');
    setLoading(true);
    
    try {
      // Format data for API submission
      const memberData = {
        // Personal information
        fullName: form.fullName,
        idNo: form.idNo || form.nin, // Use NIN as fallback
        nin: form.nin,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth || '',
        nationality: form.nationality || 'Tanzanian',
        maritalStatus: form.maritalStatus,
        mobile: form.mobile,
        email: form.email,
        residence: form.residence,
        district: form.district || '',
        
        // Income source
        employmentStatus: form.incomeSource === 'employment' ? 'employed' : 
                          form.incomeSource === 'business' ? 'self-employed' : 
                          form.incomeSource === 'both' ? 'both' : 'other',
        employerName: form.employer || '',
        incomeSource: form.incomeSource,
        businessType: form.businessType || '',
        partners: form.partners || '',
        owners: form.owners || '',
        
        // Additional info
        knowHow: form.knowHow || '',
        knowHowDetail: form.knowHowDetail || '',
        otherSaccos: form.otherSaccos || 'no',
        declaration: form.declaration || true,
        
        // Emergency contacts and beneficiaries stored as JSON strings
        emergencyContacts: JSON.stringify(form.emergencyContacts || []),
        beneficiaries: JSON.stringify(form.beneficiaries || [])
      };
      
      console.log('Submitting member data to API:', memberData);
      
      // Submit to API using MemberService
      const response = await MemberService.create(memberData);
      console.log('API response:', response);
      
      // For file uploads, we need a separate API call or modify the member service
      // This is a stub for now - in a real implementation, you'd handle file uploads
      // either in a single call or in separate API requests after the member is created
      
      // Show success message
      toast({
        title: "Registration Successful",
        description: "The member has been registered successfully.",
        variant: "default", // Using default variant instead of success
      });
      
      // Navigate to the member details page or members list
      router.push(`/dashboard/members/${response.data?.id || ''}`);
    } catch (error) {
      console.error('Error submitting registration form:', error);
      // Handle API errors
      setErrors({ 
        api: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member Registration</h1>
          <p className="text-muted-foreground">
            Register a new member individually or upload multiple members at once.
          </p>
        </div>
        <div className="flex gap-3">
          <MemberExcelUpload />
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/members")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Button>
        </div>
      </div>
      
      {/* Stepper indicator */}
      <div className="mb-8">
        <StepIndicator 
          steps={steps}
          currentStep={step + 1}
        />
      </div>
      
      {/* API Error display */}
      {errors.api && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6">
          <p className="font-medium">Registration Error</p>
          <p>{errors.api}</p>
        </div>
      )}
      
      {/* Step content */}
      {step === 0 && (
        <PersonalInfoStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 1 && (
        <IncomeSourceStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 2 && (
        <BeneficiariesStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 3 && (
        <EmergencyContactsStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 4 && (
        <UploadsStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 5 && (
        <AdditionalInfoStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {step === 6 && (
        <SummaryStep form={form} setForm={setForm} errors={errors} />
      )}
      
      {/* Form navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          onClick={prevStep} 
          disabled={step === 0 || loading}
          variant="outline"
        >
          Previous
        </Button>
        
        {step < steps.length - 1 ? (
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={() => {
              console.log('Submit button clicked directly');
              toast({
                title: "Submit Button Clicked",
                description: "Attempting to process form...",
                variant: "default",
              });
              // Call the actual submit function
              submitForm();
            }}
            disabled={loading}
            className="bg-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Registration'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}