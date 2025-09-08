'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from "@/components/theme/theme-toggle"
import Link from "next/link"
import { Shield, Building2, Users2, BadgeCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCompanyInfo } from '@/hooks/useCompanyInfo'
import OnboardingService from '@/lib/services/onboarding.service'
import Image from "next/image"

export default function Home() {
  const router = useRouter();
  const { company, displayName, logo } = useCompanyInfo();
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemLoading, setSystemLoading] = useState(true);

  useEffect(() => {
    // Check system status without redirecting
    const checkStatus = async () => {
      try {
        const status = await OnboardingService.getSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('Failed to check system status:', error);
      } finally {
        setSystemLoading(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {logo ? (
            <img 
              src={logo} 
              alt={displayName}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Shield className="h-6 w-6 text-primary" />
          )}
          <span className="font-bold text-xl">{displayName}</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          {systemLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking system...</span>
            </div>
          ) : systemStatus?.needsOnboarding ? (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Setup required</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <BadgeCheck className="h-4 w-4" />
              <span>System ready</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* System Setup Alert */}
        {!systemLoading && systemStatus?.needsOnboarding && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <Alert className="border-amber-200 bg-amber-50 max-w-4xl mx-auto">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>System Setup Required:</strong> The SACCO system needs to be configured before use.{' '}
                <Link href="/onboarding" className="font-medium underline hover:no-underline">
                  Complete setup now
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=2070"
              alt="Office Background"
              fill
              className="object-cover object-center"
              priority
              quality={100}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="backdrop-blur-sm bg-background/30 p-8 rounded-2xl shadow-2xl border border-white/10">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AWIB SACCOS Financial Portal
              </h1>
              <p className="text-xl text-foreground/90 mb-8 max-w-2xl mx-auto">
                Empowering our staff with efficient financial management tools and seamless budget control
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-primary/90 hover:bg-primary/100 shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <Link href="/login">
                  Access Staff Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background/50 to-background">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-muted">
              <Building2 className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Department Management</h3>
              <p className="text-muted-foreground">Streamlined budget allocation and expense tracking for each department</p>
            </div>

            <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-muted">
              <Users2 className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Staff Access</h3>
              <p className="text-muted-foreground">Secure role-based access for all AWIB SACCOS staff members</p>
            </div>

            <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-muted">
              <BadgeCheck className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Expense Approval</h3>
              <p className="text-muted-foreground">Efficient expense request and approval workflow system</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-8 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">AWIB SACCOS LTD</span>
            </div>
            
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© {new Date().getFullYear()} AWIB SACCOS. All rights reserved.</p>
              <p className="mt-1">Secure • Reliable • Efficient</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
