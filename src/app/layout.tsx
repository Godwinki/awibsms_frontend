import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "AWIB SACCOS - Staff Financial Management System",
  description: "Internal financial management system for AWIB SACCOS LTD staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head />
      <body>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            {children}
          </ThemeProvider>
        </AuthProvider>
        {/* Include both toast systems to ensure compatibility with all components */}
        <ShadcnToaster />
        <SonnerToaster position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
