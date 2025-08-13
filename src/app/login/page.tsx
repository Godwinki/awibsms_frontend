import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import Link from "next/link"
import { Shield } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - WealthGuard",
  description: "Login to your WealthGuard account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center px-4 border-b bg-background sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">WealthGuard</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </main>

      <footer className="flex h-16 items-center px-4 border-t bg-background text-sm text-muted-foreground sm:px-6">
        <div className="mx-auto">
          © 2025 WealthGuard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
