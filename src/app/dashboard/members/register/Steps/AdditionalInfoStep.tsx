"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";

interface AdditionalInfoStepProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function AdditionalInfoStep({ form, setForm, errors }: AdditionalInfoStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block font-medium mb-2">
            How did you learn about this SACCO? <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'member'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'member', knowHowDetail: '' }))}
              />
              Existing Member
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'friend'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'friend', knowHowDetail: '' }))}
              />
              Friend/Relative
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'advert'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'advert', knowHowDetail: '' }))}
              />
              Advertisement
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'social'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'social', knowHowDetail: '' }))}
              />
              Social Media
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'event'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'event', knowHowDetail: '' }))}
              />
              Community Event
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="knowHow" 
                checked={form.knowHow === 'other'} 
                onChange={() => setForm(f => ({ ...f, knowHow: 'other', knowHowDetail: '' }))}
              />
              Other
            </label>
          </div>
          {errors.knowHow && <FormError message={errors.knowHow} />}
        </div>
        
        {(form.knowHow === 'member' || form.knowHow === 'advert' || form.knowHow === 'other') && (
          <div>
            <label htmlFor="knowHowDetail" className="block font-medium mb-1">
              Please provide details <span className="text-destructive">*</span>
            </label>
            <Input
              id="knowHowDetail"
              value={form.knowHowDetail}
              onChange={e => setForm(f => ({ ...f, knowHowDetail: e.target.value }))}
              placeholder={
                form.knowHow === 'member' 
                  ? "Member's name" 
                  : form.knowHow === 'advert' 
                  ? "Which advertisement?" 
                  : "Please specify"
              }
              className={errors.knowHowDetail ? "border-destructive" : ""}
            />
            {errors.knowHowDetail && <FormError message={errors.knowHowDetail} />}
          </div>
        )}
        
        <div>
          <label className="block font-medium mb-2">
            Do you participate in other SACCOs? <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="otherSaccos" 
                checked={form.otherSaccos === 'yes'} 
                onChange={() => setForm(f => ({ ...f, otherSaccos: 'yes' }))}
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="otherSaccos" 
                checked={form.otherSaccos === 'no'} 
                onChange={() => setForm(f => ({ ...f, otherSaccos: 'no' }))}
              />
              No
            </label>
          </div>
          {errors.otherSaccos && <FormError message={errors.otherSaccos} />}
        </div>
        
        {form.otherSaccos === 'yes' && (
          <div>
            <label htmlFor="otherSaccosDetail" className="block font-medium mb-1">
              Please provide details of other SACCOs
            </label>
            <Textarea
              id="otherSaccosDetail"
              value={form.otherSaccosDetail || ''}
              onChange={e => setForm(f => ({ ...f, otherSaccosDetail: e.target.value }))}
              placeholder="Names of other SACCOs you participate in"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
