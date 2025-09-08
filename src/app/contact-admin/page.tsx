'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MessageCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function ContactAdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Contact Administrator</CardTitle>
          <CardDescription>
            Need help with your account? Get in touch with our support team.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              If your account is locked, please contact an administrator to request an unlock. 
              Once approved, you'll receive an email with instructions to unlock your account and reset your password.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How to get help:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Send an email with your details and the issue you're experiencing
                  </p>
                  <a 
                    href="mailto:support@awibsms.com?subject=Account%20Access%20Request"
                    className="text-primary hover:underline text-sm"
                  >
                    support@awibsms.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Phone Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Call during business hours for immediate assistance
                  </p>
                  <p className="text-primary font-medium">+1 (555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Monday - Friday, 9AM - 5PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <MessageCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">In-Person Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visit the office during business hours
                  </p>
                  <p className="text-sm">
                    123 Main Street<br />
                    Business District<br />
                    City, State 12345
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Account Locked?</h4>
            <p className="text-sm text-amber-700">
              If your account is locked due to multiple failed login attempts, please contact an administrator. 
              They will verify your identity and send you an unlock email with instructions to regain access to your account.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            <Button 
              onClick={() => window.location.href = 'mailto:support@awibsms.com?subject=Account%20Access%20Request'}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
