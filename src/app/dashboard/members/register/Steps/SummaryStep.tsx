"use client";

import { format } from "date-fns";

// Define types for beneficiaries and emergency contacts
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

interface FormData {
  fullName: string;
  idType: string;
  idNo: string;
  nin: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  spouseName?: string;
  mobile: string;
  email: string;
  residence: string;
  district: string;
  incomeSource: string;
  occupation?: string;
  employer?: string;
  employerAddress?: string;
  businessType?: string;
  businessName?: string;
  businessAddress?: string;
  otherIncome?: string;
  beneficiaries: Beneficiary[];
  emergencyContacts: EmergencyContact[];
  knowHow?: string;
  knowHowDetail?: string;
  otherSaccos?: string;
  otherSaccosDetail?: string;
  nin_doc?: File;
  photo?: File;
  signature?: File;
  id_doc?: File;
  other_docs?: File[];
  declaration?: boolean;
}

interface SummaryStepProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Record<string, string>;
}

export default function SummaryStep({ form, setForm, errors }: SummaryStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Registration Summary</h2>
      <p className="text-muted-foreground mb-4">
        Please review all information before submitting your application. Ensure all details are correct.
      </p>
      
      {/* Personal Information */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Full Name:</span>
            <p className="font-medium">{form.fullName || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">ID Type:</span>
            <p className="font-medium capitalize">{form.idType ? form.idType.toUpperCase() : 'NIN'}</p>
          </div>
          {form.idType && form.idType.toLowerCase() !== 'nin' ? (
            <div>
              <span className="text-sm text-muted-foreground">ID Number:</span>
              <p className="font-medium">{form.idNo || 'Not provided'}</p>
            </div>
          ) : (
            <div>
              <span className="text-sm text-muted-foreground">NIN:</span>
              <p className="font-medium">{form.nin || form.idNo || 'Not provided'}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">Gender:</span>
            <p className="font-medium capitalize">{form.gender || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Date of Birth:</span>
            <p className="font-medium">
              {form.dateOfBirth ? format(new Date(form.dateOfBirth), 'MMMM d, yyyy') : 'Not provided'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Marital Status:</span>
            <p className="font-medium capitalize">{form.maritalStatus || 'Not provided'}</p>
          </div>
          {form.maritalStatus === 'married' && (
            <div>
              <span className="text-sm text-muted-foreground">Spouse Name:</span>
              <p className="font-medium">{form.spouseName || 'Not provided'}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">Mobile Number:</span>
            <p className="font-medium">{form.mobile || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Email:</span>
            <p className="font-medium">{form.email || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Residence:</span>
            <p className="font-medium">{form.residence || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">District:</span>
            <p className="font-medium">{form.district || 'Not provided'}</p>
          </div>
        </div>
      </div>
      
      {/* Income Source */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium mb-3">Source of Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Primary Source of Income:</span>
            <p className="font-medium capitalize">{form.incomeSource || 'Not provided'}</p>
          </div>
          
          {(form.incomeSource === 'employment' || form.incomeSource === 'both') && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Occupation:</span>
                <p className="font-medium">{form.occupation || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Employer:</span>
                <p className="font-medium">{form.employer || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Employer Address:</span>
                <p className="font-medium">{form.employerAddress || 'Not provided'}</p>
              </div>
            </>
          )}
          
          {(form.incomeSource === 'business' || form.incomeSource === 'both') && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Business Type:</span>
                <p className="font-medium capitalize">
                  {form.businessType === 'sole' ? 'Sole Proprietorship' : 
                   form.businessType === 'partnership' ? 'Partnership' : 
                   form.businessType === 'company' ? 'Company' : 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Business Name:</span>
                <p className="font-medium">{form.businessName || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Business Address:</span>
                <p className="font-medium">{form.businessAddress || 'Not provided'}</p>
              </div>
            </>
          )}
          
          {form.incomeSource === 'other' && (
            <div className="md:col-span-2">
              <span className="text-sm text-muted-foreground">Other Income Details:</span>
              <p className="font-medium">{form.otherIncome || 'Not provided'}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Beneficiaries */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium mb-3">Beneficiaries</h3>
        {form.beneficiaries && form.beneficiaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Relationship</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {form.beneficiaries.map((beneficiary: Beneficiary, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">{beneficiary.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{beneficiary.relationship}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{beneficiary.phone}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{beneficiary.percentage}%</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right font-medium">Total:</td>
                  <td className="px-4 py-2 font-medium">
                    {form.beneficiaries.reduce((sum: number, b: Beneficiary) => sum + Number(b.percentage), 0)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">No beneficiaries added</p>
        )}
      </div>
      
      {/* Emergency Contacts */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium mb-3">Emergency Contacts</h3>
        {form.emergencyContacts && form.emergencyContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Relationship</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {form.emergencyContacts.map((contact: EmergencyContact, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">{contact.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{contact.relationship}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{contact.phone}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{contact.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">No emergency contacts added</p>
        )}
      </div>
      
      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium mb-3">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">How did you learn about this SACCO?</span>
            <p className="font-medium capitalize">{form.knowHow || 'Not provided'}</p>
            {form.knowHowDetail && (
              <p className="text-sm">{form.knowHowDetail}</p>
            )}
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Participate in other SACCOs?</span>
            <p className="font-medium capitalize">{form.otherSaccos || 'Not provided'}</p>
            {form.otherSaccos === 'yes' && form.otherSaccosDetail && (
              <p className="text-sm">{form.otherSaccosDetail}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Uploaded Documents */}
      <div>
        <h3 className="text-lg font-medium mb-3">Uploaded Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">National ID (NIN):</span>
            <p className="font-medium">{form.nin_doc ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Passport Photo:</span>
            <p className="font-medium">{form.photo ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Signature:</span>
            <p className="font-medium">{form.signature ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">ID Document Copy:</span>
            <p className="font-medium">{form.id_doc ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Additional Documents:</span>
            <p className="font-medium">
              {form.other_docs && form.other_docs.length > 0 
                ? `${form.other_docs.length} document(s) uploaded` 
                : 'None uploaded'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Declaration */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/20">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="declaration"
            className="mt-1"
            checked={form.declaration || false}
            onChange={(e) => setForm({ ...form, declaration: e.target.checked })}
          />
          <label htmlFor="declaration" className="text-sm">
            I hereby declare that the information provided is true and correct. I understand that any false statement or misrepresentation may result in the rejection of my application or termination of membership. I agree to abide by the SACCO's rules and regulations.
          </label>
        </div>
        {errors.declaration && (
          <p className="text-destructive text-sm mt-2">{errors.declaration}</p>
        )}
      </div>
    </div>
  );
}
