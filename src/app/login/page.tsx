'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import Link from "next/link"
import { Shield, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter();
  const [showSystemWarning, setShowSystemWarning] = useState(false);

  useEffect(() => {
    // Add a small delay to show warning if SystemCheck hasn't redirected
    const timer = setTimeout(() => {
      setShowSystemWarning(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center px-4 border-b bg-background sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">AWIB SACCOS</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {showSystemWarning && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                If you're seeing this page, the system might not be properly initialized. 
                Contact your administrator if you need to set up the SACCO system.
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
        </div>
      </main>

      <footer className="flex h-16 items-center px-4 border-t bg-background text-sm text-muted-foreground sm:px-6">
        <div className="mx-auto">
          © 2025 WealthGuard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
