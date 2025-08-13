"use client"

import Link from "next/link"
import { Shield, ArrowRight, BarChart3, Lock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background pointer-events-none" />

      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="flex items-center text-primary space-x-2">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-semibold">WealthGuard</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Secure Your Financial Future
          </h1>

          <p className="text-xl text-muted-foreground">
            Powerful financial management platform to help you track, manage, and grow your wealth with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button asChild size="lg" className="flex-1">
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg p-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Portfolio Tracking</h3>
            <p className="text-muted-foreground">
              Track all your investments in one place with real-time dashboards and insights.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Bank-Level Security</h3>
            <p className="text-muted-foreground">
              Your financial data is protected with enterprise-grade encryption and security protocols.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Wealth Planning</h3>
            <p className="text-muted-foreground">
              Advanced tools to plan your financial future and achieve your wealth goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
