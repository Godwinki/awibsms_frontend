"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";

interface IncomeSourceStepProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function IncomeSourceStep({ form, setForm, errors }: IncomeSourceStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Source of Income</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="incomeSource" className="block font-medium mb-1">
            Primary Source of Income <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="incomeSource" 
                checked={form.incomeSource === 'employment'} 
                onChange={() => setForm(f => ({ ...f, incomeSource: 'employment', businessType: '', businessName: '', businessAddress: '', businessStartDate: '', partners: '', owners: '' }))}
              />
              Employment
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="incomeSource" 
                checked={form.incomeSource === 'business'} 
                onChange={() => setForm(f => ({ ...f, incomeSource: 'business', employer: '', employerAddress: '' }))}
              />
              Business
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="incomeSource" 
                checked={form.incomeSource === 'both'} 
                onChange={() => setForm(f => ({ ...f, incomeSource: 'both' }))}
              />
              Both
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="incomeSource" 
                checked={form.incomeSource === 'other'} 
                onChange={() => setForm(f => ({ ...f, incomeSource: 'other', employer: '', employerAddress: '', businessType: '', businessName: '', businessAddress: '', businessStartDate: '', partners: '', owners: '' }))}
              />
              Other
            </label>
          </div>
          {errors.incomeSource && <FormError message={errors.incomeSource} />}
        </div>
        
        {/* Employment Details */}
        {(form.incomeSource === 'employment' || form.incomeSource === 'both') && (
          <>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Employment Details</h3>
            </div>
            <div>
              <label htmlFor="occupation" className="block font-medium mb-1">
                Occupation/Position <span className="text-destructive">*</span>
              </label>
              <Input 
                id="occupation"
                value={form.occupation} 
                onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
                placeholder="Enter occupation"
                className={errors.occupation ? "border-destructive" : ""}
              />
              {errors.occupation && <FormError message={errors.occupation} />}
            </div>
            
            <div>
              <label htmlFor="employer" className="block font-medium mb-1">
                Employer <span className="text-destructive">*</span>
              </label>
              <Input 
                id="employer"
                value={form.employer} 
                onChange={e => setForm(f => ({ ...f, employer: e.target.value }))}
                placeholder="Enter employer name"
                className={errors.employer ? "border-destructive" : ""}
              />
              {errors.employer && <FormError message={errors.employer} />}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="employerAddress" className="block font-medium mb-1">
                Employer Address <span className="text-destructive">*</span>
              </label>
              <Input 
                id="employerAddress"
                value={form.employerAddress} 
                onChange={e => setForm(f => ({ ...f, employerAddress: e.target.value }))}
                placeholder="Enter employer address"
                className={errors.employerAddress ? "border-destructive" : ""}
              />
              {errors.employerAddress && <FormError message={errors.employerAddress} />}
            </div>
          </>
        )}
        
        {/* Business Details */}
        {(form.incomeSource === 'business' || form.incomeSource === 'both') && (
          <>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Business Details</h3>
            </div>
            
            <div>
              <label htmlFor="businessType" className="block font-medium mb-1">
                Business Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="businessType" 
                    checked={form.businessType === 'sole'} 
                    onChange={() => setForm(f => ({ ...f, businessType: 'sole', partners: '', owners: '' }))}
                  />
                  Sole Proprietorship
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="businessType" 
                    checked={form.businessType === 'partnership'} 
                    onChange={() => setForm(f => ({ ...f, businessType: 'partnership', owners: '' }))}
                  />
                  Partnership
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="businessType" 
                    checked={form.businessType === 'company'} 
                    onChange={() => setForm(f => ({ ...f, businessType: 'company', partners: '' }))}
                  />
                  Company
                </label>
              </div>
              {errors.businessType && <FormError message={errors.businessType} />}
            </div>
            
            <div>
              <label htmlFor="businessName" className="block font-medium mb-1">
                Business Name <span className="text-destructive">*</span>
              </label>
              <Input 
                id="businessName"
                value={form.businessName} 
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                placeholder="Enter business name"
                className={errors.businessName ? "border-destructive" : ""}
              />
              {errors.businessName && <FormError message={errors.businessName} />}
            </div>
            
            <div>
              <label htmlFor="businessAddress" className="block font-medium mb-1">
                Business Address <span className="text-destructive">*</span>
              </label>
              <Input 
                id="businessAddress"
                value={form.businessAddress} 
                onChange={e => setForm(f => ({ ...f, businessAddress: e.target.value }))}
                placeholder="Enter business address"
                className={errors.businessAddress ? "border-destructive" : ""}
              />
              {errors.businessAddress && <FormError message={errors.businessAddress} />}
            </div>
            
            <div>
              <label htmlFor="businessStartDate" className="block font-medium mb-1">
                Business Start Date
              </label>
              <Input 
                id="businessStartDate"
                type="date"
                value={form.businessStartDate} 
                onChange={e => setForm(f => ({ ...f, businessStartDate: e.target.value }))}
                className={errors.businessStartDate ? "border-destructive" : ""}
              />
              {errors.businessStartDate && <FormError message={errors.businessStartDate} />}
            </div>
            
            {form.businessType === 'partnership' && (
              <div>
                <label htmlFor="partners" className="block font-medium mb-1">
                  Number of Partners <span className="text-destructive">*</span>
                </label>
                <Input 
                  id="partners"
                  type="number"
                  min="2"
                  value={form.partners} 
                  onChange={e => setForm(f => ({ ...f, partners: e.target.value }))}
                  placeholder="Enter number of partners"
                  className={errors.partners ? "border-destructive" : ""}
                />
                {errors.partners && <FormError message={errors.partners} />}
              </div>
            )}
            
            {form.businessType === 'company' && (
              <div>
                <label htmlFor="owners" className="block font-medium mb-1">
                  Number of Owners <span className="text-destructive">*</span>
                </label>
                <Input 
                  id="owners"
                  type="number"
                  min="1"
                  value={form.owners} 
                  onChange={e => setForm(f => ({ ...f, owners: e.target.value }))}
                  placeholder="Enter number of owners"
                  className={errors.owners ? "border-destructive" : ""}
                />
                {errors.owners && <FormError message={errors.owners} />}
              </div>
            )}
          </>
        )}
        
        {/* Other Income Source */}
        {form.incomeSource === 'other' && (
          <div className="md:col-span-2">
            <label htmlFor="otherIncome" className="block font-medium mb-1">
              Please specify source of income <span className="text-destructive">*</span>
            </label>
            <Textarea 
              id="otherIncome"
              value={form.otherIncome} 
              onChange={e => setForm(f => ({ ...f, otherIncome: e.target.value }))}
              placeholder="Describe your source of income"
              className={errors.otherIncome ? "border-destructive" : ""}
              rows={4}
            />
            {errors.otherIncome && <FormError message={errors.otherIncome} />}
          </div>
        )}
      </div>
    </div>
  );
}
