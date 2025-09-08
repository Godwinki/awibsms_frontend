'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingService, { SystemStatus } from '@/lib/services/onboarding.service';

// Simple loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Checking system status...</p>
        
      </div>
    </div>
  );
}

interface FormData {
  companyInfo: {
    companyName: string;
    companyCode: string;
    registrationNumber: string;
    taxIdentificationNumber: string;
    licenseNumber: string;
    establishedDate: string;
    headOfficeAddress: string;
    city: string;
    region: string;
    country: string;
    primaryPhone: string;
    primaryEmail: string;
    website: string;
  };
  mainBranchInfo: {
    name: string;
    branchCode: string;
    displayName: string;
    region: string;
    district: string;
    ward: string;
    street: string;
    primaryPhone: string;
    email: string;
    servicesOffered: string[];
  };
  adminUserInfo: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    nationalId: string;
    dateOfBirth: string;
  };
  setupOptions: {
    createSampleData: boolean;
    forcePasswordChange: boolean;
    enableNotifications: boolean;
    autoActivateFeatures: boolean;
  };
}

const ONBOARDING_STEPS = [
  { id: 'company', title: 'Organization Details', description: 'Basic company information' },
  { id: 'branch', title: 'Main Branch', description: 'Primary branch setup' },
  { id: 'admin', title: 'Administrator', description: 'Create admin user' },
  { id: 'setup', title: 'Final Setup', description: 'Configuration options' }
];

