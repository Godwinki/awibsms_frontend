"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { MemberService, Member } from "@/lib/services/member.service";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Form error component
const FormError = ({ message }: { message: string }) => (
  <p className="text-sm text-destructive mt-1">{message}</p>
);

// Define form state interface
interface FormState {
  // Basic member info - not editable but needed for display
  id?: number;
  fullName: string;
  accountNumber: string;
  
  // Beneficiaries
  beneficiaries: Beneficiary[];
  
  // Emergency Contacts
  emergencyContacts: EmergencyContact[];
  
  // Business Details
  businessName: string;
  businessType: string;
  businessLocation: string;
  businessRegistrationNumber: string;
  businessStartDate: string;
  businessDescription: string;
  estimatedMonthlyIncome: string;
  
  // Allow dynamic properties
  [key: string]: any;
}

// Beneficiary interface
interface Beneficiary {
  id?: number;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  contactInfo: string;
  isMinor: boolean;
  guardianName?: string;
  guardianContact?: string;
}

// Emergency Contact interface
interface EmergencyContact {
  id?: number;
  fullName: string;
  relationship: string;
  primaryPhone: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
}

// Initial form state with empty values
const initialFormState: FormState = {
  fullName: "",
  accountNumber: "",
  
  // Beneficiaries
  beneficiaries: [],
  
  // Emergency Contacts
  emergencyContacts: [],
  
  // Business Details
  businessName: "",
  businessType: "",
  businessLocation: "",
  businessRegistrationNumber: "",
  businessStartDate: "",
  businessDescription: "",
  estimatedMonthlyIncome: "",
};

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const memberId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch member data on component mount
  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const response = await MemberService.getById(memberId);
        const memberData = response.data?.member || response.data;
        setMember(memberData);
        
        // Default empty arrays if not provided
        const formattedData: FormState = {
          id: memberData.id,
          fullName: memberData.fullName || '',
          accountNumber: memberData.accountNumber || '',
          
          // Use existing data or initialize with empty arrays
          beneficiaries: Array.isArray(memberData.beneficiaries) 
            ? memberData.beneficiaries 
            : (memberData.beneficiaries ? JSON.parse(memberData.beneficiaries) : []),
          emergencyContacts: Array.isArray(memberData.emergencyContacts) 
            ? memberData.emergencyContacts 
            : (memberData.emergencyContacts ? JSON.parse(memberData.emergencyContacts) : []),
          
          // Business details
          businessName: memberData.businessName || '',
          businessType: memberData.businessType || '',
          businessLocation: memberData.businessLocation || '',
          businessRegistrationNumber: memberData.businessRegistrationNumber || '',
          businessStartDate: memberData.businessStartDate || '',
          businessDescription: memberData.businessDescription || '',
          estimatedMonthlyIncome: memberData.estimatedMonthlyIncome || '',
        };
        
        // Format dates if needed
        if (formattedData.businessStartDate) {
          try {
            const date = new Date(formattedData.businessStartDate);
            formattedData.businessStartDate = format(date, "yyyy-MM-dd");
          } catch (e) {
            console.error("Error formatting business start date:", e);
          }
        }
        
        // Format dates for beneficiaries and ensure property names are correct
        formattedData.beneficiaries = formattedData.beneficiaries.map(ben => {
          // Handle field name differences between frontend and backend
          const formattedBen = {
            id: ben.id,
            fullName: ben.name || ben.fullName || '',
            relationship: ben.relationship || '',
            dateOfBirth: ben.dateOfBirth || '',
            sharePercentage: ben.percentage ? parseFloat(ben.percentage) : ben.sharePercentage || 0,
            contactInfo: ben.phone || ben.contactInfo || '',
            isMinor: ben.isMinor || false,
            guardianName: ben.guardianName || '',
            guardianContact: ben.guardianContact || ''
          };
          
          // Format date if it exists
          if (formattedBen.dateOfBirth) {
            try {
              formattedBen.dateOfBirth = format(new Date(formattedBen.dateOfBirth), "yyyy-MM-dd");
            } catch (e) {
              console.error("Error formatting beneficiary date:", e);
            }
          }
          return formattedBen;
        });
        
        // Format emergency contacts and ensure property names are correct
        formattedData.emergencyContacts = formattedData.emergencyContacts.map(contact => {
          // Handle field name differences between frontend and backend
          return {
            id: contact.id,
            fullName: contact.name || contact.fullName || '',
            relationship: contact.relationship || '',
            primaryPhone: contact.phone || contact.primaryPhone || '',
            alternativePhone: contact.alternativePhone || '',
            email: contact.email || '',
            address: contact.address || ''
          };
        });
        
        console.log('Formatted member data:', formattedData);
        setForm(formattedData);
      } catch (error) {
        console.error("Error fetching member:", error);
        toast({
          title: "Error",
          description: "Failed to load member details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: any = {};
    
    // We're just updating additional details, so minimal validation needed
    
    // Validate beneficiaries
    const beneficiaryErrors: any[] = [];
    form.beneficiaries.forEach((ben, index) => {
      const errors: any = {};
      if (!ben.fullName) errors.fullName = "Full name is required";
      if (!ben.relationship) errors.relationship = "Relationship is required";
      if (ben.sharePercentage < 0 || ben.sharePercentage > 100) errors.sharePercentage = "Percentage must be between 0-100";
      
      // If errors, add to array
      if (Object.keys(errors).length > 0) {
        beneficiaryErrors[index] = errors;
      }
    });
    
    if (beneficiaryErrors.length > 0) {
      newErrors.beneficiaries = beneficiaryErrors;
    }
    
    // Validate emergency contacts
    const contactErrors: any[] = [];
    form.emergencyContacts.forEach((contact, index) => {
      const errors: any = {};
      if (!contact.fullName) errors.fullName = "Full name is required";
      if (!contact.relationship) errors.relationship = "Relationship is required";
      if (!contact.primaryPhone) errors.primaryPhone = "Primary phone is required";
      
      // If errors, add to array
      if (Object.keys(errors).length > 0) {
        contactErrors[index] = errors;
      }
    });
    
    if (contactErrors.length > 0) {
      newErrors.emergencyContacts = contactErrors;
    }
    
    // Business details validation
    if (form.businessName && !form.businessType) {
      newErrors.businessType = "Business type is required if name is provided";
    }
    
    if (form.estimatedMonthlyIncome && isNaN(parseFloat(form.estimatedMonthlyIncome))) {
      newErrors.estimatedMonthlyIncome = "Monthly income must be a number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      await MemberService.update(memberId, form);
      toast({
        title: "Success",
        description: "Member updated successfully!",
      });
      router.push(`/dashboard/members/${memberId}`);
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle member deletion
  const handleDelete = async () => {
    if (confirmationText !== form.fullName || isDeleting) return;

    setIsDeleting(true);
    try {
      await MemberService.delete(memberId);
      toast({
        title: 'Success',
        description: 'Member has been deleted successfully.',
      });
      
      // Redirect to the main members dashboard page
      router.replace('/dashboard/members');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete member. Please try again.',
        variant: 'destructive',
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading member details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/members/${memberId}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Member</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            Delete Member
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{form.fullName}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Member details update
              </CardDescription>
            </div>
            <div className="mt-3 md:mt-0 bg-primary-foreground/10 px-3 py-2 rounded text-center">
              <div className="text-sm opacity-80">Member ID</div>
              <div className="text-lg font-semibold font-mono">{form.accountNumber}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            You can update the member's beneficiaries, emergency contacts, and business details. Basic personal
            information cannot be modified after registration.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="beneficiaries" className="w-full">
        <TabsList>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Beneficiaries</CardTitle>
              <CardDescription>
                Manage the member's beneficiaries and their allocation percentages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {form.beneficiaries && form.beneficiaries.length > 0 ? (
                <div className="space-y-6">
                  {form.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Beneficiary {index + 1}</h3>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newBeneficiaries = [...form.beneficiaries];
                            newBeneficiaries.splice(index, 1);
                            setForm({ ...form, beneficiaries: newBeneficiaries });
                          }}
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Full Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={beneficiary.fullName}
                            onChange={(e) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].fullName = e.target.value;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                            className={errors.beneficiaries && errors.beneficiaries[index]?.fullName ? 'border-destructive' : ''}
                          />
                          {errors.beneficiaries && errors.beneficiaries[index]?.fullName && (
                            <FormError message={errors.beneficiaries[index].fullName} />
                          )}
                        </div>

                        {/* Relationship */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Relationship <span className="text-destructive">*</span>
                          </label>
                          <Select
                            value={beneficiary.relationship}
                            onValueChange={(value) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].relationship = value;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                          >
                            <SelectTrigger
                              className={errors.beneficiaries && errors.beneficiaries[index]?.relationship ? 'border-destructive' : ''}
                            >
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.beneficiaries && errors.beneficiaries[index]?.relationship && (
                            <FormError message={errors.beneficiaries[index].relationship} />
                          )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            value={beneficiary.dateOfBirth}
                            onChange={(e) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].dateOfBirth = e.target.value;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                          />
                        </div>

                        {/* Share Percentage */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Share Percentage <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={beneficiary.sharePercentage !== undefined ? beneficiary.sharePercentage.toString() : '0'}
                            onChange={(e) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].sharePercentage = parseFloat(e.target.value) || 0;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                            className={errors.beneficiaries && errors.beneficiaries[index]?.sharePercentage ? 'border-destructive' : ''}
                          />
                          {errors.beneficiaries && errors.beneficiaries[index]?.sharePercentage && (
                            <FormError message={String(errors.beneficiaries[index].sharePercentage)} />
                          )}
                        </div>

                        {/* Contact Information */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Contact Information
                          </label>
                          <Input
                            value={beneficiary.contactInfo}
                            onChange={(e) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].contactInfo = e.target.value;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                          />
                        </div>

                        {/* Is Minor */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`isMinor-${index}`}
                            checked={beneficiary.isMinor}
                            onChange={(e) => {
                              const newBeneficiaries = [...form.beneficiaries];
                              newBeneficiaries[index].isMinor = e.target.checked;
                              setForm({ ...form, beneficiaries: newBeneficiaries });
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`isMinor-${index}`} className="text-sm font-medium">
                            Is a Minor
                          </label>
                        </div>
                      </div>

                      {/* Guardian Info (conditional) */}
                      {beneficiary.isMinor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Guardian Name
                            </label>
                            <Input
                              value={beneficiary.guardianName || ''}
                              onChange={(e) => {
                                const newBeneficiaries = [...form.beneficiaries];
                                newBeneficiaries[index].guardianName = e.target.value;
                                setForm({ ...form, beneficiaries: newBeneficiaries });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Guardian Contact
                            </label>
                            <Input
                              value={beneficiary.guardianContact || ''}
                              onChange={(e) => {
                                const newBeneficiaries = [...form.beneficiaries];
                                newBeneficiaries[index].guardianContact = e.target.value;
                                setForm({ ...form, beneficiaries: newBeneficiaries });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <p className="text-muted-foreground">No beneficiaries added yet.</p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newBeneficiary = {
                      fullName: '',
                      relationship: '',
                      dateOfBirth: '',
                      sharePercentage: 0,
                      contactInfo: '',
                      isMinor: false,
                    };
                    setForm({
                      ...form,
                      beneficiaries: [...form.beneficiaries, newBeneficiary],
                    });
                  }}
                  className="w-full"
                >
                  Add Beneficiary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Manage the member's emergency contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {form.emergencyContacts && form.emergencyContacts.length > 0 ? (
                <div className="space-y-6">
                  {form.emergencyContacts.map((contact, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Emergency Contact {index + 1}</h3>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newContacts = [...form.emergencyContacts];
                            newContacts.splice(index, 1);
                            setForm({ ...form, emergencyContacts: newContacts });
                          }}
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Full Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={contact.fullName}
                            onChange={(e) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].fullName = e.target.value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                            className={errors.emergencyContacts && errors.emergencyContacts[index]?.fullName ? 'border-destructive' : ''}
                          />
                          {errors.emergencyContacts && errors.emergencyContacts[index]?.fullName && (
                            <FormError message={errors.emergencyContacts[index].fullName} />
                          )}
                        </div>

                        {/* Relationship */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Relationship <span className="text-destructive">*</span>
                          </label>
                          <Select
                            value={contact.relationship}
                            onValueChange={(value) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].relationship = value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                          >
                            <SelectTrigger
                              className={errors.emergencyContacts && errors.emergencyContacts[index]?.relationship ? 'border-destructive' : ''}
                            >
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="colleague">Colleague</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.emergencyContacts && errors.emergencyContacts[index]?.relationship && (
                            <FormError message={errors.emergencyContacts[index].relationship} />
                          )}
                        </div>

                        {/* Primary Phone */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Primary Phone <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={contact.primaryPhone}
                            onChange={(e) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].primaryPhone = e.target.value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                            placeholder="e.g. +255XXXXXXXX or 0XXXXXXXX"
                            className={errors.emergencyContacts && errors.emergencyContacts[index]?.primaryPhone ? 'border-destructive' : ''}
                          />
                          {errors.emergencyContacts && errors.emergencyContacts[index]?.primaryPhone && (
                            <FormError message={errors.emergencyContacts[index].primaryPhone} />
                          )}
                        </div>

                        {/* Alternative Phone */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Alternative Phone
                          </label>
                          <Input
                            value={contact.alternativePhone || ''}
                            onChange={(e) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].alternativePhone = e.target.value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                            placeholder="e.g. +255XXXXXXXX or 0XXXXXXXX"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={contact.email || ''}
                            onChange={(e) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].email = e.target.value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                            placeholder="Enter email address"
                          />
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Address
                          </label>
                          <Input
                            value={contact.address || ''}
                            onChange={(e) => {
                              const newContacts = [...form.emergencyContacts];
                              newContacts[index].address = e.target.value;
                              setForm({ ...form, emergencyContacts: newContacts });
                            }}
                            placeholder="Enter physical address"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <p className="text-muted-foreground">No emergency contacts added yet.</p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newContact = {
                      fullName: '',
                      relationship: '',
                      primaryPhone: '',
                      alternativePhone: '',
                      email: '',
                      address: '',
                    };
                    setForm({
                      ...form,
                      emergencyContacts: [...form.emergencyContacts, newContact],
                    });
                  }}
                  className="w-full"
                >
                  Add Emergency Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update information about the member's business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Name
                  </label>
                  <Input
                    name="businessName"
                    value={form.businessName || ''}
                    onChange={handleChange}
                    placeholder="Enter business name"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Type
                  </label>
                  <Select
                    value={form.businessType || ''}
                    onValueChange={(value) => handleSelectChange('businessType', value)}
                  >
                    <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && <FormError message={errors.businessType} />}
                </div>

                {/* Business Location */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Location
                  </label>
                  <Input
                    name="businessLocation"
                    value={form.businessLocation || ''}
                    onChange={handleChange}
                    placeholder="Enter business location"
                  />
                </div>

                {/* Business Registration Number */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registration Number
                  </label>
                  <Input
                    name="businessRegistrationNumber"
                    value={form.businessRegistrationNumber || ''}
                    onChange={handleChange}
                    placeholder="Enter business registration number"
                  />
                </div>

                {/* Business Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Start Date
                  </label>
                  <Input
                    name="businessStartDate"
                    type="date"
                    value={form.businessStartDate || ''}
                    onChange={handleChange}
                  />
                </div>

                {/* Estimated Monthly Income */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estimated Monthly Income
                  </label>
                  <Input
                    name="estimatedMonthlyIncome"
                    value={form.estimatedMonthlyIncome || ''}
                    onChange={handleChange}
                    placeholder="Enter estimated monthly income"
                    className={errors.estimatedMonthlyIncome ? 'border-destructive' : ''}
                  />
                  {errors.estimatedMonthlyIncome && <FormError message={errors.estimatedMonthlyIncome} />}
                </div>

                {/* Business Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="businessDescription"
                    value={form.businessDescription || ''}
                    onChange={(e) => handleChange(e as any)}
                    placeholder="Enter business description"
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Warning: Permanent Member Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              You are about to permanently delete member <span className="font-bold">"{form.fullName}"</span> from the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-2 border border-amber-200 bg-amber-50 p-4 rounded-md">
            <h4 className="font-semibold text-amber-800 mb-2">The following data will be permanently deleted:</h4>
            <ul className="text-sm space-y-1 list-disc pl-5 text-amber-700">
              <li>Member's personal and contact information</li>
              <li>All savings and loan accounts associated with this member</li>
              <li>All transaction and payment history</li>
              <li>All beneficiary information</li>
              <li>All emergency contact information</li>
              <li>Any uploaded documents (ID copies, photos, etc.)</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-medium">This action CANNOT be undone. Type <span className="font-bold">"{form.fullName}"</span> to confirm:</p>
            </div>
            <Input 
              value={confirmationText}
              onChange={e => setConfirmationText(e.target.value)}
              className={confirmationText !== form.fullName ? "border-destructive" : "border-input"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={confirmationText !== form.fullName || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
