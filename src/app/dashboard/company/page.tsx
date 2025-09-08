'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Edit,
  TrendingUp,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import CompanyService, { CompanySettings, CompanyStats } from '@/lib/services/company/company.service'
import { CompanySettingsForm } from './components/CompanySettingsForm'
import { CompanyStatsCards } from './components/CompanyStatsCards'
import { CompanyHistoryTab } from './components/CompanyHistoryTab'
import { CompanyLogoUpload } from './components/CompanyLogoUpload'

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      const [companyData, statsData] = await Promise.all([
        CompanyService.getCompanySettings(),
        CompanyService.getCompanyStats()
      ])
      setCompany(companyData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load company data:', error)
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyUpdate = async (updatedCompany: CompanySettings) => {
    setCompany(updatedCompany)
    setIsEditing(false)
    await loadCompanyData() // Refresh stats in case they changed
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Company Information Found</h3>
          <p className="text-muted-foreground mb-4">
            Company settings have not been configured yet.
          </p>
          <Button onClick={() => setIsEditing(true)}>
            Set Up Company Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage your organization's information and settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={company.isInitialized ? "default" : "secondary"}>
            {company.isInitialized ? "Initialized" : "Pending Setup"}
          </Badge>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <CompanyStatsCards stats={stats} />}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic organization details and registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="font-medium">{company.companyName}</p>
                  </div>
                  
                  {company.displayName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                      <p className="font-medium">{company.displayName}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Code</label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{company.companyCode}</p>
                  </div>
                  
                  {company.registrationNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                      <p className="font-medium">{company.registrationNumber}</p>
                    </div>
                  )}
                  
                  {company.establishedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Established</label>
                        <p>{new Date(company.establishedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Communication channels and location details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {company.primaryPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Primary Phone</label>
                        <p>{company.primaryPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.secondaryPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Secondary Phone</label>
                        <p>{company.secondaryPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.primaryEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Primary Email</label>
                        <p>{company.primaryEmail}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.headOfficeAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Head Office</label>
                        <p className="text-sm">
                          {company.headOfficeAddress}
                          {company.city && `, ${company.city}`}
                          {company.region && `, ${company.region}`}
                          {company.country && `, ${company.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload and manage your organization's logo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyLogoUpload 
                  currentLogo={company.logo}
                  onLogoUpdate={loadCompanyData}
                />
              </CardContent>
            </Card>

            {/* Company Vision & Mission */}
            {(company.vision || company.mission || company.description) && (
              <Card>
                <CardHeader>
                  <CardTitle>About Us</CardTitle>
                  <CardDescription>
                    Our vision, mission, and core values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="mt-1 text-sm">{company.description}</p>
                    </div>
                  )}
                  
                  {company.vision && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vision</label>
                      <p className="mt-1 text-sm">{company.vision}</p>
                    </div>
                  )}
                  
                  {company.mission && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mission</label>
                      <p className="mt-1 text-sm">{company.mission}</p>
                    </div>
                  )}
                  
                  {company.coreValues && company.coreValues.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Core Values</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {company.coreValues.map((value, index) => (
                          <Badge key={index} variant="outline">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                System status and initialization details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${company.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm font-medium">
                      {company.isInitialized ? 'Fully Initialized' : 'Setup Pending'}
                    </span>
                  </div>
                </div>
                
                {company.initializedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initialized</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(company.initializedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(company.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <CompanySettingsForm 
            company={company}
            onUpdate={handleCompanyUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </TabsContent>

        <TabsContent value="history">
          <CompanyHistoryTab />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog/Modal would be controlled by isEditing state */}
    </div>
  )
}
