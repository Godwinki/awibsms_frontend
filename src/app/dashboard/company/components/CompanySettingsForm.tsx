'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, X } from 'lucide-react'
import CompanyService, { CompanySettings, CompanyUpdateData } from '@/lib/services/company/company.service'

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  displayName: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  establishedDate: z.string().optional(),
  headOfficeAddress: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  primaryEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  secondaryEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanySettingsFormProps {
  company: CompanySettings
  onUpdate: (updatedCompany: CompanySettings) => void
  onCancel: () => void
}

export function CompanySettingsForm({ company, onUpdate, onCancel }: CompanySettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [coreValues, setCoreValues] = useState<string[]>(company.coreValues || [])
  const [newValue, setNewValue] = useState('')
  const { toast } = useToast()

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: company.companyName || '',
      displayName: company.displayName || '',
      registrationNumber: company.registrationNumber || '',
      taxIdentificationNumber: company.taxIdentificationNumber || '',
      licenseNumber: company.licenseNumber || '',
      establishedDate: company.establishedDate ? new Date(company.establishedDate).toISOString().split('T')[0] : '',
      headOfficeAddress: company.headOfficeAddress || '',
      city: company.city || '',
      region: company.region || '',
      country: company.country || '',
      primaryPhone: company.primaryPhone || '',
      secondaryPhone: company.secondaryPhone || '',
      primaryEmail: company.primaryEmail || '',
      secondaryEmail: company.secondaryEmail || '',
      website: company.website || '',
      description: company.description || '',
      vision: company.vision || '',
      mission: company.mission || '',
    },
  })

  const addCoreValue = () => {
    if (newValue.trim() && !coreValues.includes(newValue.trim())) {
      setCoreValues([...coreValues, newValue.trim()])
      setNewValue('')
    }
  }

  const removeCoreValue = (valueToRemove: string) => {
    setCoreValues(coreValues.filter(value => value !== valueToRemove))
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setLoading(true)

      const updateData: CompanyUpdateData = {
        ...data,
        coreValues,
      }

      // Remove empty strings to avoid validation issues
      Object.keys(updateData).forEach(key => {
        const value = updateData[key as keyof CompanyUpdateData]
        if (value === '') {
          delete updateData[key as keyof CompanyUpdateData]
        }
      })

      const result = await CompanyService.updateCompanySettings(updateData)

      if (result.success && result.data) {
        toast({
          title: "Success",
          description: "Company settings updated successfully",
        })
        onUpdate(result.data)
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (error: any) {
      console.error('Failed to update company settings:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update company settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
        <CardDescription>
          Update your organization's information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AWIB SACCOS Limited" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AWIB SACCOS" />
                      </FormControl>
                      <FormDescription>
                        Short name used in the interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="REG-12345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxIdentificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="TIN-123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="LIC-SACCO-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="establishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+255 123 456 789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+255 987 654 321" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="info@awibsaccos.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="support@awibsaccos.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.awibsaccos.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <FormField
                control={form.control}
                name="headOfficeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head Office Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Street address, building name, etc."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Arusha" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Arusha" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tanzania" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About Organization</h3>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Brief description of your organization..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vision Statement</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Your organization's vision..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Your organization's mission..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Core Values */}
              <div className="space-y-2">
                <FormLabel>Core Values</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Add a core value..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCoreValue()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCoreValue} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {coreValues.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coreValues.map((value, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {value}
                        <button
                          type="button"
                          onClick={() => removeCoreValue(value)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
