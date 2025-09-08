"use client"

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/lib/services/auth.service'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { ChevronLeft, Check } from 'lucide-react'

export default function TestTwoFactorAuth() {
  const { toast } = useToast()
  const [testEnabled, setTestEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  // This function would simulate enabling 2FA on a test user
  // In production, you would have a user settings page for this
  const enableTestMode = async () => {
    setLoading(true)
    try {
      // This endpoint would be created specifically for testing
      // It would enable 2FA on a test user and return success
      await fetch('/api/v1/auth/2fa/enable-test-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      setTestEnabled(true)
      toast({
        title: "Test Mode Enabled",
        description: "2FA is now enabled on the test user account. Try logging in with email: test@example.com and password: test123",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable test mode. Please check the console for details.",
        variant: "destructive",
      })
      console.error("Error enabling test mode:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Link 
        href="/dashboard" 
        className="flex items-center text-sm text-primary hover:underline mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication Test</CardTitle>
          <CardDescription>
            Use this page to test the complete 2FA login flow end-to-end
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              This test will simulate a login flow with 2FA enabled. First, click the button below to enable 2FA on the test user, then use the login form to test the 2FA flow.
            </p>
            
            <div className="flex justify-between items-center p-3 rounded-md bg-gray-50 mb-4">
              <div>
                <p className="font-medium">Test Credentials:</p>
                <p className="text-sm text-gray-500">Email: test@example.com</p>
                <p className="text-sm text-gray-500">Password: test123</p>
              </div>
              {testEnabled && (
                <div className="bg-green-100 text-green-800 p-1 px-2 rounded-full text-xs flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  2FA Enabled
                </div>
              )}
            </div>
            
            <Button 
              onClick={enableTestMode} 
              disabled={loading || testEnabled}
              className="w-full"
            >
              {loading ? "Enabling..." : testEnabled ? "Test Mode Enabled" : "Enable 2FA Test Mode"}
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Login Form</h3>
            <LoginForm />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