function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    companyInfo: {
      companyName: '',
      companyCode: '',
      registrationNumber: '',
      taxIdentificationNumber: '',
      licenseNumber: '',
      establishedDate: '',
      headOfficeAddress: '',
      city: 'Arusha',
      region: 'Arusha',
      country: 'Tanzania',
      primaryPhone: '',
      primaryEmail: '',
      website: ''
    },
    mainBranchInfo: {
      name: '',
      branchCode: '',
      displayName: '',
      region: 'Arusha',
      district: '',
      ward: '',
      street: '',
      primaryPhone: '',
      email: '',
      servicesOffered: ['savings', 'loans', 'shares']
    },
    adminUserInfo: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      nationalId: '',
      dateOfBirth: ''
    },
    setupOptions: {
      createSampleData: false,
      forcePasswordChange: true,
      enableNotifications: true,
      autoActivateFeatures: true
    }
  });

  // Check system status on component mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const statusData = await OnboardingService.getSystemStatus();
      setSystemStatus(statusData);
      
      // If system is already initialized, redirect to login
      if (statusData.isInitialized || !statusData.needsOnboarding) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const handleInputChange = (step: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`${step}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${step}.${field}`];
        return newErrors;
      });
    }
  };

  const validateStep = async (stepIndex: number) => {
    const step = ONBOARDING_STEPS[stepIndex];
    let stepData: any;
    
    switch (step.id) {
      case 'company':
        stepData = formData.companyInfo;
        break;
      case 'branch':
        stepData = formData.mainBranchInfo;
        break;
      case 'admin':
        stepData = formData.adminUserInfo;
        break;
      case 'setup':
        stepData = formData.setupOptions;
        break;
      default:
        stepData = {};
    }
    
    try {
      const result = await OnboardingService.validateStep(step.id, stepData);
      
      if (!result.success && result.errors) {
        const newErrors: Record<string, string> = {};
        result.errors.forEach(error => {
          newErrors[`${step.id}.${error.field}`] = error.message;
        });
        setErrors(newErrors);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const result = await OnboardingService.startOnboarding(formData);
      
      if (result.success) {
        // Show success message and redirect to login
        alert('🎉 SACCO system initialized successfully! Please login with your admin credentials.');
        router.push('/login');
      } else {
        if (result.errors) {
          const newErrors: Record<string, string> = {};
          result.errors.forEach(error => {
            newErrors[error.field] = error.message;
          });
          setErrors(newErrors);
        } else {
          alert(result.message || 'Onboarding failed');
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Onboarding failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'company':
        return (
          <CompanyInfoStep 
            data={formData.companyInfo}
            errors={errors}
            onChange={(field: string, value: any) => handleInputChange('companyInfo', field, value)}
          />
        );
      case 'branch':
        return (
          <BranchInfoStep 
            data={formData.mainBranchInfo}
            errors={errors}
            onChange={(field: string, value: any) => handleInputChange('mainBranchInfo', field, value)}
          />
        );
      case 'admin':
        return (
          <AdminUserStep 
            data={formData.adminUserInfo}
            errors={errors}
            onChange={(field: string, value: any) => handleInputChange('adminUserInfo', field, value)}
          />
        );
      case 'setup':
        return (
          <SetupOptionsStep 
            data={formData.setupOptions}
            errors={errors}
            onChange={(field: string, value: any) => handleInputChange('setupOptions', field, value)}
          />
        );
      default:
        return null;
    }
  };

  // Show loading if system status is being checked
  if (systemStatus === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SACCO System Setup</h1>
          <p className="text-gray-600">
            Welcome! Let's set up your SACCO organization step by step.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold
                  ${index <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">
              Step {currentStep + 1}: {ONBOARDING_STEPS[currentStep].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {ONBOARDING_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up SACCO...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
interface StepProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

function CompanyInfoStep({ data, errors, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
        <p className="text-gray-600 mb-6">
          Provide basic information about your SACCO organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder="e.g., Kilimanjaro Teachers SACCO"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['company.companyName'] ? 'border-red-500' : ''
            }`}
          />
          {errors['company.companyName'] && (
            <p className="text-red-500 text-sm mt-1">{errors['company.companyName']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Code *
          </label>
          <input
            type="text"
            value={data.companyCode}
            onChange={(e) => onChange('companyCode', e.target.value.toUpperCase())}
            placeholder="e.g., KTSC"
            maxLength={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['company.companyCode'] ? 'border-red-500' : ''
            }`}
          />
          {errors['company.companyCode'] && (
            <p className="text-red-500 text-sm mt-1">{errors['company.companyCode']}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">4 characters, letters and numbers only</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Phone
          </label>
          <input
            type="text"
            value={data.primaryPhone}
            onChange={(e) => onChange('primaryPhone', e.target.value)}
            placeholder="+255 123 456 789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Email
          </label>
          <input
            type="email"
            value={data.primaryEmail}
            onChange={(e) => onChange('primaryEmail', e.target.value)}
            placeholder="info@yoursacco.co.tz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Established Date
          </label>
          <input
            type="date"
            value={data.establishedDate}
            onChange={(e) => onChange('establishedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://yoursacco.co.tz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Head Office Address
        </label>
        <textarea
          value={data.headOfficeAddress}
          onChange={(e) => onChange('headOfficeAddress', e.target.value)}
          placeholder="Complete physical address of your head office"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function BranchInfoStep({ data, errors, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Main Branch Setup</h3>
        <p className="text-gray-600 mb-6">
          Configure your primary branch location and services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., Main Branch"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['branch.name'] ? 'border-red-500' : ''
            }`}
          />
          {errors['branch.name'] && (
            <p className="text-red-500 text-sm mt-1">{errors['branch.name']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Code *
          </label>
          <input
            type="text"
            value={data.branchCode}
            onChange={(e) => onChange('branchCode', e.target.value)}
            placeholder="e.g., 0001"
            maxLength={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['branch.branchCode'] ? 'border-red-500' : ''
            }`}
          />
          {errors['branch.branchCode'] && (
            <p className="text-red-500 text-sm mt-1">{errors['branch.branchCode']}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">4 digits, numbers only</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Phone
          </label>
          <input
            type="text"
            value={data.primaryPhone}
            onChange={(e) => onChange('primaryPhone', e.target.value)}
            placeholder="+255 123 456 789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="main@yoursacco.co.tz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={data.displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
            placeholder="e.g., AWIB Main Branch"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <input
            type="text"
            value={data.district}
            onChange={(e) => onChange('district', e.target.value)}
            placeholder="e.g., Arusha Urban"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ward
          </label>
          <input
            type="text"
            value={data.ward}
            onChange={(e) => onChange('ward', e.target.value)}
            placeholder="e.g., Kaloleni"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <input
            type="text"
            value={data.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="e.g., Sokoine Road"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function AdminUserStep({ data, errors, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Administrator Account</h3>
        <p className="text-gray-600 mb-6">
          Create the main administrator account for your SACCO system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="John"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.firstName'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.firstName'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.firstName']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Doe"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.lastName'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.lastName'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.lastName']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="admin@yoursacco.co.tz"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.email'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.email'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.email']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+255 123 456 789"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.phone'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.phone'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.phone']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Strong password"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.password'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.password'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.password']}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Must contain uppercase, lowercase, number and special character
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            value={data.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Repeat password"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['admin.confirmPassword'] ? 'border-red-500' : ''
            }`}
          />
          {errors['admin.confirmPassword'] && (
            <p className="text-red-500 text-sm mt-1">{errors['admin.confirmPassword']}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupOptionsStep({ data, errors, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
        <p className="text-gray-600 mb-6">
          Configure initial system settings and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <input
            type="checkbox"
            id="createSampleData"
            checked={data.createSampleData}
            onChange={(e) => onChange('createSampleData', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <div>
            <label htmlFor="createSampleData" className="font-medium">
              Create Sample Data
            </label>
            <p className="text-gray-600 text-sm">
              Add sample members, accounts, and transactions for testing purposes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <input
            type="checkbox"
            id="forcePasswordChange"
            checked={data.forcePasswordChange}
            onChange={(e) => onChange('forcePasswordChange', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <div>
            <label htmlFor="forcePasswordChange" className="font-medium">
              Force Password Change on First Login
            </label>
            <p className="text-gray-600 text-sm">
              Require users to change their password when they first log in.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <input
            type="checkbox"
            id="enableNotifications"
            checked={data.enableNotifications}
            onChange={(e) => onChange('enableNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <div>
            <label htmlFor="enableNotifications" className="font-medium">
              Enable Email Notifications
            </label>
            <p className="text-gray-600 text-sm">
              Send email notifications for important system events and updates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <input
            type="checkbox"
            id="autoActivateFeatures"
            checked={data.autoActivateFeatures}
            onChange={(e) => onChange('autoActivateFeatures', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <div>
            <label htmlFor="autoActivateFeatures" className="font-medium">
              Auto-activate Core Features
            </label>
            <p className="text-gray-600 text-sm">
              Automatically enable essential SACCO features like savings, loans, and shares.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          💡 These settings can be changed later from the system administration panel.
        </p>
      </div>
    </div>
  );
}

export default OnboardingPage;
