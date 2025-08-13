"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { 
  Check as CheckIcon, 
  Upload as UploadIcon, 
  X as XIcon, 
  File as FileIcon 
} from "lucide-react";

interface UploadsStepProps {
  form: any;
  setForm: (value: any) => void;
  errors: Record<string, string>;
}

export default function UploadsStep({ form, setForm, errors }: UploadsStepProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
      <p className="text-muted-foreground mb-4">
        Upload the required documentation to complete your registration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">
            National ID (NIN) <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*, application/pdf"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm(f => ({ ...f, nin_doc: file }));
                }
              }}
            />
            {form.nin_doc ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckIcon className="h-8 w-8 text-green-500" />
                <span className="text-sm font-medium block truncate max-w-full">
                  {form.nin_doc.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(form.nin_doc.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setForm(f => ({ ...f, nin_doc: null }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload NIN Document</p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG up to 5MB
                </p>
              </div>
            )}
          </div>
          {errors.nin_doc && <FormError message={errors.nin_doc} />}
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            Passport Photo <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm(f => ({ ...f, photo: file }));
                }
              }}
            />
            {form.photo ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                {form.photo.type.startsWith('image/') && (
                  <div className="w-32 h-32 mx-auto overflow-hidden rounded-lg border mb-2">
                    <img 
                      src={URL.createObjectURL(form.photo)} 
                      alt="Passport preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="text-sm font-medium block truncate max-w-full">
                  {form.photo.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(form.photo.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setForm(f => ({ ...f, photo: null }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload Passport Photo</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG up to 2MB
                </p>
              </div>
            )}
          </div>
          {errors.photo && <FormError message={errors.photo} />}
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            Signature <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm(f => ({ ...f, signature: file }));
                }
              }}
            />
            {form.signature ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                {form.signature.type.startsWith('image/') && (
                  <div className="w-32 h-16 mx-auto overflow-hidden rounded-lg border mb-2">
                    <img 
                      src={URL.createObjectURL(form.signature)} 
                      alt="Signature preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className="text-sm font-medium block truncate max-w-full">
                  {form.signature.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(form.signature.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setForm(f => ({ ...f, signature: null }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload Signature</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG up to 1MB
                </p>
              </div>
            )}
          </div>
          {errors.signature && <FormError message={errors.signature} />}
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            ID Document Copy
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*, application/pdf"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm(f => ({ ...f, id_doc: file }));
                }
              }}
            />
            {form.id_doc ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckIcon className="h-8 w-8 text-green-500" />
                <span className="text-sm font-medium block truncate max-w-full">
                  {form.id_doc.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(form.id_doc.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setForm(f => ({ ...f, id_doc: null }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload ID Document</p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG up to 5MB
                </p>
              </div>
            )}
          </div>
          {errors.id_doc && <FormError message={errors.id_doc} />}
        </div>
        
        <div className="md:col-span-2">
          <label className="block font-medium mb-2">
            Additional Documents
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*, application/pdf"
              multiple
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const filesArray = Array.from(files);
                  setForm(f => ({ ...f, other_docs: [...(f.other_docs || []), ...filesArray] }));
                }
              }}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload additional documents</p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG up to 10MB total
              </p>
            </div>
          </div>
          
          {/* Display uploaded additional documents */}
          {form.other_docs && form.other_docs.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Uploaded Additional Documents:</h4>
              <div className="grid grid-cols-1 gap-2">
                {form.other_docs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => {
                        setForm(f => ({ 
                          ...f, 
                          other_docs: f.other_docs.filter((_, i) => i !== idx) 
                        }));
                      }}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>* Required documents must be less than 5MB in size</p>
        <p>* Acceptable formats: PDF, JPG, PNG</p>
        <p>* Documents must be clear and readable</p>
      </div>
    </div>
  );
}
